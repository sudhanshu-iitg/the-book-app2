import React from 'react';
import BookCover from './BookCover.js';
import './Profession.css';

const ProfessionBooks = ({ profession, onBookClick }) => {
  return (
    <div className="profession-books">
      <h3 className="profession-title">{profession.name}</h3>
      <div className="book-list-horizontal">
        {profession.books.map((book) => (
          <div key={book.Id} className="book-item-horizontal" onClick={() => onBookClick(book)}>
            <div className="book-cover-wrapper">
              <BookCover book={book} />
            </div>
            <div className="book-details">
              <h4 className="book-title">{book.Title}</h4>
              <p className="book-author">{book.Author || 'Unknown Author'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfessionBooks;