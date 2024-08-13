import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import './App.css';
import PdfViewer from './PdfViewer';
import { Document, Page, pdfjs } from "react-pdf";
import { createClient } from "@supabase/supabase-js";
import { Share2 } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const supabaseUrl = process.env.REACT_APP_supabaseUrl
const supabaseKey = process.env.REACT_APP_supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)

const Toast = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#333',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '5px',
      zIndex: 1000
    }}>
      {message}
    </div>
  );
};
function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
  const [showBooks, setShowBooks] = useState(false);
  const [showBackIcon, setShowBackIcon] = useState(false);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [breadcrumbs, setBreadcrumbs] = useState(['Categories']);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [chapterContent, setChapterContent] = useState('');
  const [activeTab, setActiveTab] = useState('summary');
  const [sharedUrl, setSharedUrl] = useState('');
  const [toastMessage, setToastMessage] = useState("");
const [isToastVisible, setIsToastVisible] = useState(false);

  useEffect(() => {
    fetchCategories();
    handleSharedUrl();
  }, [window.location.search]);

  const handleSharedUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    const chapterTitle = urlParams.get('chapter');
  
    console.log('Shared URL parameters:', { bookId, chapterTitle });
  
    if (!bookId || !chapterTitle) {
      console.error('Invalid shared URL: missing bookId or chapterTitle');
      // setError('Invalid shared URL: missing book ID or chapter title');
      return;
    }
  
    try {
      // Fetch book data
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('Title')
        .eq('Id', bookId)
        .single();
  
      if (bookError) throw bookError;
      console.log('Book data:', bookData);
  
      // Fetch summary data
      const { data: summaryData, error: summaryError } = await supabase
        .from('summaries')
        .select('content')
        .eq('book_id', bookId)
        .single();
  
      if (summaryError) throw summaryError;
      console.log('Summary data:', summaryData);
  
      // Fetch chapter content
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapter_contents')
        .select('content')
        .eq('book_id', bookId)
        .eq('chapter_title', chapterTitle)
        .single();
  
      if (chapterError) throw chapterError;
      console.log('Chapter data:', chapterData);
  
      if (summaryData && summaryData.content && chapterData) {
        let parsedContent = JSON.parse(summaryData.content.trim());
        setSummary(parsedContent);
        setSelectedChapter(chapterTitle);
        setCurrentChapterIndex(Object.keys(parsedContent).indexOf(chapterTitle));
        setBreadcrumbs(['Categories', bookData.title, chapterTitle]);
        setShowCategories(false);
        setShowBooks(false);
        setShowBackIcon(true);
        setSelectedBookId(bookId);
        setChapterContent(chapterData.content);
        setActiveTab('summary');
      } else {
        throw new Error('Missing data in the response');
      }
    } catch (error) {
      console.error('Error handling shared URL:', error.message);
      // setError(`Error loading shared content: ${error.message}`);
    }
  };
  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };
  
  const hideToast = () => {
    setIsToastVisible(false);
  };
  const generateShareableUrl = () => {
    if (!selectedBookId || !selectedChapter) {
      console.error('Cannot generate shareable URL: missing bookId or chapter');
      // setError('Cannot generate shareable URL: missing book ID or chapter');
      return;
    }
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/?bookId=${selectedBookId}&chapter=${encodeURIComponent(selectedChapter)}`;
    setSharedUrl(shareUrl);
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast("Link copied to clipboard!");
    }).catch((err) => {
      console.error('Failed to copy link:', err);
      showToast("Failed to copy link. Please try again.");
    });
    console.log('Generated shareable URL:', shareUrl);
  };

  const fetchChapterContent = async (bookId, chapterTitle) => {
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('content')
        .eq('book_id', bookId)
        .eq('chapter_title', chapterTitle)
        .single();

      if (error) {
        console.error('Error fetching chapter content:', error.message, { bookId, chapterTitle });
        throw error;
      }

      setChapterContent(data.content);
    } catch (error) {
      console.error('Error fetching chapter content:', error.message);
      setChapterContent('');
    }
  };
  const handleBookClick = async (book) => {
    try {
      const { data: bookData } = await supabase
        .from('books')
        .select('title')
        .eq('id', book.Id)
        .single();
      const { data, error } = await supabase
        .from('summaries')
        .select('content')
        .eq('book_id', book.Id)
        .single();
      if (error) throw error;
  
      if (data && data.content) {
        let parsedContent = JSON.parse(data.content.trim());
        const firstChapter = Object.keys(parsedContent)[0];
        setSummary(parsedContent);
        setSelectedChapter(firstChapter);
        setCurrentChapterIndex(0);
        setBreadcrumbs(prev => [...prev, book.Title, firstChapter]);
        setShowBooks(false);
        setShowBackIcon(true);
        setSelectedBookId(book.Id);
        
        // Fetch the content of the first chapter
        await fetchChapterContent(book.Id, firstChapter);
      } else {
        setShowPopup(true);
      }
    } catch (error) {
      console.error('Error fetching summary:', error.message);
      setShowPopup(true);
    }
  };
  const Popup = ({ onClose, bookTitle }) => {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>Summary Not Available</h2>
          <p>The summary for "{bookTitle}" is not available yet.</p>
          <p>Book summaries on demand will be available in the near future.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  };
  const handleNextChapter = async () => {
    const chapters = Object.keys(summary);
    if (currentChapterIndex < chapters.length - 1) {
      const nextIndex = currentChapterIndex + 1;
      const nextChapter = chapters[nextIndex];
      setCurrentChapterIndex(nextIndex);
      setSelectedChapter(nextChapter);
      setBreadcrumbs(prev => [...prev.slice(0, -1), nextChapter]);
      await fetchChapterContent(selectedBookId, nextChapter);
    }
  };
  
  const handlePreviousChapter = async () => {
    if (currentChapterIndex > 0) {
      const prevIndex = currentChapterIndex - 1;
      const prevChapter = Object.keys(summary)[prevIndex];
      setCurrentChapterIndex(prevIndex);
      setSelectedChapter(prevChapter);
      setBreadcrumbs(prev => [...prev.slice(0, -1), prevChapter]);
      await fetchChapterContent(selectedBookId, prevChapter);
    }
  };
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'fullChapter' && !chapterContent) {
      fetchChapterContent(selectedBookId, selectedChapter);
    }
  };
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };

  const fetchBooksByCategory = async (categoryId) => {
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('name')
        .eq('id', categoryId)
        .single();
  
      const { data: booksData, error } = await supabase
        .from('books')
        .select('*')
        .eq('category_id', categoryId);
  
      if (error) throw error;
  
      setBooks(booksData);
      setBreadcrumbs(['Categories', categoryData.name]);
      setShowCategories(false);
      setShowBooks(true);
      setShowBackIcon(true);
    } catch (error) {
      console.error('Error fetching books:', error.message);
    }
  };
  const handleBackClick = () => {
    if (showBooks) {
      setShowBooks(false);
      setShowCategories(true);
      setBreadcrumbs(['Categories']);
      setShowBackIcon(false);
    } else if (summary) {
      setShowBooks(true);
      setSummary(null);
      setSelectedChapter(null);
      setBreadcrumbs((prev) => prev.slice(0, -1)); // Remove the book title
      setShowBackIcon(true);
    }
  };
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }
  
    setIsLoading(true);
    try {
      console.log('searchTerm:', searchTerm);
      const response = await fetch(`https://auto-01px.onrender.com/search?key=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.docs && Array.isArray(data.docs)) {
        setBooks(data.docs.slice(0, 10));
        console.log('Books:', data.docs.slice(0, 10)); // Limiting to 10 results
        setShowCategories(false);
        setShowBooks(true);
        setShowBackIcon(true);
        setBreadcrumbs([ 'Search Results']);
      } else {
        console.error('Unexpected data structure:', data);
        alert('No results found or unexpected data structure');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

 
  return (
    <div className="App">
      <header>
        <div className="search-container">
  <input
    type="text"
    placeholder="Search for books..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
  />
  <button onClick={handleSearch} disabled={isLoading}>
    {isLoading ? 'Searching...' : 'Search'}
  </button>
</div>
        {showBackIcon && (
          <div className="back-button-container">
            <button className="back-button" onClick={handleBackClick}>
              ← Back
            </button>
            <div className="breadcrumbs">
              {breadcrumbs.join(' > ')}
            </div>
          </div>
        )}
      </header>
      <main>
        {showCategories && (
          <div className="categories">
            {categories.map((category) => (
              <button key={category.id} onClick={() => fetchBooksByCategory(category.id, category.name)}>
                {category.name}
              </button>
            ))}
          </div>
        )}
        {showBooks && (
  <div className="book-list">
    {books.map((book) => (
      <div 
        key={book.Id} 
        className="book-item" 
        onClick={() => handleBookClick(book)}
      >
        <h3>{book.Title}</h3>
        <p>{book.Author ? book.Author: 'Unknown Author'}</p>
      </div>
    ))}
  </div>
)}
                {summary && selectedChapter && (
          <div className="summary-card">
            <h2>{selectedChapter}</h2>
            <ul className="nav nav-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => handleTabChange('summary')}
                >
                  Summary
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'fullChapter' ? 'active' : ''}`}
                  onClick={() => handleTabChange('fullChapter')}
                >
                  Full Chapter
                </button>
              </li>
            </ul>
            <div className="chapter-content">
              <ReactMarkdown>
                {activeTab === 'summary' ? summary[selectedChapter] : chapterContent}
              </ReactMarkdown>
            </div>
            <div className="chapter-navigation mt-3">
  <div className="d-flex justify-content-between align-items-center">
    <button 
      className="btn btn-secondary"
      onClick={handlePreviousChapter} 
      disabled={currentChapterIndex === 0}
    >
      Previous Chapter
    </button>
    <div className="d-flex align-items-center">
      <button 
        className="btn btn-secondary me-2"
        onClick={handleNextChapter}
        disabled={currentChapterIndex === Object.keys(summary).length - 1}
      >
        Next Chapter
      </button>
      <button
  className="btn btn-outline-secondary"
  onClick={generateShareableUrl}
  title="Share this chapter"
>
  <Share2 />
</button>
    </div>
  </div>
</div>
          </div>  
          
        )}
      </main>
      {showPopup && (
  <Popup 
    onClose={() => setShowPopup(false)} 
    bookTitle={books.find(b => b.id === selectedBookId)?.title || 'Selected book'}
  />
)}
    <Toast 
  message={toastMessage} 
  isVisible={isToastVisible} 
  onClose={hideToast} 
/>
    </div>
    
  );
}

export default App;