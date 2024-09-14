import React from 'react';
import { Book } from 'lucide-react';

const RecentlyReadBooks = ({ books, onBookClick }) => {
  return (
    <div className="recently-read-books">
      <h2><Book size={24} /> My Books</h2>
      <div className="book-list">
        {books.map((book) => (
          <div 
            key={book.Id} 
            className="book-item"
            onClick={() => onBookClick(book)}
          >
            {book.coverUrl && (
              <div className="book-cover-wrapper">
                <img 
                  src={book.coverUrl} 
                  alt={book.Title} 
                  className="book-cover"
                  style={{ display: 'block', margin: 'auto' }}
                />
              </div>
            )}
            <div className={`book-details ${!book.coverUrl ? 'no-cover' : ''}`}>
              <div>
                <h3 className="book-title-list">{book.Title}</h3>
                <p className="book-author-list">{book.Author ? book.Author : 'Unknown Author'}</p>
              </div>
              <button className="book-action">
                Continue Reading
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyReadBooks;