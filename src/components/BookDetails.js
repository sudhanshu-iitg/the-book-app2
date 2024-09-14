import React, { useState, useEffect } from 'react';
import { Share2, Bookmark, Book, ChevronRight } from 'lucide-react';
import './BookDetails.css';
import ChapterDetails from './ChapterDetails';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const BookDetails = ({ bookId, onBackClick, generateShareableUrl, showChapter, setShowChapter, userId }) => {
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [totalChapters, setTotalChapters] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterProgress, setChapterProgress] = useState({});

  useEffect(() => {
    fetchBookDetails();
    fetchChapters();
  }, [bookId]);

  useEffect(() => {
    if (chapters.length > 0 && userId) {
      fetchChapterProgress();
    }
  }, [chapters, userId]);

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
      
      const totalChapters = data.length;
      const numberedChapters = data.map((chapter, index) => ({
        ...chapter,
        chapter_number: index + 1
      }));
      
      setChapters(numberedChapters);
      setTotalChapters(totalChapters);
    } catch (error) {
      console.error('Error fetching chapters:', error.message);
    }
  };

  const fetchChapterProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId);
  
      if (error) throw error;
  
      const progress = {};
data.forEach(item => {
  progress[item.chapter_id] = {
    cardNumber: item.card_number,
    totalCards: item.total_cards
  };
});
setChapterProgress(progress);
     
      console.log(progress);
    } catch (error) {
      console.error('Error fetching chapter progress:', error.message);
    }
  };
  const handleChapterClick = (chapter) => {
    const lastReadCard = chapterProgress[chapter.id]?.cardNumber || 0;
    setShowChapter({
      ...chapter,
      lastReadCard
    });
    setCurrentChapterIndex(chapter.chapter_number - 1);
  };

  const handleBackToBook = () => {
    setShowChapter(null);
  };

  const getChapterClassName = (chapter) => {
    const baseClass = "rounded-lg transition-colors duration-200 cursor-pointer ";
    const activeClass = chapter.chapter_number === currentChapterIndex + 1 ? "bg-blue-100 border-l-4 border-blue-500 " : "hover:bg-gray-100 ";
    return baseClass + activeClass + "border-b last:border-b-0";
  };

  if (!book) {
    return <div>Loading...</div>;
  }

  if (showChapter) {
    return ( 
      <div className="book-details-container">
        <ChapterDetails 
          bookId={showChapter.book_id}
          chapterId={showChapter.id}
          onBackClick={handleBackToBook}
          chapterTitle={showChapter.chapter_title}
          chapterNumber={showChapter.chapter_number}
          totalChapters={totalChapters}
          userId={userId}
          lastReadCard={showChapter.lastReadCard}
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
            <button className="action-button primary-button" onClick={() => handleChapterClick(chapters[0])}>
              <Book size={16} /> Start Reading
            </button>
            <button className="action-button secondary-button">
              <Bookmark size={16} /> Add to Library
            </button>
            <button className="action-button secondary-button" onClick={generateShareableUrl}>
              <Share2 size={16} /> Share
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
            onClick={() => handleChapterClick(chapter)}
          >
            <span className={`chapter-number ${chapter.chapter_number === currentChapterIndex + 1 ? 'text-blue-500' : 'text-gray-500'}`}>
              {chapter.chapter_number.toString().padStart(2, '0')}
            </span>
            <span className={`chapter-title-listing ${chapter.chapter_number === currentChapterIndex + 1 ? 'font-semibold' : ''}`}>
              {chapter.chapter_title}
              
            </span>
            <span className="chapter-progress">
  {chapterProgress[chapter.id] ? 
    `${chapterProgress[chapter.id].cardNumber}/${chapterProgress[chapter.id].totalCards}` : 
    ''}
</span>
            <ChevronRight className="chapter-arrow" size={16} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookDetails;