import React, { useState, useRef, useEffect } from 'react';
import '../styles/SortFilterMenu.css';

function SortFilterMenu({ onSortChange, activeOption: propActiveOption }) {
  const [activeOption, setActiveOption] = useState(propActiveOption || 'All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  const options = [
    'All',
    'Newest First',
    'Oldest First',
  ];
  
  // Sync with prop if it changes
  useEffect(() => {
    if (propActiveOption && propActiveOption !== activeOption) {
      setActiveOption(propActiveOption);
    }
  }, [propActiveOption]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const selectOption = (option) => {
    setActiveOption(option);
    setIsMenuOpen(false);
    if (onSortChange) {
      onSortChange(option);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && 
          !menuRef.current.contains(event.target) && 
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sort-filter-container" ref={menuRef}>
      <button 
        ref={buttonRef}
        className="sort-button" 
        onClick={toggleMenu}
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
      >
        <span className="sort-icon">↑↓</span>
        <span>{activeOption}</span>
        <span className={`dropdown-arrow ${isMenuOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      <div className={`sort-filter-menu ${isMenuOpen ? 'visible' : ''}`}>
        <ul className="sort-filter-list">
          {options.map((option) => (
            <li 
              key={option}
              className={`sort-filter-item ${activeOption === option ? 'active' : ''}`}
              onClick={() => selectOption(option)}
              style={{ cursor: 'pointer' }} 
            >
              {option}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SortFilterMenu;