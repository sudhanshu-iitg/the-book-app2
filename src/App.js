import { useEffect, useState } from "react";
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
import { NotLoggedInFallback, NoBooksFoundFallback,ErrorFallback  } from './components/FallbackComponents';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
  const [showBooks, setShowBooks] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [recommenders, setRecommenders] = useState([]);
  const [professions, setProfessions] = useState([]);
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
    fetchCategories();
    fetchRecommenders();
    fetchProfessions();
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
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session.user);
        updateUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

  
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
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
      // Update breadcrumbs here
    } catch (error) {
      console.error('Error fetching books by profession:', error.message);
    }
  };
  const handleBookClick = async (book) => {
    try {
      let bookId;
      if (book.ID !== null) {
        bookId = book.Id;
      } else {
        bookId = book.ID;
      }
      console.log(bookId)
      const { data: bookData, error: bookError } = await supabase
        .from('books')
        .select('*')
        .eq('Id', bookId)
        .single();
  
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
        setSelectedBookId(book.Id);
        setShowBooks(false);
        setShowBackButton(true);
        setBookNeedsRequest(false);
      }
    } catch (error) {
      console.error('Error handling book click:', error.message);
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
    try {  
      const { data: booksData, error } = await supabase
        .from('books')
        .select('*')
        .eq('category_id', categoryId);
  
      if (error) throw error;
  
      setBooks(booksData);
      setShowCategories(false);
      setShowBooks(true);
      setShowBackButton(true);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };
  const handleBackClick = () => {
    if (selectedChapter) {
      // If viewing chapter details, go   back to book details
      setSelectedChapter(null); 
      return null
    } else if (selectedBookId) { 
      // If viewing book details, go back to book list 
      setSelectedBookId(null);
      setShowBooks(true); 
      setShowCategories(false); 
    } else if (showBooks) {
      // If viewing book list, go back to categories
      setShowBooks(false);
      setShowCategories(true);
    }
  
    // Update back button visibility
    setShowBackButton( selectedBookId || selectedChapter);
  };
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a search term");
      return;
    }
  
    setIsLoading(true);
    let data = null;  // Initialize 'data' outside the try block
  
    try {
      const response = await fetch(`https://auto-production.up.railway.app/search?key=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json();
  
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
    <h1>The Book App</h1>
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
            <div className="fallback">
            {fallbackState === 'not_logged_in' && (
              <NotLoggedInFallback onSignInClick={handleSignIn} />
            )}
            {(fallbackState === 'no_books' || fallbackState === 'no_books_in_db') && (
              <NoBooksFoundFallback />
            )}
            {fallbackState === 'error' && (
              <ErrorFallback message="An error occurred while fetching your books. Please try again later." />
            )}</div>
            {!fallbackState && books.map((book) => (
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
    ))}
  </div>
)}
                {selectedBookId && (
  <BookDetails
    bookId={selectedBookId!== null?selectedBookId :bookId}
    onBackClick={handleBackClick}
    chapterId={selectedChapter}
    showChapter={selectedChapter}
    setShowChapter={setSelectedChapter}
    userId={user?.id}
    bookNeedsRequest={bookNeedsRequest}
    bookTitle={bookTitle !== null ? bookTitle : undefined }
    bookAuthor={bookAuthor !== null ? bookAuthor : undefined}
    bookUrl={bookUrl !== null ? bookUrl : undefined }
                 
    />
)}
      </main>
      {showPopup && (
  <Popup 
    onClose={() => setShowPopup(false)} 
    bookTitle={books.find(b => b.id === selectedBookId)?.title || 'Selected book'}
  />
)}</div>
    
  );
}

export default App;