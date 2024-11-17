import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate,useLocation} from 'react-router-dom';
import { useEffect, useState } from "react";
import './App.css';
import {  pdfjs } from "react-pdf";
import { createClient } from "@supabase/supabase-js";
import {  Search,ArrowLeft } from "lucide-react";
import Categories from './components/Categories.js';
import SignInButton from './components/SignInButton';
import SignOutButton from './components/SignOutButton';
import BookDetails from './components/BookDetails';
import { NotLoggedInFallback, NoBooksFoundFallback,ErrorFallback  } from './components/FallbackComponents';
import PopularTopics from './components/PopularTopics';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const supabaseUrl = process.env.REACT_APP_supabaseUrl
const supabaseKey = process.env.REACT_APP_supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)
// Add these imports at the top of App.js


const HeroSection = ({ searchTerm, setSearchTerm, handleSearch, isLoading }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="hero-section">
      <h1 className="hero-title">Any Book, Summarized</h1>
      <p className="hero-subtitle">Discover and digest key insights from thousands of books in minutes</p>
      <div className="search-container-hero">
        <Search className="search-icon" size={20} />
        <input 
          type="text" 
          placeholder="Search for books or topics..." 
          className="hero-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};


const SummarySection = () => {
  return (
    <div className="summary-section">
      <h2 className="section-title">How Our Summaries Work</h2>
      <div className="summary-content">
        <div className="summary-header">
          <button className="back-button">
            <ArrowLeft size={20} />
          </button>
          <div className="book-title">Rich Dad Poor Dad</div>
        </div>
        
        <div className="summary-body">
          <h2>Rich Dad Poor Dad</h2>
          <div className="chapter-nav">
            <span>‹ Previous Chapter</span>
            <span>Next Chapter ›</span>
          </div>
          
          <h3>Chapter 2 - Two Dads, Two Worlds: The Seeds of Financial Wisdom</h3>
          
          <div className="summary-section">
            <h4>Key Themes</h4>
            <p>This book explores the contrasting financial philosophies of two fathers, one rich and one poor, and how these contrasting views shape their lives. It emphasizes the importance of financial education, challenging the traditional mindset of working for money.</p>
            
            <h4>Case Studies</h4>
            <p>The book uses the author's own life as a primary case study, contrasting the financial choices and outcomes of his two fathers. The author's rich dad, despite not having a formal education, became wealthy through investing.</p>
            
            <h4>Key Questions & Answers</h4>
            <div className="qa-section">
              <p><strong>Q1: What is the main difference between the author's two fathers' approaches to money?</strong></p>
              <p>The author's rich dad believed in financial education and making money work for him, while his poor dad focused on working for money and relying on traditional financial security.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
const SearchBar = ({ searchTerm, setSearchTerm, handleSearch, isLoading }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for titles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch} disabled={isLoading}>
        <Search size={20} color="#0d6efd" />
      </button>
    </div>
  );
};
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
  const [showBooks, setShowBooks] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [user, setUser] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [recentlyReadBooks, setRecentlyReadBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [bookNeedsRequest, setBookNeedsRequest] = useState(false);
  const [bookTitle, setBookTitle] = useState([]);
  const [bookAuthor, setBookAuthor] = useState([]);
  const [bookUrl, setBookUrl] = useState([]);
  const [bookId, setBookId] = useState([]);
  const [fallbackState, setFallbackState] = useState(null);

  useEffect(() => {

    const handleLocationChange = () => {
      const path = location.pathname;
      if (path === '/') {
        setShowCategories(true);
        setShowBooks(false);
        setSelectedBookId(null);
        setSelectedCategoryId(null);
        setSelectedChapter(null);
        setShowBackButton(false);
        
      } 
      
      else if (path.includes('/chapters/')) {
        const bookId = path.split('/')[2];
        const chapterId = path.split('/')[4];
        setSelectedBookId(bookId);
        setShowCategories(false);
        setShowBooks(false);
        setSelectedChapter(true);
        setSelectedChapterId(chapterId);
        setShowBackButton(true);
      }
      else if (path.startsWith('/books/')) {
        console.log(path.split('/'))
        const bookId = path.split('/')[2];
        setShowCategories(false);
        setSelectedChapter(false);
        setShowBooks(false);
        setSelectedBookId(bookId);
        setShowBackButton(true);
      }
      
      else if (path.startsWith('/recommender/') || path.startsWith('/profession/') || /^\/\d+$/.test(path)) {
        setShowCategories(false);
        setShowBooks(true);
        setSelectedBookId(null);
        setShowBackButton(true);
        
      }
      
    };


    handleLocationChange();

  
    const handleAuthRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error getting session:', error);
      if (session) {
        setUser(session.user);
        updateUserProfile(session.user);
        fetchRecentlyReadBooks(session.user.id);
      }
    };
    handleAuthRedirect();

    const handleAuthChange = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error getting session:', error);
      if (session) {
        setUser(session.user);
        updateUserProfile(session.user);
        fetchRecentlyReadBooks(session.user.id);
        
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setUser(null);
      }
    };
    handleAuthChange();

    fetchCategories();
    fetchBooksByCategory();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        updateUserProfile(session.user);
        handleAuthChange();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    
    

     // Handle browser navigation

     const handlePopState = (event) => {
      const state = event.state;
      if (state) {
        setShowCategories(state.showCategories);
        setShowBooks(state.showBooks);
        setSelectedCategoryId(state.selectedCategoryId);
        setSelectedBookId(state.selectedBookId);
        setSelectedChapter(state.selectedChapter);
        setShowBackButton(state.showBackButton);
        if (state.books) {
          setBooks(state.books);
        }
      } else {
        // Handle the case when there's no state (i.e., we've gone back to the initial page)
        setShowCategories(true);
        setShowBooks(false);
        setSelectedBookId(null);
        setSelectedCategoryId(null);
        setSelectedChapter(false);
        setSelectedChapterId(null)
        setShowBackButton(false);
        setBooks([]);
      }
    };

    window.addEventListener('popstate',handlePopState);
    
    // Initial state setup based on current location
    // handlePopState();

  
    return () => {
      window.removeEventListener('popstate', handlePopState);
      authListener.subscription.unsubscribe();
    };
  }, [location]);// Add location to the dependency array to listen for changes
    
  
  const fetchMyBooks = async () => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('book_id')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (progressError) throw progressError;

      if (progressData.length === 0) {
        console.log("No books found in user progress");
        setFallbackState('no_books');
        setMyBooks([]);
        setBooks([]);
        setShowCategories(false);
        setShowBooks(true);
        setShowBackButton(true);
        return;
      }

      const bookIds = progressData.map(item => item.book_id);
      
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('Id', bookIds);

      if (booksError) throw booksError;

      if (booksData.length === 0) {
        console.log("No books found in the database");
        setFallbackState('no_books_in_db');
        setMyBooks([]);
        setBooks([]);
      } else {
        console.log("Fetched books:", booksData);
        setMyBooks(booksData);
        setBooks(booksData);
        setFallbackState(null);
      }

      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
    } catch (error) {
      console.error('Error fetching my books:', error.message);
      setFallbackState('error');
      setMyBooks([]);
      setBooks([]);
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
    }
  };


  const handleMyBooksClick = () => {
    if (!user) {
      console.log("No user logged in");
      setFallbackState('not_logged_in');
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
    } else {
      fetchMyBooks();
    }
  };
  // Add this function outside of the useEffect, but still within your component
  const updateUserProfile = async (user) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        updated_at: new Date(),
      });
  
    if (error) console.error('Error updating user profile:', error);
  };
  const fetchRecentlyReadBooks = async (userId) => {
    try {
      // Fetch the book IDs from user_progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('book_id')
        .eq('user_id', userId)
        .order('last_read_at', { ascending: false });
  
      if (progressError) throw progressError;
  
      // Extract unique book IDs from the progress data
      const uniqueBookIds = [...new Set(progressData.map(item => item.book_id))];
  
      // Limit to 5 unique books
      const limitedUniqueBookIds = uniqueBookIds.slice(0, 5);
  
      // Fetch the book details using the unique book IDs
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('Id', limitedUniqueBookIds);
  
      if (booksError) throw booksError;
  
      // Sort the books data to match the order of the limitedUniqueBookIds array
      const sortedBooks = limitedUniqueBookIds
        .map(id => booksData.find(book => book.Id === id))
        .filter(Boolean);
  
      setRecentlyReadBooks(sortedBooks);
    } catch (error) {
      console.error('Error fetching recently read books:', error.message);
    }
  }; 
  const handleBookClick = async (book) => {
    try {
      let bookId = book.ID ?? book.Id;
      console.log(bookId)
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('Id', bookId)
        .single();
      console.log(bookData)
      if (bookError) {
        console.error('Error fetching book:', bookError.message);
        // If the book is not found in the database, we still show the book details page
        setSelectedBookId(book.ID);
        setShowBooks(false);
        setShowBackButton(true);
        setBookAuthor(book.Author);
        setBookTitle(book.Title);
        setBookUrl(book.Mirror_1);
        setBookId(book.ID);
        // We'll pass a flag to indicate that this book needs to be requested
        setBookNeedsRequest(true);
      } else {
        setSelectedBookId(bookId);
      setShowBooks(false);
      setShowBackButton(true);
      setBookNeedsRequest(false);
      navigate(`/books/${book.Id}`);
     
    }  } catch (error) {
      console.error('Error handling book click:', error.message);
    }
  };
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      
      // Map icons to categories (you can customize this based on your needs)
      const categoriesWithIcons = data.map(category => ({
        ...category,
        icon: getCategoryIcon(category.name)
      }));
      
      setCategories(categoriesWithIcons);
    } catch (error) {
      console.error('Error fetching categories:', error.message);
    }
  };
  
  // Helper function to map category names to icons
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'My Books': 'Book',
      'Finance': 'DollarSign',
      'Product Management': 'Briefcase',
      'Personal Development': 'User',
      'New': 'Plus',
      'Happiness': 'Smile',
      'Women\'s Health': 'Heart',
      'Philosophy': 'Brain',
      'Biographies': 'Users',
      'Creativity': 'Paintbrush',
      'Entrepreneurship': 'TrendingUp',
      'History': 'Clock'
    };
  
    return iconMap[categoryName] || 'Folder'; // Fallback to 'Folder' if no match
  };

  const fetchBooksByCategory = async (categoryId) => {
    console.log('fetching books by category:', categoryId);
    if (categoryId) {
      try {  
        const { data: booksData, error } = await supabase
          .from('books')
          .select('*')
          .eq('category_id', categoryId);
    
        if (error) throw error;
    
        setBooks(booksData);
        setShowCategories(false);
        setShowBooks(true);
        setSelectedCategoryId(categoryId);
        setShowBackButton(true);
        navigate(`/${categoryId}`);
      } catch (error) {
        console.error('Error fetching books:', error);
  }}};

  const handleBackClick = () => {
    if (selectedChapter) {
      setSelectedChapter(false);
      setSelectedChapterId(null)
      // navigate(`books/${selectedBookId}`);
      navigate(`/books/${selectedBookId}`);
    } 
    else if (selectedBookId) {
      setSelectedBookId(null);
      setShowBooks(true);
      setShowCategories(false);
      navigate(`/${selectedCategoryId}`);
    } 
    else if (showBooks) {
      setShowBooks(false);
      setShowCategories(true);
      setShowBackButton(false);
      navigate('/');
    }
    
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }
  
    setIsLoading(true);
    setShowCategories(false);
    setShowBooks(false);
    let data = null;  // Initialize 'data' outside the try block
  
    try {
      const response = await fetch(`https://thebookapp-production-eb6d.up.railway.app/search?key=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
      console.log(data)
  
      if (data.docs && Array.isArray(data.docs)) {
        console.log('Books:', data.docs);
        setBooks(data.docs.slice(0, 10));
        setShowCategories(false);
        setShowBooks(true);
        setShowBackButton(true);
      } else {
        console.error('Unexpected data structure:', data);
        alert('No results found or unexpected data structure');
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('An error occurred while searching. Please try again.');
    } finally {
      setIsLoading(false);
      try {
        const { data: supabaseData, error } = await supabase
          .from('search_history')
          .upsert(
            { 
              user_id: user?.id, 
              search_term: searchTerm,
              response: JSON.stringify(data?.docs || [])  // Safely handle undefined 'data'
            }
          );
  
        if (error) throw error;
        console.log('Progress saved successfully');
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };
  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error: ', error);
  };
  return (
    <div className="App">
      <header>
        <div className="top-nav">
        <h1 onClick={() => {
  setShowCategories(true);
  setShowBooks(false);
  setShowBackButton(false);
  navigate('/');
}}>
            The Book App
          </h1>
          <div className="auth-buttons">
            {user ? <SignOutButton /> : <SignInButton />}
          </div>
        </div>
        <div className="search-wrapper">
          {showBackButton && (
            <button className="back-button" onClick={handleBackClick}>
              <ArrowLeft size={20} />
            </button>
          )}
          
        </div>
      </header>
      <main>
      {isLoading && (
        <div className="processing-info mt-4 p-4 bg-blue-50 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <p className="text-blue-700 font-semibold text-lg">
                  Searching for what you are looking for...
                </p>
                <p className="text-blue-600 text-sm">
                  Should be here any second now
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
      )}
  {showCategories && (
      <>
         <HeroSection 
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      handleSearch={handleSearch}
      isLoading={isLoading}
    />
        <PopularTopics 
      categories={categories} 
      onTopicClick={(categoryId) => fetchBooksByCategory(categoryId)} 
    />
        <SummarySection />
      </>
    )}
 {showBooks && (
          <div className="book-list">
            {books.length > 0 ? (
              books.map((book) => (
                <div 
                  key={book.Id} 
                  className="book-item"
                  onClick={() => handleBookClick(book)}
                >
                  {book.coverUrl && (
                    <div className="book-cover-wrapper">
                      <img 
                        src={book.coverUrl} 
                        alt={book.Title} 
                        className="book-cover"
                        style={{ display: 'block', margin: 'auto' }}
                      />
                    </div>
                  )}
                  <div className={`book-details ${!book.coverUrl ? 'no-cover' : ''}`}>
                    <div>
                      <h3 className="book-title-list">{book.Title}</h3>
                      <p className="book-author-list">{book.Author ? book.Author : 'Unknown Author'} - {book.Size ? book.Size : ''}</p>
                      <p className="book-author-list"></p>
                    </div>
                    <button className="book-action">
                      Start Reading
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <NoBooksFoundFallback />
              </div>
            )}
          </div>
        )}

 {selectedBookId && (
  <BookDetails
    bookId={selectedBookId!== null?selectedBookId :bookId}
    selectedChapterId={selectedChapterId}
    onBackClick={handleBackClick}
    chapterId={selectedChapter}
    showChapter={selectedChapter}
    setShowChapter={setSelectedChapter}
    userId={user?.id}
    bookNeedsRequest={bookNeedsRequest}
    setBookNeedsRequest={setBookNeedsRequest}
    bookTitle={bookTitle !== null ? bookTitle : undefined }
    bookAuthor={bookAuthor !== null ? bookAuthor : undefined}
    bookUrl={bookUrl !== null ? bookUrl : undefined }
                 
    />
)}
      </main>
      </div>
  );
}

export default App;