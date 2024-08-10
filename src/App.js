import { useEffect, useState } from "react";
import ReactMarkdown from 'react-markdown';
import './App.css';
import PdfViewer from './PdfViewer';
import { Document, Page, pdfjs } from "react-pdf";
import { createClient } from "@supabase/supabase-js";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const supabaseUrl = process.env.REACT_APP_supabaseUrl
const supabaseKey = process.env.REACT_APP_supabaseKey
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPdfUrl, setPopupPdfUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const handleNextChapter = () => {
    const chapters = Object.keys(summary);
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setSelectedChapter(chapters[currentChapterIndex + 1]);
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
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('category_id', categoryId);
      
      if (error) throw error;
      setBooks(data);
      setSummary('');
    } catch (error) {
      console.error('Error fetching books:', error.message);
    }
  };

  const fetchSummary = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from('summaries')
        .select('content')
        .eq('book_id', bookId)
        .single();
  
      if (error) throw error;
  
      console.log('Raw summary data:', data.content);
  
      let parsedContent;
      try {
        // Clean the JSON string
        let cleanedContent = data.content.trim(); // Trim leading/trailing whitespace
        console.log('Cleaned content:', cleanedContent);
        parsedContent = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        console.log('Problematic JSON string:', data.content);
        setSummary(null);
        return;
      }
  
      setSummary(parsedContent);
      setSelectedChapter(Object.keys(parsedContent)[0]);
    } catch (error) {
      console.error('Error fetching summary:', error.message);
      setSummary(null);
    }
  };
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      console.log('started');
      const response = await fetch(`https://auto-01px.onrender.com/search?key=${searchTerm}`);
      const data = await response.json();
      console.log('finished');
      setBooks(data.docs.slice(0, 10)); // Limiting to 10 results for this example
    } catch (error) {
      console.log('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPdfPopup = (pdfLink) => {
    setPopupPdfUrl(pdfLink);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert(`Copied "${text}" to clipboard!`);
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
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </header>
      <main>
        <div className="categories">
          {categories.map((category) => (
            <button key={category.id} onClick={() => fetchBooksByCategory(category.id)}>
              {category.name}
            </button>
          ))}
        </div>
        <div className="book-list">
          {books.map((book) => (
            <div key={book.id} className="book-item" onClick={() => fetchSummary(book.id)}>
              <h3>{book.title}</h3>
              <p>{book.author}</p>
            </div>
          ))}
        </div>
        {summary && selectedChapter && (
          <div className="summary-card">
            <h2>{selectedChapter}</h2>
            <div className="chapter-content">
              <ReactMarkdown>{summary[selectedChapter]}</ReactMarkdown>
            </div>
            <button onClick={handleNextChapter}>Next Chapter</button>
          </div>
        )}
      </main>
    </div>
  );
  
}

export default App;