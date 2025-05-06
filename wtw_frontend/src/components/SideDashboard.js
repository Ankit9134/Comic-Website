import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import { useNavigate, } from 'react-router-dom';
import { 
  FaHome,          
  FaBook,         
  FaImage,         
  FaSignOutAlt,     
  FaChevronDown,    
  FaChevronUp,
  FaBars,
  FaTimes,
  FaUser         
} from 'react-icons/fa';
import Logout from './Logout';
import axios from 'axios';
import logo1 from "../Image/logo1.png"; 
import logo2 from "../Image/logo2.png"; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function SideDashboard({ comic, isMobile = window.innerWidth <= 1024 }) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [expandedDropdown, setExpandedDropdown] = useState(null);
  const [userData, setUserData] = useState(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          console.log('User data loaded:', parsedUserData); 
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadUserData();

    const handleStorageChange = (e) => {
      if (e.key === 'userData') {
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const timer = setTimeout(() => setClickCount(0), 1000);
    return () => clearTimeout(timer);
  }, [clickCount]);  
  const toggleDropdown = (dropdownName) => {
    if (isMobileView && !sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => setExpandedDropdown(dropdownName), 100);
    } else {
      setExpandedDropdown(expandedDropdown === dropdownName ? null : dropdownName);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        clearUserData();
        navigate('/login');
        return;
      }

      await axios.get(
        `${API_BASE_URL}/user/logout`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      clearUserData();
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      clearUserData();
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
      setLogoutModalOpen(false);
    }
  };

  const clearUserData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUserData(null);
  };

  const getUserName = () => {
    return userData?.firstName || "";
  };
  const isMobileView = windowWidth <= 1024;

  return ( 
    <div className={isMobileView ? 'mobile-sidebar-container' : ''}>
      {isMobileView && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      )}
      
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'} ${isMobileView ? 'mobile' : ''}`}>
        <div className="logo-container">
          {isMobileView ? (
            <div className="user-profile-mobile">
              {userData?.profileImage ? (
                <img 
                  src={userData.profileImage} 
                  alt="Profile" 
                  className="user-avatar-mobile"
                />
              ) : (
                <div className="user-avatar-placeholder-mobile">
                   <FaUser className="user-icon-mobile" size={40}/>
                </div>
              )}
              <span className="user-name-mobile">{getUserName()}</span>
            </div>
          ) : (
            <>
             <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              <img src={logo1} alt="Logo" className="logo-desktop" />
              <img src={logo2} alt="Logo" className="logo-desktop1" />
              </div>
            </>
          )}
        </div>

        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="nav-icon"><FaHome size={24}/></span>
            <a href='/dashboard'><span className="nav-text">Dashboard</span></a>
          </div>
          
          <div className="dropdown-container">
            <div
              className="nav-item dropdown-header"
              onClick={() => toggleDropdown('comicSettings')}
              onTouchEnd={(e) => {
                e.preventDefault();
                toggleDropdown('comicSettings');
              }}
            >
              <span className="nav-icon"><FaBook size={22} /></span>
              <span className="nav-text">Comic Settings</span>
              <span className="dropdown-arrow">
                {expandedDropdown === 'comicSettings' ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expandedDropdown === 'comicSettings' && (
              <div className="dropdown-content">
                <a href='/comicsetting'>
                  <div className="dropdown-item">Add New Comic</div>
                </a>
              </div>
            )}
          </div>
          
          <div className="dropdown-container">
            <div
              className="nav-item dropdown-header"
              onClick={() => toggleDropdown('homepageBanner')}
              onTouchEnd={(e) => {
                e.preventDefault();
                toggleDropdown('homepageBanner');
              }}
            >
              <span className="nav-icon"><FaImage size={22} /></span>
              <span className="nav-text">Homepage Banner</span>
              <span className="dropdown-arrow">
                {expandedDropdown === 'homepageBanner' ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </div>
            {expandedDropdown === 'homepageBanner' && (
              <div className="dropdown-content">
                <a href='/createbanner'>
                  <div className="dropdown-item">Create Banner</div>
                </a>
              </div>
            )}
          </div>
          
          <div className="nav-item">
            <span className="nav-icon"><FaSignOutAlt size={24} /></span>
            <button
              className="logout-btn"
              onClick={() => setLogoutModalOpen(true)}
            >
              <span className="nav-text">Logout</span>
            </button>
          </div>
        </nav>
      </div>
      
      {isMobileView && sidebarOpen && (
        <div className="mobile-overlay" onClick={toggleSidebar}></div>
      )}
      
      <Logout 
        isOpen={logoutModalOpen}
        onClose={() => !isLoggingOut && setLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </div>
  );
}

export default SideDashboard;