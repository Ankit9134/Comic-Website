import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import qs from 'qs';
import SearchBar from './search';
import GenreFilter from './GenreFilter';
import ComicGrid from './ComicGrid';
import Pagination from './Slide';
import SortFilterMenu from './SortFilterMenu';
import '../styles/Head.css'

function Head() {
  const MemoizedSearchBar = React.memo(SearchBar);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [allComics, setAllComics] = useState([]);
  const [totalComics, setTotalComics] = useState(0);
  const itemsPerPage = 8;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('All'); 

  const searchRef = useRef('');
  const debounceTimer = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSearch = (value) => {
    searchRef.current = value;
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchRef.current);
    }, 200);
  };

  const fetchAllComics = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      };
      if (sortOption === 'Newest First') {
        params.sort = 'newest';
      } else if (sortOption === 'Oldest First') {
        params.sort = 'oldest';
      }
      
      if (selectedGenres.length > 0) {
        params['genreIds[]'] = selectedGenres;
      }

      const response = await axios.get(`${API_BASE_URL}/comic/getPaginatedComics`, {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
      });

      if (!response.data?.data) throw new Error('Invalid response structure');

      const { comics, totalRows } = response.data.data;
      if (!Array.isArray(comics)) {
        throw new Error('Comics data is not an array');
      }

      const formattedComics = comics.map((comic) => {
        const comicImage = comic.comicContent[0]?.imageURL || '/assets/Image/image.jpg';
        return {
          id: comic.id,
          comicName: comic.comicName,
          image: comicImage,
          genreId: comic.genreId?.toString(),
          genreName: comic.genreName || 'Unknown',
          description: comic.description,
          createdAt: comic.createdAt
        };
      });
      
      setAllComics(formattedComics);
      setTotalComics(totalRows);
      setError(null);
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Invalid request parameters. Please check your filters.');
      } else {
        setError(`Failed to load comics: ${err.message}`);
      }
      setAllComics([]);
      setTotalComics(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, debouncedSearchQuery, selectedGenres, sortOption]);

  useEffect(() => {
    fetchAllComics();
  }, [fetchAllComics]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGenres, debouncedSearchQuery, sortOption]);

  const handleGenreSelect = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSortChange = (option) => {
    setSortOption(option);
  };

  const totalPages = Math.ceil(totalComics / itemsPerPage);

  if (isLoading) return <div className="loading">Loading comics...</div>;

  if (error) return (
    <div className="error">
      <h3>Comic Load Error</h3>
      <p>{error}</p>
      <button
        onClick={() => {
          setCurrentPage(1);
          setError(null);
          setIsLoading(true);
        }}
        className="retry-button"
      >
        ↻ Retry
      </button>
    </div>
  );

  return (
    <div className="app">
      <div className='Comiclibary'>
        <h1 className="site-title">Comic Library</h1>
        <div className="search-section">
          <MemoizedSearchBar
            onSearch={(value) => {
              handleSearch(value);
              setSearchQuery(value);
            }}
            initialValue={searchQuery}
          />
          <SortFilterMenu 
            onSortChange={handleSortChange} 
            activeOption={sortOption}
          />
        </div>
        <GenreFilter
          onGenreSelect={handleGenreSelect}
          selectedGenres={selectedGenres}
          onAllGenres={() => setSelectedGenres([])}
        />
        {allComics.length === 0 && !isLoading ? (
          <div className="no-comics-found">
            No comics found matching your criteria.
          </div>
        ) : (
          <>
            <ComicGrid comics={allComics} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Head;