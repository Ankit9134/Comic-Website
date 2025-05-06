import React, { useState, useEffect } from 'react';
import '../styles/search.css';
import { Search } from 'lucide-react';

const SearchBar = React.memo(({ onSearch, initialValue }) => {
  const [inputValue, setInputValue] = useState(initialValue);
  
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(inputValue); 
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search comics..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button className="search-button" onClick={handleSearchClick}>
        <Search size={18} />
      </button>
    </div>
  );
});

export default SearchBar;