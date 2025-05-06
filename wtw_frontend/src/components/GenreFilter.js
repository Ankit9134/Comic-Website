import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/GenreFilter.css';

function GenreFilter({ onGenreSelect, selectedGenres, onAllGenres }) {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/genre/getAllGenres`);
        let genresData = [];
        
        if (Array.isArray(response.data)) {
          genresData = response.data;
        } 
        else if (response.data?.data && Array.isArray(response.data.data)) {
          genresData = response.data.data;
        } 
        else if (response.data?.genres) {
          genresData = response.data.genres;
        } 
        else {
          throw new Error('Unexpected API response format');
        }

        // Keep genre IDs as numbers if backend expects numbers
        const formattedGenres = genresData.map(genre => ({
          id: genre.id, // Don't convert to string
          label: genre.genreName || 'Unknown Genre'
        }));

        setGenres(formattedGenres);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching genres:', err);
        // Provide fallback genres that match backend expectations
        setGenres([
          { id: 1, label: 'Drama' },    // Numbers instead of strings
          { id: 2, label: 'Action' },
          { id: 3, label: 'Comedy' },
          { id: 4, label: 'Sci-Fi' },
          { id: 5, label: 'Horror' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="genre-filter loading">
        <div className="spinner"></div>
        <span>Loading genres...</span>
      </div>
    );
  }

  return (
    <div className="genre-filter">
      {error && (
        <div className="error-message">
          Warning: Couldn't load all genres. Showing limited selection.
        </div>
      )}
      
      <button 
        className={`all-btn ${selectedGenres.length === 0 ? 'active' : ''}`}
        onClick={onAllGenres}
      >
        <span className="all-count">All</span>
      </button>
      
      {genres.map(genre => (
        <button
          key={genre.id}
          className={`genre-btn ${selectedGenres.includes(genre.id) ? 'active' : ''}`}
          onClick={() => onGenreSelect(genre.id)}
        >
          {genre.label}
        </button>
      ))}
    </div>
  );
}

export default GenreFilter;