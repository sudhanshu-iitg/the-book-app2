import React from 'react';
import { BookOpen } from 'lucide-react';

const ProfessionBooks = ({ professions, onProfessionClick }) => {
  return (
    <div className="profession-books-container">
      <h2 className="section-title">Books for Professionals</h2>
      <div className="profession-books-card">
        <div className="book-list">
          {professions.map((profession) => (
            <div 
              key={profession.id} 
              className="book-item" 
              onClick={() => onProfessionClick(profession.id)}
            >
              <div className="book-image-container">
                {profession.image_url ? (
                  <img 
                    src={profession.image_url} 
                    alt={profession.name} 
                    className="book-image"
                  />
                ) : (
                  <BookOpen className="book-icon" size={48} />
                )}
              </div>
              <div className="book-info">
                <h3 className="book-name">{profession.name}</h3>
                <p className="book-description">{profession.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfessionBooks;