import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { albumAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AlbumDetail.css';

const AlbumDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  
  const [album, setAlbum] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAlbumData();
  }, [id]);

  const loadAlbumData = async () => {
    try {
      setLoading(true);
      
      // Load album details
      const albumResponse = await albumAPI.getById(id);
      setAlbum(albumResponse.data.album);
      setReviews(albumResponse.data.recentReviews || []);

      // Load user's review if logged in
      if (isAuthenticated) {
        try {
          const myReviewResponse = await reviewAPI.getMyReview(id);
          setMyReview(myReviewResponse.data.review);
          setRating(parseFloat(myReviewResponse.data.review.rating));
          setReviewText(myReviewResponse.data.review.review_text || '');
        } catch (err) {
          // No review yet - that's okay
          setMyReview(null);
        }
      }
    } catch (err) {
      setError('Failed to load album details');
      console.error('Error loading album:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await reviewAPI.create({
        album_id: id,
        rating: rating,
        review_text: reviewText,
        is_public: true
      });

      // Reload album data to show updated review
      await loadAlbumData();
      setShowReviewForm(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await reviewAPI.delete(id);
      await loadAlbumData();
      setMyReview(null);
      setRating(5);
      setReviewText('');
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '50px 20px' }}>Loading...</div>;
  }

  if (!album) {
    return <div className="container" style={{ padding: '50px 20px' }}>Album not found</div>;
  }

  return (
    <div className="album-detail">
      <div className="container">
        {/* Album Header */}
        <div className="album-header">
          <div className="album-cover-large">
            {album.cover_art_url ? (
              <img src={album.cover_art_url} alt={album.title} />
            ) : (
              <div className="album-cover-placeholder-large">🎵</div>
            )}
          </div>

          <div className="album-header-info">
            <h1>{album.title}</h1>
            <h2 className="artist-name-large">{album.artist_name}</h2>
            
            {album.release_date && (
              <p className="release-date">
                {new Date(album.release_date).getFullYear()}
              </p>
            )}
            
            {album.genre && (
              <span className="genre-badge">{album.genre}</span>
            )}

            <div className="album-stats">
              {album.rating_count > 0 ? (
                <>
                  <div className="avg-rating">
                    <span className="rating-number">{parseFloat(album.average_rating).toFixed(1)}</span>
                    <span className="rating-label">/ 10</span>
                  </div>
                  <p className="rating-count">{album.rating_count} {album.rating_count === 1 ? 'rating' : 'ratings'}</p>
                </>
              ) : (
                <p className="no-ratings">No ratings yet. Be the first!</p>
              )}
            </div>

            {isAuthenticated && (
              <div className="action-buttons">
                {myReview ? (
                  <>
                    <div className="my-rating-display">
                      <span>Your rating: </span>
                      <strong>{parseFloat(myReview.rating).toFixed(1)} / 10</strong>
                    </div>
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)} 
                      className="btn btn-secondary"
                    >
                      {showReviewForm ? 'Cancel' : 'Edit Review'}
                    </button>
                    <button 
                      onClick={handleDeleteReview} 
                      className="btn btn-danger"
                    >
                      Delete Review
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setShowReviewForm(!showReviewForm)} 
                    className="btn btn-primary"
                  >
                    {showReviewForm ? 'Cancel' : 'Rate This Album'}
                  </button>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <p className="login-prompt">
                <Link to="/login">Login</Link> to rate this album
              </p>
            )}
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && isAuthenticated && (
          <div className="review-form-container">
            <h3>{myReview ? 'Edit Your Review' : 'Rate This Album'}</h3>
            
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Your Rating: {rating.toFixed(1)} / 10</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="rating-slider"
                />
                <div className="rating-labels">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="form-group">
                <label>Review (optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this album..."
                  rows="4"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : (myReview ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <h3>Reviews ({reviews.length})</h3>
          
          {reviews.length === 0 ? (
            <p className="no-reviews">No reviews yet. Be the first to review this album!</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.review_id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <Link to={`/profile/${review.username}`} className="reviewer-name">
                        {review.display_name || review.username}
                      </Link>
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="review-rating">
                      {parseFloat(review.rating).toFixed(1)} / 10
                    </div>
                  </div>
                  {review.review_text && (
                    <p className="review-text">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlbumDetail;