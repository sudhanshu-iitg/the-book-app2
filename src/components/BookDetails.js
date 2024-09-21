import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { Share2, Bookmark, Book, ChevronRight, CheckCircle,AlertCircle  , Clipboard } from 'lucide-react';
import './BookDetails.css';
import ChapterDetails from './ChapterDetails';
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const BookDetails = ({ bookId, onBackClick, showChapter, setShowChapter, userId, bookNeedsRequest, bookTitle,bookAuthor,bookUrl }) => {
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [totalChapters, setTotalChapters] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [chapterProgress, setChapterProgress] = useState({});
  const [requestStatus, setRequestStatus] = useState('idle'); 

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookNeedsRequest) {
      fetchBookDetails();
      fetchChapters();
    }
  }, [bookId, bookNeedsRequest]);

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
    navigate(`/books/${bookId}/chapters/${chapter.id}`);
    // navigate(`/chapters/${chapter.id}`);
    setShowChapter({
      ...chapter,
      lastReadCard
    });
    setCurrentChapterIndex(chapter.chapter_number - 1);
  };

  // const handleBackToBook = () => {
    
  //   setShowChapter(null);
  //   // navigate(`/books/${bookId}/chapters`);
  //   navigate(`/books/${book.Id}`);
  // };

  const getChapterClassName = (chapter) => {
    const baseClass = "rounded-lg transition-colors duration-200 cursor-pointer ";
    const activeClass = chapter.chapter_number === currentChapterIndex + 1 ? "bg-blue-100 border-l-4 border-blue-500 " : "hover:bg-gray-100 ";
    return baseClass + activeClass + "border-b last:border-b-0";
  };


// updation

const generateShareableUrl = async () => {
  const shareableLink = `${window.location.origin}/books/${bookId}`;

  try {
    await navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};


  const handleRequestBook = async () => {
    // Immediately update UI
    setRequestStatus('requested');

    try {
      const apiUrl = `https://thebookapp-production-eb6d.up.railway.app/store?key=true&url=${encodeURIComponent(bookUrl)}&title=${encodeURIComponent(bookTitle)}&author=${encodeURIComponent(bookAuthor || 'Unknown Author')}&id=${encodeURIComponent(bookId)}`;
      console.log(apiUrl);
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Update UI after successful request
      setRequestStatus('success');
    } catch (error) {
      console.error('Error requesting book:', error.message);
      // Update UI to show error state
      setRequestStatus('error');
    }
  };

  const renderRequestButton = () => {
    switch (requestStatus) {
      case 'requested':
      case 'success':
        return (
          <button 
            className="action-button bg-green-500 hover:bg-green-600"
            disabled
          >
            <CheckCircle size={16} className="mr-2" />
            Requested
          </button>
        );
      case 'error':
        return (
          <button 
            className="action-button bg-red-500 hover:bg-red-600"
            onClick={handleRequestBook}
          >
            <AlertCircle size={16} className="mr-2" />
            Try Again
          </button>
        );
      default:
        return (
          <button 
            className="action-button primary-button"
            onClick={handleRequestBook}
          >
            <Book size={16} className="mr-2" />
            Request This Book
          </button>
        );
    }
  };

  if (bookNeedsRequest) {
    return (
      <div className="book-details-container">
        <div className="book-details-header">
          <div className="book-info">
            <h1 className="book-title">{bookTitle}</h1>
            <p className="book-author">{bookAuthor}</p>
            <div className="book-actions">
              {renderRequestButton()}
            </div>
          </div>
        </div>
        <p className="mt-4">
          We're sorry, but this book is not currently available in our system. 
          {requestStatus === 'success' || requestStatus === 'requested' ? (
            <span className="text-green-600 font-semibold">
              Thank you for your request! We'll add this book to our collection soon.
            </span>
          ) : requestStatus === 'error' ? (
            <span className="text-red-600 font-semibold">
              There was an error processing your request. Please try again.
            </span>
          ) : (
            "If you'd like us to add it to our collection, please click the 'Request This Book' button above."
          )}
        </p>
      </div>
    );
  }

  if (!book) {
    return <div>Loading...</div>;
  }

  if (showChapter) {
    return ( 
      <div className="book-details-container">
        <ChapterDetails 
          bookId={showChapter.book_id}
          chapterId={showChapter.id}
          // onBackClick={handleBackToBook}
          chapterTitle={showChapter.chapter_title}
          chapterNumber={showChapter.chapter_number}
          totalChapters={totalChapters}
          userId={userId}
          lastReadCard={showChapter.lastReadCard}
          bookTitle={book.Title}
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
            {copied ? <Clipboard size={16} /> : <Share2 size={16} />}
            {copied ? 'Copied!' : 'Share'}
              {/* <Share2 size={16} /> Share */}
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