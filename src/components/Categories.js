import React from 'react';
import * as LucideIcons from 'lucide-react';

const CategoryButton = ({ category, onClick }) => {
  // Attempt to get the icon from Lucide, fallback to a default if not found
  const IconComponent = LucideIcons[category.icon] || LucideIcons.Folder;

  return (
    <button 
      className="category-button" 
      onClick={() => onClick(category.id, category.name)}
    >
      <IconComponent className="category-icon" />
      <span>{category.name}</span>
    </button>
  );
};

const Categories = ({ categories, onCategoryClick }) => {
  return (
    <div className="categories-section">
      <h2 className="categories-title">Categories</h2>
      <div className="categories-container">
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            category={category}
            onClick={onCategoryClick}
          />
        ))}
      </div>
    </div>
  );
};

export default Categories;