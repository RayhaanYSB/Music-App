import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await userAPI.getProfile(username);
      setProfile(profileResponse.data);
      setIsFollowing(profileResponse.data.isFollowing);

      // Load user reviews
      const reviewsResponse = await reviewAPI.getUserReviews(
        profileResponse.data.user.user_id,
        { limit: 50 }
      );
      setReviews(reviewsResponse.data.reviews);

    } catch (err) {
      setError('User not found or error loading profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await userAPI.toggleFollow(username);
      setIsFollowing(response.data.isFollowing);
      
      // Reload profile to update follower count
      loadProfile();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '50px 20px' }}>Loading...</div>;
  }

  if (error || !profile) {
    return <div className="container" style={{ padding: '50px 20px' }}>{error || 'User not found'}</div>;
  }

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.user.profile_picture_url ? (
              <img src={profile.user.profile_picture_url} alt={profile.user.display_name} />
            ) : (
              <div className="avatar-placeholder">
                {profile.user.display_name?.[0]?.toUpperCase() || profile.user.username[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-name-row">
              <div>
                <h1>{profile.user.display_name || profile.user.username}</h1>
                <p className="username-handle">@{profile.user.username}</p>
              </div>
              
              {isAuthenticated && !isOwnProfile && (
                <button 
                  onClick={handleFollowToggle}
                  className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              )}

              {isOwnProfile && (
                <Link to="/settings" className="btn btn-secondary">
                  Edit Profile
                </Link>
              )}
            </div>

            {profile.user.bio && (
              <p className="profile-bio">{profile.user.bio}</p>
            )}

            <div className="profile-meta">
              <span>Joined {new Date(profile.user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>

            <div className="profile-stats-row">
              <div className="stat-item">
                <span className="stat-number">{profile.stats.reviewCount}</span>
                <span className="stat-label">Reviews</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profile.stats.averageRating.toFixed(1)}</span>
                <span className="stat-label">Avg Rating</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profile.stats.albumsListened}</span>
                <span className="stat-label">Albums Listened</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profile.stats.followers}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{profile.stats.following}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="profile-reviews">
          <h2>Reviews ({reviews.length})</h2>

          {reviews.length === 0 ? (
            <p className="no-reviews">
              {isOwnProfile 
                ? "You haven't reviewed any albums yet. Start exploring!" 
                : "This user hasn't reviewed any albums yet."}
            </p>
          ) : (
            <div className="reviews-grid">
              {reviews.map((review) => (
                <Link 
                  to={`/albums/${review.album_id}`} 
                  key={review.review_id}
                  className="review-item"
                >
                  <div className="review-album-cover">
                    {review.cover_art_url ? (
                      <img src={review.cover_art_url} alt={review.album_title} />
                    ) : (
                      <div className="album-cover-placeholder-small">🎵</div>
                    )}
                    <div className="review-rating-overlay">
                      {parseFloat(review.rating).toFixed(1)}
                    </div>
                  </div>
                  <div className="review-album-info">
                    <h4>{review.album_title}</h4>
                    <p className="review-artist">{review.artist_name}</p>
                    {review.review_text && (
                      <p className="review-preview">{review.review_text.substring(0, 100)}{review.review_text.length > 100 ? '...' : ''}</p>
                    )}
                    <p className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;