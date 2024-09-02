import React, { useState, useEffect,useRef } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';
import { useSwipeable } from 'react-swipeable';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const ContentSection = ({ type, content, onNavigate }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [slideDirection, setSlideDirection] = useState(null);
  const navigateCards = (direction) => {
    if (!Array.isArray(content)) return;
    setCurrentCard(prev => {
      if (direction === 'next' && prev < content.length - 1) {
        setSlideDirection('left');
        return prev + 1;
      } else if (direction === 'prev' && prev > 0) {
        setSlideDirection('right');
        return prev - 1;
      }
      return prev;
    });
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => navigateCards('next'),
    onSwipedRight: () => navigateCards('prev'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });
  const isFirstCard = currentCard === 0;
  const isLastCard = Array.isArray(content) && currentCard === content.length - 1;
  useEffect(() => {
    const timer = setTimeout(() => setSlideDirection(null), 300);
    return () => clearTimeout(timer);
  }, [currentCard]);
  switch (type) {
    case 'biteSize':
      if (!Array.isArray(content) || content.length === 0) {
        return <div className="content-card">No bite-size content available.</div>;
      }
      return (
        <div className="content-card bite-size" {...handlers}>
          <div className="card-header">
            <h3 className="card-number">Card {currentCard + 1} of {content.length}</h3>
            <div className="navigation-buttons">
              <button 
                onClick={() => navigateCards('prev')} 
                className={`nav-button-prev ${isFirstCard ? 'disabled' : ''}`}
                disabled={isFirstCard}
              >
                <ChevronLeft size={16} />
                {isFirstCard ? 'First' : 'Prev'}
              </button>
              <button 
                onClick={() => navigateCards('next')} 
                className={`nav-button-next ${isLastCard ? 'disabled' : ''}`}
                disabled={isLastCard}
              >
                {isLastCard ? 'Last' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className={`card-content-wrapper ${slideDirection}`}>
            <h2 className="card-heading">{content[currentCard].card_heading}</h2>
            <div className="bite-size-content">
              <p>{content[currentCard].card_content}</p>
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
        <div className="content-card">
          <h3 className="content-title">Full Chapter Content</h3>
          <p>{content || 'Full content not available.'}</p>
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

const ChapterDetails = ({ bookId, chapterId, chapterTitle, onBackClick ,chapterNumber,totalChapters}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('biteSize');
  const [chapterData, setChapterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChapter, setCurrentChapter] = useState({
    id: chapterId,
    title: chapterTitle,
    number: chapterNumber
  });
  const sidebarRef = useRef(null);

  const fetchChapter = async (direction) => {
    setLoading(true);
    setError(null);

    const targetChapterNumber = direction === 'next' ? currentChapter.number + 1 : currentChapter.number - 1;

    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('id, chapter_title, chapter_number, content')
        .eq('book_id', bookId)
        .eq('chapter_number', targetChapterNumber)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentChapter({
          id: data.id,
          title: data.chapter_title,
          number: data.chapter_number
        });
        setChapterData({
          fullContent: data.content,
          biteSize: null,
          summary: null
        });
        setContentType('biteSize'); // Reset to default view
      } else {
        setError(`No ${direction} chapter available.`);
      }
    } catch (error) {
      console.error(`Error fetching ${direction} chapter:`, error);
      setError(`Failed to load ${direction} chapter. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  const handleContentClick = (event) => {
    if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setMenuOpen(false);
    }
  };
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
          break;
        case 'fullContent':
          // We already have full content from fetchChapter, so just use that
          data = chapterData.fullContent;
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
          <h2 className="chapter-number">Chapter {currentChapter.number || 'N/A'}</h2>
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

      <div className="chapter-info">
        <h1 className="chapter-title">{currentChapter.title || 'Untitled Chapter'}</h1>
      </div>

      <div className="content-wrapper">
        {menuOpen && (
          <div className="sidebar" ref={sidebarRef}>
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
          />
        </div>
        
      </div>
    </div>
  );
};

export default ChapterDetails;