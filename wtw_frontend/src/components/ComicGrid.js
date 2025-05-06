import React from 'react';
import ComicCard from './ComicCard';
import '../styles/ComicGrid.css';

function ComicGrid({ comics = [] }) {
  if (!comics || !Array.isArray(comics)) {
    return <div className="comic-grid-error">Invalid comics data</div>;
  }

  if (comics.length === 0) {
    return <div className="no-comics">No comics found matching your criteria</div>;
  }

  return (
    <section className="comics-section">
      <div className="comics-grid">
        {comics.map((comic) => (
          <ComicCard 
       key={`comic-${comic.id}`}     
            comic={comic} 
          />
        ))}
      </div>
      
    </section>
  );
}

export default ComicGrid;