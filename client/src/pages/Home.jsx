import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const response = await albumAPI.getAll({ 
        sort: 'average_rating', 
        order: 'DESC', 
        limit: 12 
      });
      setAlbums(response.data.albums);
    } catch (error) {
      console.error('Error loading albums:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '50px 20px' }}>Loading...</div>;
  }

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Track Your Music Journey</h1>
          <p>Rate albums, share reviews, and discover new music</p>
          <Link to="/albums" className="btn btn-primary btn-large">
            Explore Albums
          </Link>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Top Rated Albums</h2>
        
        {albums.length === 0 ? (
          <p className="text-center">No albums yet. Be the first to add one!</p>
        ) : (
          <div className="album-grid">
            {albums.map((album) => (
              <Link to={`/albums/${album.album_id}`} key={album.album_id} className="album-card">
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
                  {album.rating_count > 0 && (
                    <div className="rating">
                      ⭐ {parseFloat(album.average_rating).toFixed(1)} 
                      <span className="rating-count">({album.rating_count})</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;