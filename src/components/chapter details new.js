import React, { useState, useEffect } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
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
      if (direction === 'next') {
        return prev < content.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : content.length - 1;
      }
    });
  };

  switch (type) {
    case 'biteSize':
      if (!Array.isArray(content) || content.length === 0) {
        return <div className="content-card">No bite-size content available.</div>;
      }
      return (
        <div className="content-card bite-size">
          <div className="card-header">
            <h3 className="card-number">Card {currentCard + 1}</h3>
            <button onClick={() => navigateCards('next')} className="nav-button">
              <ChevronRight />
              <span>Chapter 0{currentCard + 2}</span>
            </button>
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

const ChapterDetails = ({ onBackClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('biteSize');
  const [chapterData, setChapterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bookId = 15;
  const chapterId = 87;

  useEffect(() => {
    const fetchChapterData = async () => {
      try {
        setLoading(true);
        
        // ... (fetching summary and full content remains the same)

        // Fetch bite-size content
        const { data: summaryData, error: summaryError } = await supabase
          .from('summaries')
          .select('content')
          .eq('book_id', bookId)
          .eq('chapter_id', chapterId)
          .single();

        if (summaryError) throw summaryError;

        // Fetch bite-size content
        const { data: biteSizeData, error: biteSizeError } = await supabase
          .from('cards')
          .select('card_content','card_heading')
          .eq('chapter_id', chapterId);

        if (biteSizeError) throw biteSizeError;

        // Fetch full chapter content
        const { data: fullContentData, error: fullContentError } = await supabase
          .from('chapter_contents')
          .select('chapter_title, content')
          .eq('book_id', bookId)
          .eq('id', chapterId)
          .single();

        if (fullContentError) throw fullContentError;


        setChapterData({
          summary: summaryData.content,
          biteSize: biteSizeData,
          fullContent: fullContentData.content,
          title: fullContentData.chapter_title,
          number: chapterId
        });

      } catch (error) {
        console.error('Error fetching chapter data:', error);
        setError('Failed to load chapter data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, []);

  const menuItems = [
    { type: 'biteSize', icon: <CreditCard />, label: 'Bite-Size Content' },
    { type: 'summary', icon: <FileText />, label: 'Summary' },
    { type: 'fullContent', icon: <BookOpen />, label: 'Full Content' },
    { type: 'chat', icon: <MessageSquare />, label: 'Chat' },
  ];

  const handleNavigate = (direction) => {
    console.log(`Navigating to ${direction} chapter`);
    // Implement chapter navigation logic here
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
        <h1>Chapter {chapterData.number || 'N/A'}</h1>
        <button onClick={() => setMenuOpen(!menuOpen)} className="menu-button">
          <Menu />
        </button>
      </header>

      <h2 className="chapter-title">{chapterData.title || 'Untitled Chapter'}</h2>

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
            onNavigate={handleNavigate}
          />
        </div>
      </div>

      {/* Remove chapter navigation buttons */}
    </div>
  );
};

export default ChapterDetails;