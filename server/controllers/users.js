// ============================================
// USERS CONTROLLER
// ============================================

const pool = require('../config/db');
const bcrypt = require('bcrypt');

// ============================================
// GET USER PROFILE
// ============================================
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    // Get user basic info
    const user = await pool.query(`
      SELECT 
        user_id, 
        username, 
        display_name, 
        bio, 
        profile_picture_url, 
        created_at
      FROM users 
      WHERE username = $1
    `, [username]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = user.rows[0].user_id;

    // Get user stats
    const reviewCount = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE user_id = $1 AND is_public = true',
      [userId]
    );

    const averageRating = await pool.query(
      'SELECT AVG(rating) FROM reviews WHERE user_id = $1 AND is_public = true',
      [userId]
    );

    const albumListenCount = await pool.query(
      'SELECT COUNT(DISTINCT album_id) FROM album_listens WHERE user_id = $1',
      [userId]
    );

    // Get follower/following counts
    const followerCount = await pool.query(
      'SELECT COUNT(*) FROM follows WHERE following_id = $1',
      [userId]
    );

    const followingCount = await pool.query(
      'SELECT COUNT(*) FROM follows WHERE follower_id = $1',
      [userId]
    );

    // Check if current user is following this profile
    let isFollowing = false;
    if (req.user && req.user.user_id !== userId) {
      const followCheck = await pool.query(
        'SELECT follow_id FROM follows WHERE follower_id = $1 AND following_id = $2',
        [req.user.user_id, userId]
      );
      isFollowing = followCheck.rows.length > 0;
    }

    // Get recent reviews (top 5)
    const recentReviews = await pool.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.review_text,
        r.created_at,
        a.album_id,
        a.title as album_title,
        a.cover_art_url,
        ar.name as artist_name
      FROM reviews r
      JOIN albums a ON r.album_id = a.album_id
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE r.user_id = $1 AND r.is_public = true
      ORDER BY r.created_at DESC
      LIMIT 5
    `, [userId]);

    res.json({
      user: user.rows[0],
      stats: {
        reviewCount: parseInt(reviewCount.rows[0].count),
        averageRating: parseFloat(averageRating.rows[0].avg) || 0,
        albumsListened: parseInt(albumListenCount.rows[0].count),
        followers: parseInt(followerCount.rows[0].count),
        following: parseInt(followingCount.rows[0].count)
      },
      isFollowing,
      recentReviews: recentReviews.rows
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};

// ============================================
// UPDATE USER PROFILE
// ============================================
const updateUserProfile = async (req, res) => {
  try {
    const { display_name, bio, profile_picture_url } = req.body;
    const user_id = req.user.user_id;

    const updatedUser = await pool.query(`
      UPDATE users 
      SET 
        display_name = COALESCE($1, display_name),
        bio = COALESCE($2, bio),
        profile_picture_url = COALESCE($3, profile_picture_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $4
      RETURNING user_id, username, email, display_name, bio, profile_picture_url, created_at, updated_at
    `, [display_name, bio, profile_picture_url, user_id]);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user_id = req.user.user_id;

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get current password hash
    const user = await pool.query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [user_id]
    );

    // Verify current password
    const validPassword = await bcrypt.compare(
      current_password, 
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const new_password_hash = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [new_password_hash, user_id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error changing password' });
  }
};

// ============================================
// FOLLOW/UNFOLLOW USER
// ============================================
const toggleFollow = async (req, res) => {
  try {
    const { username } = req.params;
    const follower_id = req.user.user_id;

    // Get the user to follow
    const userToFollow = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    if (userToFollow.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following_id = userToFollow.rows[0].user_id;

    // Can't follow yourself
    if (follower_id === following_id) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    // Check if already following
    const existingFollow = await pool.query(
      'SELECT follow_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [follower_id, following_id]
    );

    if (existingFollow.rows.length > 0) {
      // Unfollow
      await pool.query(
        'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
        [follower_id, following_id]
      );

      res.json({ 
        message: 'Unfollowed successfully',
        isFollowing: false 
      });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
        [follower_id, following_id]
      );

      res.json({ 
        message: 'Followed successfully',
        isFollowing: true 
      });
    }

  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ error: 'Server error toggling follow' });
  }
};

// ============================================
// GET USER'S FOLLOWERS
// ============================================
const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;

    // Get user ID
    const user = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const followers = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.display_name,
        u.profile_picture_url,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.user_id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `, [user.rows[0].user_id]);

    res.json({ followers: followers.rows });

  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Server error fetching followers' });
  }
};

// ============================================
// GET USER'S FOLLOWING
// ============================================
const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;

    // Get user ID
    const user = await pool.query(
      'SELECT user_id FROM users WHERE username = $1',
      [username]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const following = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.display_name,
        u.profile_picture_url,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.following_id = u.user_id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `, [user.rows[0].user_id]);

    res.json({ following: following.rows });

  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Server error fetching following' });
  }
};

// ============================================
// GET USER FAVORITE ALBUMS
// ============================================
const getUserFavorites = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `
      SELECT 
        a.album_id,
        a.title,
        a.cover_art_url,
        a.average_rating,
        a.rating_count,
        a.release_date,
        ar.name AS artist_name
      FROM favorites f
      JOIN users u ON f.user_id = u.user_id
      JOIN albums a ON f.album_id = a.album_id
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE u.username = $1
      ORDER BY f.created_at DESC
      `,
      [username]
    );

    res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Get user favorites error:', error);
    res.status(500).json({ error: 'Server error fetching favorites' });
  }
};

// ============================================
// GET USER RADAR ALBUMS ("On My Radar")
// ============================================
const getUserRadar = async (req, res) => {
  try {
    const { username } = req.params;

    const result = await pool.query(
      `
      SELECT 
        a.album_id,
        a.title,
        a.cover_art_url,
        a.average_rating,
        a.rating_count,
        a.release_date,
        ar.name AS artist_name
      FROM radar_albums r
      JOIN users u ON r.user_id = u.user_id
      JOIN albums a ON r.album_id = a.album_id
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE u.username = $1
      ORDER BY r.created_at DESC
      `,
      [username]
    );

    res.json({ radar: result.rows });
  } catch (error) {
    console.error('Get user radar error:', error);
    res.status(500).json({ error: 'Server error fetching radar albums' });
  }
};


module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserFavorites,
  getUserRadar
};
