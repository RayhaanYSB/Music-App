-- ============================================
-- MUSIC APP DATABASE SCHEMA
-- ============================================

-- Enable UUID extension for unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER ALBUM STATS (Track user's album activity)
-- ============================================
CREATE TABLE user_album_stats (
    stat_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    total_albums_listened INTEGER DEFAULT 0,
    total_albums_rated INTEGER DEFAULT 0,
    average_rating_given DECIMAL(3,1) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- ARTISTS TABLE
-- ============================================
CREATE TABLE artists (
    artist_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    image_url VARCHAR(500),
    spotify_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ALBUMS TABLE
-- ============================================
CREATE TABLE albums (
    album_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(artist_id) ON DELETE CASCADE,
    release_date DATE,
    cover_art_url VARCHAR(500),
    spotify_id VARCHAR(100) UNIQUE,
    genre VARCHAR(100),
    average_rating DECIMAL(3,1) DEFAULT 0,           -- NEW: Average score
    rating_count INTEGER DEFAULT 0,                   -- NEW: Number of ratings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SONGS/TRACKS TABLE
-- ============================================
CREATE TABLE songs (
    song_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    artist_id UUID REFERENCES artists(artist_id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(album_id) ON DELETE SET NULL,
    duration_seconds INTEGER,
    track_number INTEGER,
    spotify_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER REVIEWS/RATINGS TABLE
-- ============================================
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(album_id) ON DELETE CASCADE,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),  -- Changed to 0-10
    review_text TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, album_id)
);

-- ============================================
-- SONG REVIEWS TABLE (Secondary/Optional)
-- ============================================
CREATE TABLE song_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(song_id) ON DELETE CASCADE,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    review_text TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, song_id)
);

-- ============================================
-- ALBUM LISTENING HISTORY TABLE (Primary)
-- ============================================
CREATE TABLE album_listens (
    listen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(album_id) ON DELETE CASCADE,
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SONG LISTENING HISTORY TABLE (Secondary/Optional)
-- ============================================
CREATE TABLE song_listens (
    listen_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    song_id UUID REFERENCES songs(song_id) ON DELETE CASCADE,
    listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- USER LISTS (Collections)
-- ============================================
CREATE TABLE lists (
    list_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LIST ITEMS (Albums in lists)
-- ============================================
CREATE TABLE list_items (
    list_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID REFERENCES lists(list_id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(album_id) ON DELETE CASCADE,
    position INTEGER,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, album_id)
);

-- ============================================
-- FOLLOWS (Social feature)
-- ============================================
CREATE TABLE follows (
    follow_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id) -- Can't follow yourself
);

-- ============================================
-- INDEXES for better performance
-- ============================================
CREATE INDEX idx_albums_artist ON albums(artist_id);
CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_album ON songs(album_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_album ON reviews(album_id);
CREATE INDEX idx_album_listens_user ON album_listens(user_id);  -- Changed
CREATE INDEX idx_album_listens_album ON album_listens(album_id);  -- New
CREATE INDEX idx_song_listens_user ON song_listens(user_id);  -- New
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- ============================================
-- FUNCTION TO UPDATE ALBUM AVERAGE RATING
-- ============================================
CREATE OR REPLACE FUNCTION update_album_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate average rating and count for the album
    UPDATE albums
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
            AND is_public = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE album_id = COALESCE(NEW.album_id, OLD.album_id)
            AND is_public = true
        )
    WHERE album_id = COALESCE(NEW.album_id, OLD.album_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Update album rating on review changes
-- ============================================
CREATE TRIGGER trigger_update_album_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_album_rating();