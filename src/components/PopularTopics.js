import React, { useState } from 'react';
import { Book, Brain, Briefcase, DollarSign, User, Heart, Users, Paintbrush, TrendingUp, Clock, Plus, Minus } from 'lucide-react';

const PopularTopics = ({ categories, onTopicClick }) => {
  const [showAll, setShowAll] = useState(false);

  // Map of category names to icons
  const iconComponents = {
    'Finance': DollarSign,
    'Product Management': Briefcase,
    'Personal Development': User,
    'Philosophy': Brain,
    'Women\'s Health': Heart,
    'Biographies': Users,
    'Creativity': Paintbrush,
    'Entrepreneurship': TrendingUp,
    'History': Clock,
    'Books': Book
  };

  // Display either all categories or just the first 5
  const displayedCategories = showAll ? categories : categories.slice(0, 5);
  const remainingCount = categories.length - 5;

  return (
    <div className="popular-topics-section">
      <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
      <div className="topics-grid">
        {displayedCategories.map((category, index) => {
          const IconComponent = iconComponents[category.name] || Book;
          
          return (
            <div 
              key={index} 
              className="topic-card hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => onTopicClick(category.id)}
            >
              <div className="flex items-center gap-2">
                <IconComponent className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            </div>
          );
        })}

        {categories.length > 5 && !showAll && (
          <div 
            className="topic-card hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => setShowAll(true)}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                View  More
              </h3>
            </div>
          </div>
        )}

        {showAll && (
          <div 
            className="topic-card hover:bg-blue-50 transition-colors cursor-pointer"
            onClick={() => setShowAll(false)}
          >
            <div className="flex items-center gap-2">
              <Minus className="w-6 h-6 text-blue-600" />
              <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                Show Less
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularTopics;