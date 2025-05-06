import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';
import SideDashboard from './SideDashboard';
import Header from './header';
import DeleteConfirmationModal from './delete';
import Statcard from './Statcard';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import qs from 'qs';

const ComicDashboard = () => {
  const [selectedComics, setSelectedComics] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [comicToDelete, setComicToDelete] = useState(null);
  const [comicsData, setComicsData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 7;
  const [totalRows, setTotalRows] = useState(0);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem('comicSearchQuery');
    return saved || '';
  }); 
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);   
  const [dashboardStats, setDashboardStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const debounceTimer = useRef(null);
    const searchRef = useRef('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  
  useEffect(() => {
    localStorage.setItem('comicSearchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const savedQuery = localStorage.getItem('comicSearchQuery');
    if (savedQuery) {
      setSearchQuery(savedQuery);
      setDebouncedSearchQuery(savedQuery); 
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('comicSearchQuery', searchQuery);
  }, [searchQuery]);
  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(value);
    }, 500);
  }, []);

  const fetchComics = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchQuery || undefined,
      };

      const response = await axios.get(`${API_BASE_URL}/comic/getPaginatedComics`, {
        params,
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
      });
      
      if (response.data && response.data.data) {
        setComicsData(response.data.data.comics || []);
        setTotalPages(response.data.data.totalPages || 1);
        setTotalRows(response.data.data.totalRows || 0);
      } else {
        setComicsData([]);
        setTotalPages(1);
        setTotalRows(0);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setComicsData([]);
      setLoading(false);
      console.error('Error fetching comics:', err);
    }
  }, [currentPage, debouncedSearchQuery, API_BASE_URL]);

  useEffect(() => {
    fetchComics();
  }, [fetchComics]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = getAuthToken();
      
      try {
        const response = await axios.get(
          `${API_BASE_URL}/comic/getAdminDashboardCounts`,
          {
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          }
        );

        if (response.data && response.data.data) {
          const data = response.data.data;
          setDashboardStats([
            { title: 'Total Comics', value: data.comicCount || 0 },
            { title: 'Total Genres', value: data.genreCount || 0 },
            { title: 'New Comics Added', value: data.newComicsCount || 0 },
            { title: 'Edited Comics', value: data.updatedComicsCount || 0 }
          ]);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        setStatsError(err.response?.data?.message || err.message || 'Failed to fetch dashboard stats');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardStats();
    console.log('Fetching dashboard stats');
    return () => {
    };
  }, [API_BASE_URL]);
  const toggleComicSelection = (id) => {
    if (selectedComics.includes(id)) {
      setSelectedComics(selectedComics.filter(comicId => comicId !== id));
    } else {
      setSelectedComics([...selectedComics, id]);
    }
    setSelectAll(false);
  };

  const toggleSelectAll = () => {
    if (selectAll || selectedComics.length === comicsData.length) {
      setSelectedComics([]);
      setSelectAll(false);
    } else {
      setSelectedComics(comicsData.map(comic => comic.id));
      setSelectAll(true);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedComics([]);
      setSelectAll(false);
    }
  };

  const openDeleteModal = (comic = null) => {
    if (comic?.id) {
      setComicToDelete(comic);
    } else if (selectedComics.length > 0) {
      setComicToDelete({ 
        id: selectedComics, 
        comicName: `${selectedComics.length} selected comics`
      });
    } else {
      setError('Please select at least one comic to delete');
      return;
    }
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setComicToDelete(null);
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
    return token;
  };

  const confirmDelete = async (comicId) => {
    try {
      if (!comicId || (Array.isArray(comicId) && comicId.length === 0)) {
        setError('Please select at least one comic to delete');
        return;
      }
  
      const token = getAuthToken();
      let idsToDelete;
      
      if (Array.isArray(comicId)) {
        idsToDelete = comicId;
      } else if (typeof comicId === 'string' && comicId.includes(',')) {
        idsToDelete = comicId.split(',').filter(id => id);
      } else {
        idsToDelete = [comicId.toString()];
      }
  
      const queryString = idsToDelete.map(id => `comicIds[]=${id}`).join('&');
      
      const response = await axios.get(
        `${API_BASE_URL}/comic/deleteComic?${queryString}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (response.data?.message === 'Comic deleted successfully') {
        setComicsData(prev => prev.filter(comic => !idsToDelete.includes(comic.id.toString())));
        setTotalRows(prev => prev - idsToDelete.length);
        if (comicsData.length === idsToDelete.length && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
        setDeleteSuccess(true);
        setComicToDelete({
          ...comicToDelete,
          successMessage: `${idsToDelete.length} comic(s) deleted successfully`
        });
        setSelectedComics([]);
        setSelectAll(false);
      } else {
        throw new Error(response.data?.message || 'Failed to delete comic(s)');
      }
    } catch (err) {
      console.error('Delete error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('authToken');
        navigate('/login');
      } else {
        setError(err.message || 'Failed to delete comic(s)');
      }
      setDeleteSuccess(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <SideDashboard />
        <div className="main-content">
        <Header 
            onSearch={handleSearch} 
            searchValue={searchQuery} 
          />
          <div className="dashboard-content">
            <div className="page-title-container">
              <h1 className="page-title">Dashboard</h1>
              <button className="add-comic-btn" disabled>Add New Comic</button>
            </div>
            {/* Loading skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="mobile-comic-card" style={{ height: '150px', background: '#2a2a2a' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <SideDashboard />
        <div className="main-content">
          <Header onSearch={handleSearch} value={searchQuery} />
          <div className="dashboard-content">
            <div className="error-message">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <SideDashboard/>
      <div className="main-content">
        <div className="header-container">
          <Header onSearch={handleSearch} value={searchQuery} />
        </div>
        <div className="dashboard-content">
          <div className="page-title-container">
            <h1 className="page-title">Dashboard</h1>
            <a href='/comicsetting'>
              <button className="add-comic-btn">Add New Comic</button>
            </a>
          </div>

          <Statcard 
        stats={dashboardStats} 
        loading={statsLoading} 
        error={statsError} 
      />
          
          {/* Desktop View */}
          <div className="desktop-view">
            <div className="comics-list-header">
              <div className="select-column">
                <input
                  type="checkbox"
                  checked={selectAll || (comicsData.length > 0 && selectedComics.length === comicsData.length)}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="comic-name-column">Comic Name</div>
              <div className="genre-column">Genre</div>
              <div className="episode-column">Episode Count</div>
              <div className="actions-column">
                <button 
                  className="delete-btn" 
                  onClick={() => openDeleteModal()}
                  disabled={selectedComics.length === 0}
                >
                  <FaTrashAlt size={24} />
                </button>
                Actions
              </div>
            </div>

            {comicsData.map(comic => (
              <div key={comic.id} className="comic-row">
                <div className="select-column">
                  <input
                    type="checkbox"
                    checked={selectedComics.includes(comic.id)}
                    onChange={() => toggleComicSelection(comic.id)}
                  />
                </div>
                <div className="comic-info">
                  <img 
                    src={comic.comicContent[0]?.imageURL || 'placeholder.jpg'} 
                    alt={comic.comicName} 
                    className="comic-cover" 
                  />
                  <span className="comic-title">{comic.comicName}</span>
                </div>
                <div className="genre-column">{comic.genreName}</div>
                <div className="episode-column">{comic.comicContent ? comic.comicContent.length : 0}</div>
                <div className="actions-column">
                  <a href={`/updatecomic/${comic.id}`}>
                    <button className="edit-btn">
                      <FaEdit size={20} />
                    </button>
                  </a>
                  <button className="delete-btn" onClick={() => openDeleteModal(comic)}>
                    <FaTrashAlt size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View */}
          <div className="mobile-view">
            {comicsData.map(comic => (
              <div key={comic.id} className="mobile-comic-card">
                <div className="mobile-comic-actions">
                  <input
                    className='mobile-checkbox'
                    type="checkbox"
                    checked={selectedComics.includes(comic.id)}
                    onChange={() => toggleComicSelection(comic.id)}
                  />
                  <div>
                    <a href={`/updatecomic/${comic.id}`}>
                      <button className="edit-btn">
                        <FaEdit size={20} />
                      </button>
                    </a>
                    <button className="delete-btn" onClick={() => openDeleteModal(comic)}>
                      <FaTrashAlt size={20} />
                    </button>
                  </div>
                </div>
                <div className="mobile-comic-header">
                  <img 
                    src={comic.comicContent[0]?.imageURL || 'placeholder.jpg'} 
                    alt={comic.comicName} 
                    className="mobile-comic-cover" 
                  />
                  <div className="mobile-comic-title">{comic.comicName}</div>
                </div>
                <div className="mobile-comic-details">
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Genre:</span>
                    <span>{comic.genreName}</span>
                  </div>
                  <div className="mobile-detail-item">
                    <span className="mobile-detail-label">Episodes:</span>
                    <span>{comic.comicContent ? comic.comicContent.length : 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button 
              className="page-nav" 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="page-nav" 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        comicTitle={comicToDelete?.comicName || `${selectedComics.length} selected comics`}
        comicId={Array.isArray(comicToDelete?.id) ? comicToDelete.id : comicToDelete?.id}
        successMessage={deleteSuccess}
      />
    </div>
  );
};

export default ComicDashboard;