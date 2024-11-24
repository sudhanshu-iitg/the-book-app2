import { Search } from "lucide-react";
import "../App.css";
const PersistentSearch = ({ searchTerm, setSearchTerm, handleSearch, isLoading }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div >
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

export default PersistentSearch;