import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Book, ChevronRight } from 'lucide-react';
import './BookDetails.css';
import ChapterDetails from './ChapterDetails';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const BookDetails = ({ bookId, onBackClick, generateShareableUrl }) => {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  useEffect(() => {
    fetchBookDetails();
    fetchChapters();
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('Id', bookId)
        .single();

      if (error) throw error;
      setBook(data);
    } catch (error) {
      console.error('Error fetching book details:', error.message);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('*')
        .eq('book_id', bookId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error.message);
    }
  };

  const handleChapterClick = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentChapterIndex(chapter.chapter_number - 1);
  };

  const handleBackToBook = () => {
    setSelectedChapter(null);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIndex);
      setSelectedChapter(chapters[nextIndex]);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIndex);
      setSelectedChapter(chapters[prevIndex]);
    }
  };

  const getChapterClassName = (chapter) => {
    const baseClass = "p-4 rounded-lg transition-colors duration-200 cursor-pointer ";
    const activeClass = chapter.chapter_number === currentChapterIndex + 1 ? "bg-blue-100 border-l-4 border-blue-500 " : "hover:bg-gray-100 ";
    return baseClass + activeClass + "border-b last:border-b-0";
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  if (selectedChapter) {
    return ( 
      <div className="book-details-container">
        <ChapterDetails 
          bookId={selectedChapter.book_id}
          chapterId={selectedChapter.id}
          chapter={selectedChapter}
          onBackClick={handleBackToBook}
         chapterTitle={selectedChapter.chapter_title}
        />
      </div>
    );
  }

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
        {chapters.map((chapter) => (
          <div 
            key={chapter.chapter_number}
            className={getChapterClassName(chapter)}
            onClick={() => {
              console.log(`Clicked on chapter ${JSON.stringify(chapter) }: ${chapter.chapter_title}`);
              handleChapterClick(chapter);
            }}
          >
            <span className={`chapter-number ${chapter.chapter_number === currentChapterIndex + 1 ? 'text-blue-500' : 'text-gray-500'}`}>
              {/* {chapter.chapter_number.toString().padStart(2, '0')} */}
            </span>
            <span className={`chapter-title-listing ${chapter.chapter_number === currentChapterIndex + 1 ? 'font-semibold' : ''}`}>
              {chapter.chapter_title}
            </span>
            <ChevronRight className="chapter-arrow" />
          </div>
        ))}
      </div>
      
      <div className="chapter-navigation">
        <button 
          className="nav-button"
          onClick={handlePreviousChapter}
          disabled={currentChapterIndex === 0}
        >
          Previous Chapter
        </button>
        <button 
          className="nav-button"
          onClick={handleNextChapter}
          disabled={currentChapterIndex === chapters.length - 1}
        >
          Next Chapter
        </button>
      </div>
    </div>
  );
};

export default BookDetails;