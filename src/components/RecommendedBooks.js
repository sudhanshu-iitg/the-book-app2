import React from 'react';
import { Star } from 'lucide-react';

const RecommendedBooks = ({ recommenders, onRecommenderClick }) => {
  return (
    <div className="recommended-books-container">
      <h2 className="section-title">Books recommended by</h2>
      <div className="recommended-books-card">
        <div className="book-list">
          {recommenders.map((recommender) => (
            <div 
              key={recommender.id} 
              className="book-item" 
              onClick={() => onRecommenderClick(recommender.id)}
            >
              <div className="book-image-container">
                <img src={recommender.image_url} alt={recommender.name} className="book-image" />
                <Star className="star-icon" size={16} />
              </div>
              <div className="book-info">
                <h3 className="book-name">{recommender.name}</h3>
                <p className="book-description">{recommender.profession}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendedBooks;