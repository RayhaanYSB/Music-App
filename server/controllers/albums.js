// ============================================
// ALBUMS CONTROLLER
// ============================================

const pool = require('../config/db');

// ============================================
// GET ALL ALBUMS (with search/filter)
// ============================================
const getAllAlbums = async (req, res) => {
  try {
    const { search, genre, sort = 'created_at', order = 'DESC', limit = 20, offset = 0 } = req.query;

    let query = `
      SELECT 
        a.album_id,
        a.title,
        a.release_date,
        a.cover_art_url,
        a.genre,
        a.average_rating,
        a.rating_count,
        a.created_at,
        ar.artist_id,
        ar.name as artist_name
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCount = 1;

    // Search by title or artist
    if (search) {
      query += ` AND (a.title ILIKE $${paramCount} OR ar.name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    // Filter by genre
    if (genre) {
      query += ` AND a.genre = $${paramCount}`;
      queryParams.push(genre);
      paramCount++;
    }

    // Sorting
    const validSortFields = ['created_at', 'average_rating', 'rating_count', 'title', 'release_date'];
    const validOrders = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    query += ` ORDER BY a.${sortField} ${sortOrder}`;

    // Pagination
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const albums = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE 1=1
    `;

    const countParams = [];
    let countParamNum = 1;

    if (search) {
      countQuery += ` AND (a.title ILIKE $${countParamNum} OR ar.name ILIKE $${countParamNum})`;
      countParams.push(`%${search}%`);
      countParamNum++;
    }

    if (genre) {
      countQuery += ` AND a.genre = $${countParamNum}`;
      countParams.push(genre);
    }

    const totalCount = await pool.query(countQuery, countParams);

    res.json({
      albums: albums.rows,
      pagination: {
        total: parseInt(totalCount.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < parseInt(totalCount.rows[0].count)
      }
    });

  } catch (error) {
    console.error('Get albums error:', error);
    res.status(500).json({ error: 'Server error fetching albums' });
  }
};

// ============================================
// GET SINGLE ALBUM BY ID
// ============================================
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await pool.query(`
      SELECT 
        a.*,
        ar.artist_id,
        ar.name as artist_name,
        ar.bio as artist_bio,
        ar.image_url as artist_image
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE a.album_id = $1
    `, [id]);

    if (album.rows.length === 0) {
      return res.status(404).json({ error: 'Album not found' });
    }

    // Get songs on this album
    const songs = await pool.query(`
      SELECT song_id, title, track_number, duration_seconds
      FROM songs
      WHERE album_id = $1
      ORDER BY track_number
    `, [id]);

    // Get recent reviews
    const reviews = await pool.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.review_text,
        r.created_at,
        u.user_id,
        u.username,
        u.display_name,
        u.profile_picture_url
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.album_id = $1 AND r.is_public = true
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    res.json({
      album: album.rows[0],
      songs: songs.rows,
      recentReviews: reviews.rows
    });

  } catch (error) {
    console.error('Get album error:', error);
    res.status(500).json({ error: 'Server error fetching album' });
  }
};

// ============================================
// CREATE NEW ALBUM
// ============================================
const createAlbum = async (req, res) => {
  try {
    const { 
      title, 
      artist_name, 
      release_date, 
      cover_art_url, 
      genre,
      spotify_id 
    } = req.body;

    // Validation
    if (!title || !artist_name) {
      return res.status(400).json({ 
        error: 'Title and artist name are required' 
      });
    }

    // Check if artist exists, if not create it
    let artist = await pool.query(
      'SELECT artist_id FROM artists WHERE name = $1',
      [artist_name]
    );

    let artist_id;
    if (artist.rows.length === 0) {
      // Create new artist
      const newArtist = await pool.query(
        'INSERT INTO artists (name) VALUES ($1) RETURNING artist_id',
        [artist_name]
      );
      artist_id = newArtist.rows[0].artist_id;
    } else {
      artist_id = artist.rows[0].artist_id;
    }

    // Create album
    const newAlbum = await pool.query(`
      INSERT INTO albums 
        (title, artist_id, release_date, cover_art_url, genre, spotify_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, artist_id, release_date, cover_art_url, genre, spotify_id]);

    // Get artist info for response
    const albumWithArtist = await pool.query(`
      SELECT 
        a.*,
        ar.name as artist_name
      FROM albums a
      JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE a.album_id = $1
    `, [newAlbum.rows[0].album_id]);

    res.status(201).json({
      message: 'Album created successfully',
      album: albumWithArtist.rows[0]
    });

  } catch (error) {
    console.error('Create album error:', error);
    
    // Check for duplicate spotify_id
    if (error.code === '23505' && error.constraint === 'albums_spotify_id_key') {
      return res.status(409).json({ error: 'Album with this Spotify ID already exists' });
    }
    
    res.status(500).json({ error: 'Server error creating album' });
  }
};

// ============================================
// SEARCH ALBUMS (separate search endpoint)
// ============================================
const searchAlbums = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await pool.query(`
      SELECT 
        a.album_id,
        a.title,
        a.cover_art_url,
        a.average_rating,
        a.rating_count,
        ar.name as artist_name
      FROM albums a
      LEFT JOIN artists ar ON a.artist_id = ar.artist_id
      WHERE a.title ILIKE $1 OR ar.name ILIKE $1
      ORDER BY a.average_rating DESC NULLS LAST
      LIMIT 20
    `, [`%${q}%`]);

    res.json({ results: results.rows });

  } catch (error) {
    console.error('Search albums error:', error);
    res.status(500).json({ error: 'Server error searching albums' });
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  searchAlbums
};