import React from 'react';
import { Share2, Bookmark, Book, ChevronRight } from 'lucide-react';
import './BookDetails.css';
import ChapterDetails from './ChapterDetails';

const BookDetails = ({ 
  book, 
  summary, 
  chapterContent, 
  onBackClick, 
  onNextChapter, 
  onPreviousChapter, 
  currentChapterIndex, 
  totalChapters, 
  generateShareableUrl,
  onChapterSelect 
}) => {
  const handleChapterClick = (chapter) => {
    onChapterSelect(chapter);
  };

  return (
    <div className="book-details-container">
      <div className="book-details-header">
        {book.coverUrl && (
          <img src={book.coverUrl} alt={book.Title} className="book-cover-small" />
        )}
        <div className="book-info">
          <h1 className="book-title">{book.Title}</h1>
          <p className="book-author">by {book.Author}</p>
          <div className="book-actions">
            <button className="action-button primary-button">
              <Book size={18} /> Start Reading
            </button>
            <button className="action-button secondary-button">
              <Bookmark size={18} /> Add to Library
            </button>
            <button className="action-button secondary-button" onClick={generateShareableUrl}>
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="table-of-contents-header">
        <h2 className="toc-title">Table of Contents</h2>
        <div className="toc-divider"></div>
      </div>
      
      <div className="chapters-list">
        {book.chapters.map((chapter) => (
          <div 
            key={chapter.number}
            className={`chapter-item ${chapter.title === summary?.title ? 'active' : ''}`}
            onClick={() => handleChapterClick(chapter)}
          >
            <span className="chapter-number">{chapter.number.toString().padStart(2, '0')}</span>
            <span className="chapter-title-listing">{chapter.title}</span>
            <ChevronRight className="chapter-arrow" />
          </div>
        ))}
      </div>
      
      {summary && (
        <ChapterDetails 
          chapter={summary}
          content={chapterContent}
          onBackClick={onBackClick}
          onNextChapter={onNextChapter}
          onPreviousChapter={onPreviousChapter}
          currentChapterIndex={currentChapterIndex}
          totalChapters={totalChapters}
        />
      )}
    </div>
  );
};

export default BookDetails;