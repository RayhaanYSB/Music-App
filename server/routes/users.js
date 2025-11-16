// ============================================
// USER ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { 
  getUserProfile,
  updateUserProfile,
  changePassword,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserFavorites,
  getUserRadar,
} = require('../controllers/users');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (with optional auth)
// ============================================

// GET /api/users/:username - Get user profile
router.get('/:username', optionalAuth, getUserProfile);

// GET /api/users/:username/followers - Get user's followers
router.get('/:username/followers', getFollowers);

// GET /api/users/:username/following - Get users they follow
router.get('/:username/following', getFollowing);

// User's favourite albums
router.get('/:username/favorites', optionalAuth, getUserFavorites);

// User's "On My Radar" albums
router.get('/:username/radar', optionalAuth, getUserRadar);

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================

// PUT /api/users/profile - Update own profile
router.put('/profile', authenticateToken, updateUserProfile);

// PUT /api/users/password - Change password
router.put('/password', authenticateToken, changePassword);

// POST /api/users/:username/follow - Follow/unfollow user
router.post('/:username/follow', authenticateToken, toggleFollow);

module.exports = router;