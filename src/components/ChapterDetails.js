import React, { useState, useEffect } from 'react';
import { Menu, BookOpen, FileText, MessageSquare, Code, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import './ChapterDetails.css';
import MetadataDisplay from './Metadata.js';
import ContentSection from './Cards.js';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);
const ProcessingAnimation = () => (
  <div className="processing-info mt-4 p-4 bg-blue-50 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div>
          <p className="text-blue-700 font-semibold text-lg">
            Generating chapter cards...
          </p>
          <p className="text-blue-600 text-sm">
            This may take a few moments.
          </p>
        </div>
      </div>
      <div className="processing-animation">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  </div>
);
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
  const [cardContent, setCardContent] = useState([]);
const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
        setCurrentCardIndex(0);
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

  const fetchCardContent = async () => {
    setLoading(true);
    setError(null);
  
    try {
      // Step 1: Fetch cards for the current chapter
      const { data: cardsData, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('chapter_id', currentChapter.id)
        .order('card_num');
  
      if (cardsError) throw cardsError;
  
      if (cardsData && cardsData.length > 0) {
        // Step 2a: Cards found, set them in state
        setCardContent(cardsData);
      } else {
        // Step 2b: No cards found, trigger card generation
        // Show a message to the user (e.g., using a toast or alert)
  
        // Step 3: Call the API to generate cards
        console.log("Generating cards...");
        console.log(`https://thebookapp-production-eb6d.up.railway.app/cards?key=${encodeURIComponent(currentChapter.id)}`);
        const generateResponse = await fetch(`https://thebookapp-production-eb6d.up.railway.app/cards?key=${encodeURIComponent(currentChapter.id)}`);
  
        if (!generateResponse.ok) {
          throw new Error('Failed to generate cards.');
        }
  
        // Step 4: Fetch the cards again after generation
        const { data: generatedCardsData, error: generatedCardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('chapter_id', currentChapter.id)
          .order('card_num');
  
        if (generatedCardsError) throw generatedCardsError;
  
        if (generatedCardsData) {
          setCardContent(generatedCardsData);
        } else {
          setError('Cards were generated, but unable to fetch them.');
        }
      }
    } catch (error) {
      console.error('Error fetching or generating card content:', error);
      setError('Failed to load or generate card content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'content') {
      fetchChapterContent();
    } else if (activeTab === 'cards') {
      // fetchCardContent();
    }
  }, [activeTab, currentChapter.id]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'cards') {
      fetchCardContent();
    }
  };

  const handleMetadataUpdate = (newMetadata) => {
    setMetadata(newMetadata);
    setCurrentChapter(prev => ({
      ...prev,
      metadata: newMetadata
    }));
  };

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
      <button
  onClick={() => handleTabChange('cards')}
  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
    activeTab === 'cards' ? 'bg-white ' 
            : 'bg-transparent'
  }`}
>
  <MessageSquare className={`w-5 h-5 ${activeTab === 'cards' ? 'text-black' : 'text-black'}`} />
</button>
        </div>

        <div className="mt-4">
          {loading ? (
            <ProcessingAnimation />
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
              {activeTab === 'cards' && (
  <ContentSection
    type="cards"
    content={cardContent}
    onNavigate={handleTabChange}
    isLastChapter={currentChapter.number >= totalChapters}
    onNextChapter={() => fetchChapter('next')}
    onCardChange={setCurrentCardIndex}
    initialCard={currentCardIndex}
    setCurrentCard={setCurrentCardIndex}
  />
)}
              
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterDetails;