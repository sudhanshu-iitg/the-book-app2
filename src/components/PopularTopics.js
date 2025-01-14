import React, { useState } from 'react';
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
  Minus, // For Science
  Globe, // For Politics, Culture & Society
  Leaf, // For Environment
  Smile, // For Happiness & Self-Improvement
  Award, // For Motivation & Inspiration
  Megaphone, // For Marketing & Sales
  Flag, // For Management & Leadership
  Activity, // For Health, Fitness & Nutrition
  BookOpen, // For Education & Philosophy
  MessageCircle, // For Communication
  Cross, // For Religion & Spirituality
  Cpu, // For Technology & the Future
  Headphones, // For Mindfulness & Mental Health
} from 'lucide-react';
const PopularTopics = ({ categories, onTopicClick }) => {
  const [showAll, setShowAll] = useState(false);

  // Map of category names to icons
  const iconComponents = {
    'Science': Book, // Assuming Flask is an icon for Science
    'Biography & History': User, // Assuming Users is an icon for Biography & History
    'Politics, Culture & Society': Globe, // Assuming Globe is an icon for Politics, Culture & Society
    'Economics': TrendingUp, // Assuming TrendingUp is an icon for Economics
    'Environment': Leaf, // Assuming Leaf is an icon for Environment
    'Relationships, Sex & Parenting': Heart, // Assuming Heart is an icon for Relationships, Sex & Parenting
    'Happiness & Self-Improvement': Smile, // Assuming Smile is an icon for Happiness & Self-Improvement
    'Money, Investing & Personal Finance': DollarSign, // Assuming DollarSign is an icon for Money, Investing & Personal Finance
    'Productivity': Briefcase, // Assuming Briefcase is an icon for Productivity
    'Psychology': Brain, // Assuming Brain is an icon for Psychology
    'Motivation & Inspiration': Award, // Assuming Award is an icon for Motivation & Inspiration
    'Marketing & Sales': Megaphone, // Assuming Megaphone is an icon for Marketing & Sales
    'Management & Leadership': Flag, // Assuming Flag is an icon for Management & Leadership
    'Health, Fitness & Nutrition': Activity, // Assuming Activity is an icon for Health, Fitness & Nutrition
    'Business, Startups & Entrepreneurship': TrendingUp, // Assuming TrendingUp is an icon for Business, Startups & Entrepreneurship
    'Creativity & Writing': Paintbrush, // Assuming Paintbrush is an icon for Creativity & Writing
    'Education & Philosophy': BookOpen, // Assuming BookOpen is an icon for Education & Philosophy
    'Communication': MessageCircle, // Assuming MessageCircle is an icon for Communication
    'Religion & Spirituality': Cross, // Assuming Cross is an icon for Religion & Spirituality
    'Technology & the Future': Cpu, // Assuming Cpu is an icon for Technology & the Future
    'Work, Careers & Success': Briefcase, // Assuming Briefcase is an icon for Work, Careers & Success
    'Mindfulness & Mental Health': Headphones, // Assuming Headphones is an icon for Mindfulness & Mental Health
  };

  // Display either all categories or just the first 5
  const displayedCategories = showAll ? categories : categories.slice(0, 5);
  const remainingCount = categories.length - 5;

  return (
    <div >
      <h2 style={{ paddingLeft: '2%' }}>Popular Topics</h2>
      <div className="topics-grid">
        {displayedCategories.map((category, index) => {
          const IconComponent = iconComponents[category.name] || Book;
          
          return (
  <div
    key={index}
    className="topic-card"
    onClick={() => onTopicClick(category.id)}
    role="button"
    tabIndex={0}
    aria-label={`Select ${category.name}`}
    onKeyDown={(e) => e.key === 'Enter' && onTopicClick(category.id)}
  >
    <div>
      <IconComponent  />
      <h3 >
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