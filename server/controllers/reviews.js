// ============================================
// REVIEWS CONTROLLER
// ============================================

const pool = require('../config/db');

// ============================================
// CREATE OR UPDATE REVIEW
// ============================================
const createOrUpdateReview = async (req, res) => {
  try {
    const { album_id, rating, review_text, is_public = true } = req.body;
    const user_id = req.user.user_id;

    // Validation
    if (!album_id) {
      return res.status(400).json({ error: 'Album ID is required' });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({ error: 'Rating is required' });
    }

    if (rating < 0 || rating > 10) {
      return res.status(400).json({ 
        error: 'Rating must be between 0 and 10' 
      });
    }

    // Check if album exists
    const albumCheck = await pool.query(
      'SELECT album_id FROM albums WHERE album_id = $1',
      [album_id]
    );

    if (albumCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Check if user already reviewed this album
    const existingReview = await pool.query(
      'SELECT review_id FROM reviews WHERE user_id = $1 AND album_id = $2',
      [user_id, album_id]
    );

    let review;
    
    if (existingReview.rows.length > 0) {
      // Update existing review
      review = await pool.query(`
        UPDATE reviews 
        SET rating = $1, review_text = $2, is_public = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4 AND album_id = $5
        RETURNING *
      `, [rating, review_text, is_public, user_id, album_id]);

      // Get album info for response
      const albumInfo = await pool.query(`
        SELECT a.title, ar.name as artist_name
        FROM albums a
        JOIN artists ar ON a.artist_id = ar.artist_id
        WHERE a.album_id = $1
      `, [album_id]);

      res.json({
        message: 'Review updated successfully',
        review: {
          ...review.rows[0],
          album_title: albumInfo.rows[0].title,
          artist_name: albumInfo.rows[0].artist_name
        }
      });
    } else {
      // Create new review
      review = await pool.query(`
        INSERT INTO reviews (user_id, album_id, rating, review_text, is_public)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [user_id, album_id, rating, review_text, is_public]);

      // Get album info for response
      const albumInfo = await pool.query(`
        SELECT a.title, ar.name as artist_name
        FROM albums a
        JOIN artists ar ON a.artist_id = ar.artist_id
        WHERE a.album_id = $1
      `, [album_id]);

      res.status(201).json({
        message: 'Review created successfully',
        review: {
          ...review.rows[0],
          album_title: albumInfo.rows[0].title,
          artist_name: albumInfo.rows[0].artist_name
        }
      });
    }

  } catch (error) {
    console.error('Create/Update review error:', error);
    res.status(500).json({ error: 'Server error creating/updating review' });
  }
};

// ============================================
// GET USER'S REVIEWS
// ============================================
const getUserReviews = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { limit = 20, offset = 0, sort = 'created_at', order = 'DESC' } = req.query;

    // Check if requesting user's own reviews or someone else's
    const requestingOwnReviews = req.user && req.user.user_id === user_id;

    let query = `
      SELECT 
        r.*,
        a.album_id,
        a.title as album_title,
        a.cover_art_url,
        a.release_date,
        ar.artist_id,
        ar.name as artist_name
      FROM reviews r
      JOIN albums a ON r.album_id = a.album_id
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE r.user_id = $1
    `;

    // Only show public reviews unless viewing own reviews
    if (!requestingOwnReviews) {
      query += ' AND r.is_public = true';
    }

    const validSortFields = ['created_at', 'updated_at', 'rating'];
    const validOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    query += ` ORDER BY r.${sortField} ${sortOrder}`;
    query += ` LIMIT $2 OFFSET $3`;

    const reviews = await pool.query(query, [user_id, limit, offset]);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE user_id = $1';
    if (!requestingOwnReviews) {
      countQuery += ' AND is_public = true';
    }
    const totalCount = await pool.query(countQuery, [user_id]);

    // Get user info
    const userInfo = await pool.query(
      'SELECT username, display_name, profile_picture_url FROM users WHERE user_id = $1',
      [user_id]
    );

    res.json({
      user: userInfo.rows[0],
      reviews: reviews.rows,
      pagination: {
        total: parseInt(totalCount.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Server error fetching reviews' });
  }
};

// ============================================
// GET ALBUM REVIEWS
// ============================================
const getAlbumReviews = async (req, res) => {
  try {
    const { album_id } = req.params;
    const { limit = 20, offset = 0, sort = 'created_at', order = 'DESC' } = req.query;

    const reviews = await pool.query(`
      SELECT 
        r.*,
        u.user_id,
        u.username,
        u.display_name,
        u.profile_picture_url
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.album_id = $1 AND r.is_public = true
      ORDER BY r.${sort === 'rating' ? 'rating' : 'created_at'} ${order === 'ASC' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `, [album_id, limit, offset]);

    // Get total count
    const totalCount = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE album_id = $1 AND is_public = true',
      [album_id]
    );

    // Get album info
    const albumInfo = await pool.query(`
      SELECT 
        a.title, 
        a.average_rating, 
        a.rating_count,
        ar.name as artist_name
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE a.album_id = $1
    `, [album_id]);

    if (albumInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }

    res.json({
      album: albumInfo.rows[0],
      reviews: reviews.rows,
      pagination: {
        total: parseInt(totalCount.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get album reviews error:', error);
    res.status(500).json({ error: 'Server error fetching album reviews' });
  }
};

// ============================================
// DELETE REVIEW
// ============================================
const deleteReview = async (req, res) => {
  try {
    const { album_id } = req.params;
    const user_id = req.user.user_id;

    // Check if review exists and belongs to user
    const review = await pool.query(
      'SELECT review_id FROM reviews WHERE user_id = $1 AND album_id = $2',
      [user_id, album_id]
    );

    if (review.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Review not found or you do not have permission to delete it' 
      });
    }

    // Delete review (trigger will auto-update album rating)
    await pool.query(
      'DELETE FROM reviews WHERE user_id = $1 AND album_id = $2',
      [user_id, album_id]
    );

    res.json({ message: 'Review deleted successfully' });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error deleting review' });
  }
};

// ============================================
// GET SINGLE REVIEW (user's review for specific album)
// ============================================
const getUserAlbumReview = async (req, res) => {
  try {
    const { album_id } = req.params;
    const user_id = req.user.user_id;

    const review = await pool.query(`
      SELECT 
        r.*,
        a.title as album_title,
        a.cover_art_url,
        ar.name as artist_name
      FROM reviews r
      JOIN albums a ON r.album_id = a.album_id
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE r.user_id = $1 AND r.album_id = $2
    `, [user_id, album_id]);

    if (review.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review: review.rows[0] });

  } catch (error) {
    console.error('Get user album review error:', error);
    res.status(500).json({ error: 'Server error fetching review' });
  }
};

module.exports = {
  createOrUpdateReview,
  getUserReviews,
  getAlbumReviews,
  deleteReview,
  getUserAlbumReview
};