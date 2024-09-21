import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams ,useLocation} from 'react-router-dom';
import { useEffect, useState } from "react";
// import { useNavigate,useLocation } from "react-router-dom";
import './App.css';
import {  pdfjs } from "react-pdf";
import { createClient } from "@supabase/supabase-js";
import {  Search,ArrowLeft } from "lucide-react";
import Categories from './components/Categories.js';
import RecommendedBooks from './components/RecommendedBooks';
import ProfessionBooks from './components/ProfessionBooks';
import './components/RecommendedBooks.css';
import './components/ProfessionBooks.css';
import SignInButton from './components/SignInButton';
import SignOutButton from './components/SignOutButton';
import BookDetails from './components/BookDetails';
import RecentlyReadBooks from './components/RecentlyReadBooks';
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
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [recommenders, setRecommenders] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [user, setUser] = useState(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [recentlyReadBooks, setRecentlyReadBooks] = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  // const [, forceUpdate] = useState();
  
  
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
      } else if (path.startsWith('/books/')) {
        console.log("here2")
        const bookId = path.split('/')[2];
        setShowCategories(false);
        setShowBooks(false);
        setSelectedBookId(bookId);
        setShowBackButton(true);
      }
      // else if (path.startsWith('/chapters/')) {
      //   console.log("here")
      //   const chapterId = path.split('/')[2];
      //   setShowCategories(false);
      //   setShowBooks(false);
      //   setSelectedChapter(true);
      //   setSelectedChapterId(chapterId);
      //   setShowBackButton(true);
      // }
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
    fetchRecommenders();
    fetchProfessions();
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
    if (!user) {
      console.log("No user logged in");
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('book_id')
        .eq('user_id', user.id)
        .order('last_read_at', { ascending: false });

      if (error) throw error;

      if (data.length === 0) {
        console.log("No books found for this user");
        setMyBooks([]);
        setBooks([]);  // Clear the books state
        setShowCategories(false);
        setShowBooks(true);
        setShowBackButton(true);
        return;
      }

      const bookIds = data.map(item => item.book_id);
      
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*')
        .in('Id', bookIds);

      if (booksError) throw booksError;

      console.log("Fetched books:", booksData);

      setMyBooks(booksData);
      setBooks(booksData);  // Set the books state to display
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
    } catch (error) {
      console.error('Error fetching my books:', error.message);
    }
  };

  const handleMyBooksClick = () => {
    fetchMyBooks();
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
  const fetchRecommenders = async () => {
    try {
      const { data, error } = await supabase
        .from('recommenders')
        .select('*')
        .limit(3);  // Adjust this number as needed

      if (error) throw error;
      setRecommenders(data);
    } catch (error) {
      console.error('Error fetching recommenders:', error.message);
    }
  };
  const fetchProfessions = async () => {
    try {
      const { data, error } = await supabase
        .from('professions')
        .select('*')
        .limit(3);  // Adjust this number as needed

      if (error) throw error;
      setProfessions(data);
    } catch (error) {
      console.error('Error fetching professions:', error.message);
    }
  };
  const fetchBooksByRecommender = async (recommenderId) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('recommender_id', recommenderId);

      if (error) throw error;
      setBooks(data);
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
      navigate(`/recommender/${recommenderId}`);
      // You might want to update breadcrumbs here as well
    } catch (error) {
      console.error('Error fetching books by recommender:', error.message);
    }
    
  };

  const fetchBooksByProfession = async (professionId) => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('profession_id', professionId);

      if (error) throw error;
      setBooks(data);
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
      navigate(`/profession/${professionId}`);
      // Update breadcrumbs here
    } catch (error) {
      console.error('Error fetching books by profession:', error.message);
    }
    
  };
  const handleBookClick = async (book) => {
    try {
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('Id', book.Id)
        .single();
      if (bookError) {
        console.error('Error fetching book:', bookError.message);
        console.error('Book:', book);
        const apiUrl = `https://auto-production.up.railway.app/store?key=true&url=${encodeURIComponent(book.Mirror_2)}&title=${encodeURIComponent(book.Title)}&author=${encodeURIComponent(book.Author || 'Unknown Author')}`;
        await fetch(apiUrl);
        setShowPopup(true);
        return;
      }
      setShowBooks(false);
      setShowBackButton(true);
      setSelectedBookId(book.Id);
      navigate(`/books/${book.Id}`);
      
    } catch (error) {
      console.error('Error fetching book:', error.message);
    }
  };


  const Popup = ({ onClose, bookTitle }) => {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <h2>New book detected</h2>
          <p>We have begun summarizing this book. </p>
          <p>It will show up in the new books category shortly.</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
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
      'Finance': 'DollarSign',
      'Product management': 'Briefcase',
      'Personal development': 'User',
      // Add more mappings as needed
    };
    return iconMap[categoryName] || 'Folder'; // Fallback to 'Folder' if no match
  };

  const fetchBooksByCategory = async (categoryId) => {
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
    }
  };


  // const updateHistory = (newState) => {
  //   window.history.replaceState(newState, '', window.location.pathname);
  // };

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
    try {
      const response = await fetch(`https://auto-production.up.railway.app/search?key=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data.docs && Array.isArray(data.docs)) {
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
    }
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
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>
      </header>
      <main>
        {showCategories && (
          <>
            <Categories 
              categories={categories} 
              onCategoryClick={fetchBooksByCategory}
              onMyBooksClick={handleMyBooksClick}
            />
            <ProfessionBooks 
              professions={professions} 
              onProfessionClick={fetchBooksByProfession} 
            />
            <RecommendedBooks 
              recommenders={recommenders} 
              onRecommenderClick={fetchBooksByRecommender} 
            />
          </>
        )}
        {showBooks && (
          <div className="book-list">
            {books.map((book) => (
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
                    <p className="book-author-list">{book.Author ? book.Author : 'Unknown Author'}</p>
                  </div>
                  <button className="book-action">
                    Start Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedBookId && (
          <BookDetails
            bookId={selectedBookId}
            onBackClick={handleBackClick}
            chapterId={selectedChapter}        
            showChapter={selectedChapter}
            setShowChapter={setSelectedChapter}
            userId={user?.id}
          />
        )}
      </main>
      {showPopup && (
        <Popup 
          onClose={() => setShowPopup(false)} 
          bookTitle={books.find(b => b.id === selectedBookId)?.title || 'Selected book'}
        />
      )}
    </div>
     
  );
}

export default App;