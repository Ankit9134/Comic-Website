import React, { useState } from 'react';
import '../styles/Slide.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
  const [inputPage, setInputPage] = useState('');

  // Show limited page numbers with ellipsis
  const getVisiblePages = () => {
    const visiblePages = [];
    const maxVisible = 5; // Maximum pages to show at once
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      end = maxVisible;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - maxVisible + 1;
    }

    if (start > 1) {
      visiblePages.push(1);
      if (start > 2) {
        visiblePages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      visiblePages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        visiblePages.push('...');
      }
      visiblePages.push(totalPages);
    }

    return visiblePages;
  };

  const handlePageInput = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      setInputPage('');
    }
  };

  return (
    <div className="pagination-container">
      <div className="paginationSlide">
        {/* <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="page-btn"
          aria-label="First page"
        >
          &lt;&lt;
        </button> */}
        
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="page-btn"
          aria-label="Previous page"
        >
          &lt;
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={page === '...' ? `ellipsis-${index}` : page}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            className={
              page === '...' 
                ? 'ellipsis' 
                : currentPage === page 
                  ? 'activeSlide' 
                  : 'page-btn'
            }
            disabled={page === '...'}
            aria-label={
              page === '...' 
                ? 'Ellipsis' 
                : `Page ${page}`
            }
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="page-btn"
          aria-label="Next page"
        >
          &gt;
        </button>

        {/* <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="page-btn"
          aria-label="Last page"
        >
          &gt;&gt;
        </button> */}
      </div>

      {totalPages > 10 && (
        <form onSubmit={handlePageInput} className="page-input-form">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            placeholder={`1-${totalPages}`}
            aria-label="Page number input"
          />
          <button type="submit" className="go-btn">
            Go
          </button>
        </form>
      )}
    </div>
  );
}

export default Pagination;