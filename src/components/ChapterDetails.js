import React, { useState, useEffect,useRef } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';
import { useSwipeable } from 'react-swipeable';
import saveReadingProgress from './saveReadingProgress'; 
const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const ContentSection = ({ type, content, onNavigate,isLastChapter, onNextChapter,onCardChange,initialCard, setCurrentCard   }) => {
  
  const [slideDirection, setSlideDirection] = useState(null);
  useEffect(() => {
    setCurrentCard(initialCard);
  }, [initialCard, setCurrentCard]);
  const navigateCards = (direction) => {
    if (!Array.isArray(content)) return;
    setCurrentCard(prev => {
      let newCard = prev;
      if (direction === 'next' && prev < content.length - 1) {
        setSlideDirection('left');
        newCard = prev + 1;
      } else if (direction === 'prev' && prev > 0) {
        setSlideDirection('right');
        newCard = prev - 1;
      }
      if (newCard !== prev) {
        onCardChange(content[newCard].id,  content.length,newCard + 1,); // Save progress when card changes
      }
      return newCard;
    });
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => navigateCards('next'),
    onSwipedRight: () => navigateCards('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  const isFirstCard = initialCard  === 0;
  const isLastCard = Array.isArray(content) && initialCard  === content.length - 1;
  useEffect(() => {
    const timer = setTimeout(() => setSlideDirection(null), 300);
    return () => clearTimeout(timer);
  }, [initialCard ]);
  switch (type) {
    case 'biteSize':
      if (!Array.isArray(content) || content.length === 0) {
        return <div className="content-card">No bite-size content available.</div>;
      }
      return (
        <div  {...handlers}>
          <div className="book-excerpt">
          <div className={`card-content-wrapper ${slideDirection}`}>
            <h4>{content[initialCard ].card_heading}</h4>
            <div >
              <p>{content[initialCard ].card_content}</p>
            </div>
          </div></div>
          <div className="card-header">
            <h3 className="card-number">Card {initialCard  + 1} of {content.length}</h3>
            <div className="navigation-buttons">
              <button 
                onClick={() => navigateCards('prev')} 
                className={`nav-button-prev ${isFirstCard ? 'disabled' : ''}`}
                disabled={isFirstCard}
              >
                <ChevronLeft size={16} />
                {isFirstCard ? 'First' : 'Prev'}
              </button>
              {isLastCard ? (
                <button 
                  onClick={onNextChapter} 
                  className={`nav-button next-chapter`}
                  disabled={isLastChapter}
                >
                  Next Chapter
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => navigateCards('next')} 
                  className="nav-button-next"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      );
    case 'summary':
      return (
        <div className="content-card">
          <h3 className="content-title">Chapter Summary</h3>
          <p>{content || 'No summary available.'}</p>
        </div>
      );
      case 'fullContent':
        return (
          <div className="content-card full-content">
            <pre>{content || 'Full content not available.'}</pre>
          </div>
        );
    case 'chat':
      return (
        <div className="content-card">
          <h3 className="content-title">Chat with AI</h3>
          <p>Chat interface would go here...</p>
        </div>
      );
    default:
      return null;
  }
};

const ChapterDetails = ({ bookId, chapterId, chapterTitle, onBackClick ,chapterNumber,totalChapters, userId,lastReadCard, bookTitle }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('biteSize');
  const [chapterData, setChapterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialCard, setInitialCard] = useState(lastReadCard || 1);
  const [currentCard, setCurrentCard] = useState(lastReadCard || 0);
  const [currentChapter, setCurrentChapter] = useState({
    id: chapterId,
    title: chapterTitle,
    number: chapterNumber
  });
  const sidebarRef = useRef(null);
  
  const handleCardChange = (cardId,card_number, total_cards) => {
    // Save progress when a new card is viewed
    if (userId) {
      saveReadingProgress(userId, bookId, currentChapter.id, cardId,card_number, total_cards);
    }
  };
  
  const fetchChapter = async (direction, book_id) => {
    setLoading(true);
    setError(null);
  
    const targetChapterNumber = direction === 'next' ? currentChapter.number + 1 : currentChapter.number - 1;
  
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('id, chapter_title, chapter_number, content')
        .eq('book_id', bookId ?? book_id)
        .eq('chapter_number', targetChapterNumber)
        .single();
  
      if (error) throw error;
  
      if (data) {
        setCurrentChapter({
          id: data.id,
          title: data.chapter_title,
          number: data.chapter_number
        });
        setInitialCard(0);
        setCurrentCard(0);
        setChapterData({}); // Clear previous chapter data
        navigate(`/books/${bookId}/chapters/${data.id}`, { replace: true });
        
        // Fetch the new chapter's content
        fetchContentData(contentType);
      } else {
        setError(`No ${direction} chapter available.`);
      }
    } catch (error) {
      console.error(`Error fetching ${direction} chapter:${targetChapterNumber}`, error, targetChapterNumber);
      setError(`Failed to load ${direction} chapter. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  const fetchNextChapter = () => {
    fetchChapter('next',bookId);
  };
  const handleContentClick = (event) => {
    if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };
  const sidebarSwipeHandlers = useSwipeable({
    onSwipedLeft: () => setMenuOpen(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  useEffect(() => {
    if (currentChapter.id && contentType) {
      fetchContentData(contentType);
    }
  }, [currentChapter.id, contentType]);
  const fetchContentData = async (type) => {
    setLoading(true);
    setError(null);
  
    try {
      let data;
  
      switch (type) {
        case 'summary':
          const { data: summaryData, error: summaryError } = await supabase
            .from('summaries')
            .select('content')
            .eq('chapter_id', currentChapter.id)
            .single();
          if (summaryError) throw summaryError;
          data = summaryData.content;
          break;
        case 'biteSize':
          const { data: biteSizeData, error: biteSizeError } = await supabase
            .from('cards')
            .select('*')
            .eq('chapter_id', currentChapter.id);
          if (biteSizeError) throw biteSizeError;
          data = biteSizeData;
          setInitialCard(0);
          setCurrentCard(0);
          if (data.length > 0) {
            handleCardChange(data[0].id, data.length, 1);
          }
          break;
        case 'fullContent':
          const { data: chapterData, error: chapterDataError } = await supabase
            .from('chapter_contents')
            .select('*')
            .eq('id', currentChapter.id);
          if (chapterDataError) throw chapterDataError;
          console.log(chapterData[0].content);
          data = chapterData[0].content.trimStart();
        
          break;
        default:
          data = null;
      }
  
      setChapterData(prevData => ({
        ...prevData,
        [type]: data
      }));
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
      setError(`Failed to load ${type} data. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (contentType && !chapterData[contentType]) {
      fetchContentData(contentType);
    }
  }, [contentType, currentChapter.id]);


  const menuItems = [
    { type: 'biteSize', icon: <CreditCard size={18} />, label: 'Bite-Size Content' },
    { type: 'summary', icon: <FileText size={18} />, label: 'Summary' },
    { type: 'fullContent', icon: <BookOpen size={18} />, label: 'Full Content' },
    { type: 'chat', icon: <MessageSquare size={18} />, label: 'Chat' },
  ];

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const fetchChapterDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('id, chapter_title, chapter_number, content')
        .eq('id', chapterId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentChapter({
          id: data.id,
          title: data.chapter_title,
          number: data.chapter_number
        });
      } else {
        setError('Chapter not found.');
      }
    } catch (error) {
      console.error('Error fetching chapter details:', error);
      setError('Failed to load chapter details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!chapterTitle || !chapterNumber) {
      fetchChapterDetails();
    }
  }, [chapterId]);


  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  if (!chapterData) {
    return (
      <div className="chapter-details">
        <header className="chapter-header">
          <button onClick={onBackClick} className="back-button">
            <ArrowLeft />
            Back to Book
          </button>
          <h1>Chapter Details</h1>
        </header>
        <div className="content-card">
          <p>Chapter information not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-details">
      <header className="chapter-header">
        <div className="header-left">
          <button onClick={toggleMenu} className="menu-button">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="chapter-navigation">
  {bookTitle ? (bookTitle.length > 28 ? `${bookTitle.substring(0, 28)}...` : bookTitle) : '-'}
</h2>
        </div>
        <div className="header-right">
          <button 
            onClick={() => fetchChapter('prev')} 
            disabled={currentChapter.number <= 1 || loading}
            className="nav-button prev-chapter"
          >
            <ChevronLeft size={18} />
            Previous Chapter
          </button>
          <button 
            onClick={() => fetchChapter('next')} 
            disabled={currentChapter.number >= totalChapters || loading}
            className="nav-button next-chapter"
          >
            Next Chapter
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      
        <h3 >Chapter {currentChapter.number || '-'} - {currentChapter.title || 'Untitled Chapter'}</h3>
      

      <div className="content-wrapper">
        {menuOpen && (
          <div className="sidebar" ref={sidebarRef}{...sidebarSwipeHandlers}>
            {menuItems.map((item) => (
              <button
                key={item.type}
                onClick={() => setContentType(item.type)}
                className={`sidebar-item ${contentType === item.type ? 'active' : ''}`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        )}
          <div className="main-content" onClick={handleContentClick}>
    <ContentSection
      type={contentType}
      content={chapterData[contentType]}
      isLastChapter={currentChapter.number >= totalChapters}
      onNextChapter={fetchNextChapter}
      onCardChange={handleCardChange} 
      initialCard={currentCard}
      setCurrentCard={setCurrentCard}
    />
  </div>
</div>
        
      
    </div>
  );
};

export default ChapterDetails;