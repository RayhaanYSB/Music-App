// ============================================
// AUTHENTICATION CONTROLLER
// ============================================

const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// ============================================
// REGISTER NEW USER
// ============================================
const register = async (req, res) => {
  try {
    const { username, email, password, display_name } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required' 
      });
    }

    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      return res.status(409).json({ 
        error: 'User with this email or username already exists' 
      });
    }

    // Hash password (10 salt rounds)
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name)
       VALUES ($1, $2, $3, $4)
       RETURNING user_id, username, email, display_name, created_at`,
      [username, email, password_hash, display_name || username]
    );

    // Create JWT token
    const token = jwt.sign(
      { user_id: newUser.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser.rows[0],
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ============================================
// LOGIN USER
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(
      password, 
      user.rows[0].password_hash
    );

    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { user_id: user.rows[0].user_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't send password hash to client
    const { password_hash, ...userWithoutPassword } = user.rows[0];

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// ============================================
// GET CURRENT USER (verify token)
// ============================================
const getCurrentUser = async (req, res) => {
  try {
    const user = await pool.query(
      `SELECT user_id, username, email, display_name, bio, 
              profile_picture_url, created_at
       FROM users 
       WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.rows[0] });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};