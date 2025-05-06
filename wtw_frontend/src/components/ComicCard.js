import React from 'react';
import '../styles/ComicCard.css';

function ComicCard({ comic }) {
  return (
    <div className="comic-card">
      <div className="comic-image-container">
        <a href={`/comic/${comic.id}`}>
          <img 
            src={comic.image} 
            // alt={`${comic.title} cover`}
            className="comic-image"
            // onError={(e) => {
            //   e.target.src = `/assets/Image/image${comic.id % 5 + 1}.jpg`;
            // }}
          />
          <span className="new-badge">{comic.genreName || comic.genres}</span>
        </a>
      </div>
      <h4>{comic.comicName}</h4>
    </div>
  );
}

export default ComicCard;