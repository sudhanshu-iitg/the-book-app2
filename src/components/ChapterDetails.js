import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, FileText, MessageSquare, Code, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';
import MetadataDisplay from './Metadata.js';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(initialMetadata);
  const [activeTab, setActiveTab] = useState('metadata');
  const [chapterContent, setChapterContent] = useState('');
  const [currentChapter, setCurrentChapter] = useState({
    id: chapterId,
    title: chapterTitle,
    number: chapterNumber,
    metadata: initialMetadata
  });

  const fetchChapter = async (direction) => {
    setLoading(true);
    setError(null);
  
    const targetChapterNumber = direction === 'next' ? currentChapter.number + 1 : currentChapter.number - 1;
  
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select("*")
        .eq('book_id', bookId)
        .eq('chapter_number', targetChapterNumber)
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
        setChapterContent('');
        navigate(`/books/${bookId}/chapters/${data.id}`, { replace: true });
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

  const fetchChapterContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('content')
        .eq('id', chapterId)
        .single();

      if (error) throw error;
      if (data) {
        setChapterContent(data.content);
      }
    } catch (error) {
      console.error('Error fetching chapter content:', error);
      setError('Failed to load chapter content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'content') {
      fetchChapterContent();
    }
  }, [activeTab, currentChapter.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMetadataUpdate = (newMetadata) => {
    setMetadata(newMetadata);
    setCurrentChapter(prev => ({
      ...prev,
      metadata: newMetadata
    }));
  };

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

      <div className="bg-gray-100 rounded-lg ">
      <div
  className="gap-2 p-2 bg-gray-100 rounded-lg"
  style={{
    display: "inline-flex", // Inline-flex ensures wrapping content width
    
    background: "#f5f5f5",
    borderRadius: "8px"
  }}
>
      <button
        onClick={() => handleTabChange('metadata')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          activeTab === 'metadata' 
            ? 'bg-white shadow-sm' 
            : 'hover:bg-white/50 bg-grey'
        }`}
        style={{background: "#f5f5f5"}}
      >
        <Code 
          className={`w-5 h-5 ${
            activeTab === 'metadata' 
              ? 'text-black' 
              : 'text-black'
          }`}
        />
      </button>
      <button
        onClick={() => handleTabChange('content')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
          activeTab === 'content' 
            ? 'bg-white shadow-sm' 
            : 'bg-yellow'
        }`}
        style={{background: "#f5f5f5"}}
      >
        <BookOpen 
          className={`w-5 h-5 ${
            activeTab === 'content' 
              ? 'text-black' 
              : 'text-black '
          }`}
        />
      </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-red-600 py-4">{error}</div>
          ) : (
            <>
              {activeTab === 'metadata' && (
                <MetadataDisplay 
                  metadata={metadata || currentChapter.metadata}
                  chapterId={chapterId}
                  bookId={bookId}
                  onMetadataUpdate={handleMetadataUpdate}
                />
              )}
              {activeTab === 'content' && (
                <div style={{ whiteSpace: 'pre-wrap', width: '100%' }}>
                  {chapterContent}
                </div>
              )}
              
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterDetails;