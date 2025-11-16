import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumAPI } from '../services/api';
import './Albums.css';
import { useAuth } from '../context/AuthContext';


const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genre, setGenre] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [order, setOrder] = useState('ASC');

  useEffect(() => {
    loadAlbums();
  }, [sortBy, order, genre]);

  const loadAlbums = async () => {
    try {
      setLoading(true);
      const params = {
        sort: sortBy,
        order: order,
        limit: 100
      };

      if (genre) {
        params.genre = genre;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await albumAPI.getAll(params);
      setAlbums(response.data.albums);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadAlbums();
  };

  const genres = ['Rock', 'Pop', 'Hip Hop', 'R&B', 'Soul', 'Alternative', 'Electronic', 'Grunge', 'Indie Rock', 'Progressive Rock'];

  return (
    <div className="albums-page">
      <div className="container">
        <h1>Browse Albums</h1>

        {/* Search and Filters */}
        <div className="albums-controls">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search albums or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="filters">
            <select 
              value={genre} 
              onChange={(e) => setGenre(e.target.value)}
              className="filter-select"
            >
              <option value="">All Genres</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="title">Title</option>
              <option value="average_rating">Rating</option>
              <option value="release_date">Release Date</option>
              <option value="created_at">Recently Added</option>
            </select>

            <select 
              value={order} 
              onChange={(e) => setOrder(e.target.value)}
              className="filter-select"
            >
              <option value="ASC">Ascending</option>
              <option value="DESC">Descending</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="results-count">{albums.length} albums found</p>

        {/* Albums Grid */}
        {loading ? (
            <p className="loading">Loading albums...</p>
        ) : albums.length === 0 ? (
            <p className="no-results">No albums found. Try a different search or filter.</p>
        ) : (
            <div className="albums-grid">
                {albums.map((album) => (
                    <AlbumCard key={album.album_id} album={album} />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

const AlbumCard = ({ album }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [onRadar, setOnRadar] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault(); // don’t trigger the Link navigation
    if (!isAuthenticated) return; // later you can show a login modal
    try {
      const res = await albumAPI.toggleFavorite(album.album_id);
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const handleRadar = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    try {
      const res = await albumAPI.toggleRadar(album.album_id);
      setOnRadar(res.data.onRadar);
    } catch (err) {
      console.error('Radar error:', err);
    }
  };

  return (
    <Link to={`/albums/${album.album_id}`} className="album-card">
      <div className="album-cover">
        {album.cover_art_url ? (
          <img src={album.cover_art_url} alt={album.title} />
        ) : (
          <div className="album-cover-placeholder">🎵</div>
        )}
      </div>
      <div className="album-info">
        <h3>{album.title}</h3>
        <p className="artist-name">{album.artist_name}</p>
        {album.release_date && (
          <p className="album-year">
            {new Date(album.release_date).getFullYear()}
          </p>
        )}
        {album.rating_count > 0 ? (
          <div className="rating">
            ⭐ {parseFloat(album.average_rating).toFixed(1)}
            <span className="rating-count">({album.rating_count})</span>
          </div>
        ) : (
          <div className="no-rating">No ratings yet</div>
        )}

        {/* NEW: actions row */}
        <div className="album-actions">
          <button
            className={`icon-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
          >
            ⭐
          </button>
          <button
            className={`icon-btn ${onRadar ? 'active' : ''}`}
            onClick={handleRadar}
          >
            📡
          </button>
        </div>
      </div>
    </Link>
  );
};



export default Albums;