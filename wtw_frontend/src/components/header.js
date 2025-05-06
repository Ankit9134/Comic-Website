import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import logo1 from "../Image/logo1.png";
import logo2 from "../Image/logo2.png";
function Header({ onSearch }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const savedQuery = localStorage.getItem('comicSearchQuery');
    if (savedQuery && onSearch) {
      onSearch(savedQuery);
    }
  }, [onSearch]);

const [searchValue, setSearchValue] = useState(() => {
  const saved = localStorage.getItem('comicSearchQuery');
  return saved || '';
});

// useEffect(() => {
//   if (onSearch) {
//     onSearch(searchValue);
//   }
// }, []); 

const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchValue(value);
  if (onSearch) {
    onSearch(value);
  }
};
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

  const getUserName = () => {
    return userData?.firstName || "";
  };


  return (
    <div>
      <header className="dashboard-header">
      <div className="search-container1">
          <input 
            type="text" 
            placeholder="Search comics..." 
            className="search-input1" 
            value={searchValue}
            onChange={handleSearchChange}
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>

        <div className="logo-container">
          <div className="user-desktop">
            <User className="user-icon-mobile" size={40} />
            <span>{getUserName()}</span>
          </div>

          <>
            <img src={logo1} alt="Logo" className="logo-mobile" />
            <img src={logo2} alt="Logo" className="logo-mobile1" />
          </>
        </div>
      </header>
      {mobileSidebarOpen && (
        <div
          className="mobile-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default Header;