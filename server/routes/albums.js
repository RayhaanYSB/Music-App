// ============================================
// ALBUM ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const { 
  getAllAlbums, 
  getAlbumById, 
  createAlbum,
  searchAlbums,
  getAlbumsDebug,
  toggleFavorite,
  toggleRadar,
} = require('../controllers/albums');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// ...

// DEBUG route
router.get('/debug', getAlbumsDebug);

// Toggle favorite (auth required)
router.post('/:id/favorite', authenticateToken, toggleFavorite);

// Toggle Radar (auth required)
router.post('/:id/radar', authenticateToken, toggleRadar);

// ============================================
// PUBLIC ROUTES (no auth required)
// ============================================

// GET /api/albums - Get all albums with filters/search/pagination
// Query params: ?search=text&genre=Rock&sort=average_rating&order=DESC&limit=20&offset=0
router.get('/', optionalAuth, getAllAlbums);

// GET /api/albums/search?q=query - Quick search
router.get('/search', searchAlbums);

// GET /api/albums/:id - Get single album details
router.get('/:id', optionalAuth, getAlbumById);

// ============================================
// PROTECTED ROUTES (auth required)
// ============================================

// POST /api/albums - Create new album
router.post('/', authenticateToken, createAlbum);

module.exports = router;