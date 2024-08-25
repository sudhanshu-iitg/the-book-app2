import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const ContentSection = ({ type, content, onNavigate }) => {
  const [currentCard, setCurrentCard] = useState(0);

  const navigateCards = (direction) => {
    if (!Array.isArray(content)) return;
    setCurrentCard(prev => {
      if (direction === 'next' && prev < content.length - 1) {
        return prev + 1;
      } else if (direction === 'prev' && prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  };

  const isFirstCard = currentCard === 0;
  const isLastCard = Array.isArray(content) && currentCard === content.length - 1;

  switch (type) {
    case 'biteSize':
      if (!Array.isArray(content) || content.length === 0) {
        return <div className="content-card">No bite-size content available.</div>;
      }
      return (
        <div className="content-card bite-size">
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
          <h2 className="card-heading">{content[currentCard].card_heading}</h2>
          <div className="bite-size-content">
            <p>{content[currentCard].card_content}</p>
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

const ChapterDetails = ({ bookId, chapterId, chapterTitle, onBackClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('biteSize');
  const [chapterData, setChapterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchContentData = async (type) => {
    setLoading(true);
    setError(null);
  
    try {
      let data;
      const fixedBookId = 15;
      const fixedChapterId = 87;
  
      switch (type) {
        case 'summary':
          const { data: summaryData, error: summaryError } = await supabase
            .from('summaries')
            .select('content')
            .eq('book_id', bookId)
            .eq('chapter_id', chapterId)
            .single();
          if (summaryError) {
            console.error('Error fetching summary, using fixed IDs:', summaryError);
            const { data: fixedSummaryData, error: fixedSummaryError } = await supabase
              .from('summaries')
              .select('content')
              .eq('book_id', fixedBookId)
              .eq('chapter_id', fixedChapterId)
              .single();
            if (fixedSummaryError) throw fixedSummaryError;
            data = fixedSummaryData.content;
          } else {
            data = summaryData.content;
          }
          break;
        case 'biteSize':
          const { data: biteSizeData, error: biteSizeError } = await supabase
            .from('cards')
            .select('*')
            .eq('chapter_id', chapterId);
          if (biteSizeError) {
            console.error('Error fetching bite-size content, using fixed IDs:', biteSizeError);
            console.error('Book ID:', bookId, 'Chapter ID:', chapterId);
            const { data: fixedBiteSizeData, error: fixedBiteSizeError } = await supabase
              .from('cards')
              .select('*')
              .eq('chapter_id', fixedChapterId);
            if (fixedBiteSizeError) throw fixedBiteSizeError;
            data = fixedBiteSizeData;
          } else {
            data = biteSizeData;
          }
          break;
        case 'fullContent':
          const { data: fullContentData, error: fullContentError } = await supabase
            .from('chapter_contents')
            .select('content')
            .eq('book_id', bookId)
            .eq('id', chapterId)
            .single();
          if (fullContentError) {
            console.error('Error fetching full content, using fixed IDs:', fullContentError);
            const { data: fixedFullContentData, error: fixedFullContentError } = await supabase
              .from('chapter_contents')
              .select('content')
              .eq('book_id', fixedBookId)
              .eq('id', fixedChapterId)
              .single();
            if (fixedFullContentError) throw fixedFullContentError;
            data = fixedFullContentData.content;
          } else {
            data = fullContentData.content;
          }
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
  }, [contentType, bookId, chapterId]);


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
        <button onClick={toggleMenu} className="menu-button">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="chapter-info">
        <h2 className="chapter-number">Chapter {chapterData.number || 'N/A'}</h2>
        <h1 className="chapter-title">{chapterTitle || 'Untitled Chapter'}</h1>
      </div>

      <div className="content-wrapper">
        {menuOpen && (
          <div className="sidebar">
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
        <div className="main-content">
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