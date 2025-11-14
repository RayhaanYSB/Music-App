// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');

// ============================================
// VERIFY JWT TOKEN
// ============================================
const authenticateToken = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer TOKEN_HERE"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ 
          error: 'Invalid or expired token' 
        });
      }

      // Add user info to request object
      req.user = user;
      next(); // Continue to the route handler
    });

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Server error in authentication' });
  }
};

// ============================================
// OPTIONAL AUTH (doesn't require token, but adds user if present)
// ============================================
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token, but that's okay - continue without user
      req.user = null;
      return next();
    }

    // Try to verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        // Invalid token, but that's okay - continue without user
        req.user = null;
      } else {
        // Valid token - add user info
        req.user = user;
      }
      next();
    });

  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};