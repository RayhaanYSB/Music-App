// ============================================
// REVIEW ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { 
  createOrUpdateReview,
  getUserReviews,
  getAlbumReviews,
  deleteReview,
  getUserAlbumReview
} = require('../controllers/reviews');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================

// POST /api/reviews - Create or update a review
router.post('/', authenticateToken, createOrUpdateReview);

// GET /api/reviews/my-review/:album_id - Get current user's review for specific album
router.get('/my-review/:album_id', authenticateToken, getUserAlbumReview);

// DELETE /api/reviews/:album_id - Delete user's review for specific album
router.delete('/:album_id', authenticateToken, deleteReview);

// ============================================
// PUBLIC ROUTES (no auth required, but auth is optional)
// ============================================

// GET /api/reviews/user/:user_id - Get all reviews by a specific user
router.get('/user/:user_id', optionalAuth, getUserReviews);

// GET /api/reviews/album/:album_id - Get all reviews for a specific album
router.get('/album/:album_id', getAlbumReviews);

module.exports = router;