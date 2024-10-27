import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';
import { useSwipeable } from 'react-swipeable';
import saveReadingProgress from './saveReadingProgress';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const ChapterDetails = ({ 
  bookId, 
  chapterId, 
  chapterTitle, 
  onBackClick, 
  chapterNumber, 
  totalChapters, 
  bookTitle,
  metadata: initialMetadata 
}) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [contentType, setContentType] = useState('biteSize');
  const [chapterData, setChapterData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [currentChapter, setCurrentChapter] = useState({
    id: chapterId,
    title: chapterTitle,
    number: chapterNumber,
    metadata: initialMetadata
  });
  const sidebarRef = useRef(null);

  const fetchChapter = async (direction, book_id) => {
    setLoading(true);
    setError(null);
  
    const targetChapterNumber = direction === 'next' ? currentChapter.number + 1 : currentChapter.number - 1;
  
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select("*")
        .eq('book_id', bookId ?? book_id)
        .eq('chapter_number', targetChapterNumber)
        .single();
  
      if (error) throw error;
  
      if (data) {
        setCurrentChapter({
          id: data.id,
          title: data.chapter_title,
          number: data.chapter_number,
          metadata: data.metadata // Make sure to include metadata here
        });
        setMetadata(data.metadata); // Update metadata state
        setChapterData({});
        navigate(`/books/${bookId}/chapters/${data.id}`, { replace: true });
      } else {
        setError(`No ${direction} chapter available.`);
      }
    } catch (error) {
      console.error(`Error fetching ${direction} chapter:${targetChapterNumber}`, error);
      setError(`Failed to load ${direction} chapter. Please try again later.`);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchChapterDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('id, chapter_title, chapter_number, content, metadata')
        .eq('id', chapterId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentChapter({
          id: data.id,
          title: data.chapter_title,
          number: data.chapter_number,
          metadata: data.metadata
        });
        setMetadata(data.metadata);
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

  // Add effect to update metadata when initialMetadata changes
  useEffect(() => {
    setMetadata(initialMetadata);
  }, [initialMetadata]);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (error) {
    return <div className="error-screen">{error}</div>;
  }

  return (
    <div className="chapter-details">
      <header className="chapter-header">
        <div className="header-left">
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

      <h3>Chapter {currentChapter.number || '-'} - {currentChapter.title || 'Untitled Chapter'}</h3>

      <div className="content-wrapper">
        <div className="content-card">
          <h3 className="content-title">Chapter Summary</h3>
          <p>{metadata || currentChapter.metadata || 'No summary available.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ChapterDetails;