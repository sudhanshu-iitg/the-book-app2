import React, { useState, useEffect } from 'react';
import {
  Book,
  Brain,
  Briefcase,
  DollarSign,
  User,
  Heart,
  Users,
  Paintbrush,
  TrendingUp,
  Clock,
  Plus,
  Minus,
  Globe,
  Leaf,
  Smile,
  Award,
  Megaphone,
  Flag,
  Activity,
  BookOpen,
  MessageCircle,
  Cross,
  Cpu,
  Headphones,
} from 'lucide-react';
import { supabase } from '../App';
import BookCover from './BookCover'; // Import BookCover component
import './Profession.css'; // Import the CSS file for styling

// Define the iconComponents object
const iconComponents = {
  'Science': Book,
  'Biography & History': User,
  'Politics, Culture & Society': Globe,
  'Economics': TrendingUp,
  'Environment': Leaf,
  'Relationships, Sex & Parenting': Heart,
  'Happiness & Self-Improvement': Smile,
  'Money, Investing & Personal Finance': DollarSign,
  'Productivity': Briefcase,
  'Psychology': Brain,
  'Motivation & Inspiration': Award,
  'Marketing & Sales': Megaphone,
  'Management & Leadership': Flag,
  'Health, Fitness & Nutrition': Activity,
  'Business, Startups & Entrepreneurship': TrendingUp,
  'Creativity & Writing': Paintbrush,
  'Education & Philosophy': BookOpen,
  'Communication': MessageCircle,
  'Religion & Spirituality': Cross,
  'Technology & the Future': Cpu,
  'Work, Careers & Success': Briefcase,
  'Mindfulness & Mental Health': Headphones,
};

const PopularTopics = ({ categories, onTopicClick }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Set the first category as selected when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Fetch books for the selected category
  const fetchBooksByCategory = async (categoryId) => {
    setIsLoading(true);
    try {
      const { data: booksData, error } = await supabase
        .from('books')
        .select('*')
        .eq('category_id', categoryId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch books when the selected category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchBooksByCategory(selectedCategory);
    }
  }, [selectedCategory]);

  // Handle category selection
  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    onTopicClick(categoryId); // Optional: Call the parent's onTopicClick if needed
  };

  return (
    <div className="profession-books">
      <h2 style={{ paddingLeft: '2%' }}>Popular Topics</h2>
      <div className="topics-tabs">
        {categories.map((category) => {
          const IconComponent = iconComponents[category.name] || Book;
            return (
            <div
              key={category.id}
              className={`topic-tab ${selectedCategory === category.id ? 'selected' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              style={{
              flex: '0 0 auto',
              padding: '10px 20px',
              margin: '0 5px',
              cursor: 'pointer',
              borderBottom: selectedCategory === category.id ? '2px solid blue' : 'none',
              width: '20%', // Fixed width
              whiteSpace: 'normal', // Allow text to wrap
              wordWrap: 'break-word', // Break long words
              }}
            >
              
              <h3>{category.name}</h3>
            </div>
            );
        })}
      </div>

      {/* Display books in a horizontal list or show empty state */}
      <div className="book-list-horizontal">
        {isLoading ? (
          <div>Loading...</div>
        ) : books.length > 0 ? (
          books.map((book) => (
            <div
              key={book.Id}
              className="book-item-horizontal"
              onClick={() => onTopicClick(book.Id)} // Optional: Handle book click
            >
              <div className="book-cover-wrapper">
                <BookCover book={book} />
              </div>
              <div className="book-details">
                <h4 className="book-title">{book.Title}</h4>
                <p className="book-author">{book.Author || 'Unknown Author'}</p>
              </div>
            </div>
          ))
        ) : (
          // Empty state message
          <div className="empty-state">
            <h3>No books found in this category.</h3>
            <p>Try searching for a book to add to this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularTopics;