import React from 'react';
import * as LucideIcons from 'lucide-react';

const CategoryButton = ({ category, onClick }) => {
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

const Categories = ({ categories, onCategoryClick, onMyBooksClick }) => {
  const myBooksCategory = {
    id: 'my-books',
    name: 'My Books',
    icon: 'BookOpen'
  };

  return (
    <div className="categories-section">
      <h2 className="categories-title">Categories</h2>
      <div className="categories-container">
        <CategoryButton
          key={myBooksCategory.id}
          category={myBooksCategory}
          onClick={onMyBooksClick}
        />
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