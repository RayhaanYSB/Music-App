// ============================================
// AUTHENTICATION ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================

// POST /api/auth/register - Create new account
router.post('/register', register);

// POST /api/auth/login - Login to existing account
router.post('/login', login);

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================

// GET /api/auth/me - Get current logged-in user
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;