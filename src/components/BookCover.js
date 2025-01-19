import { useState, useEffect } from 'react';

const BookCover = ({ book, onCoverGenerated }) => {
  const [coverUrl, setCoverUrl] = useState(book.coverUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchBookCover = async () => {
      if (!book.coverUrl) {
        setIsLoading(true);
        setHasError(false);
        try {
          const searchQuery = `${book.Title} ${book.Author || ''}`.trim();
          const response = await fetch(
            `https://thebookapp-production-eb6d.up.railway.app/image?key=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error('Failed to fetch cover');
          const data = await response.json();
          if (data.coverUrl) {
            setCoverUrl(data.coverUrl);
            onCoverGenerated(data.coverUrl); // Call the callback with the generated cover URL
          } else {
            setHasError(true);
          }
        } catch (error) {
          setHasError(true);
          setCoverUrl(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (!coverUrl && !hasError) {
      fetchBookCover();
    }
  }, [book, coverUrl, hasError, onCoverGenerated]);

  const handleImageError = () => {
    setCoverUrl(null);
    setHasError(true);
  };

  return (
    <div className="bg-gray-100 relative">
      {isLoading ? (
        <div className="items-center justify-center">
          <div className="border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : coverUrl && !hasError ? (
        <img
          src={coverUrl}
          alt={book.Title}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2">
          <p className="text-sm text-center text-gray-600 line-clamp-2 font-medium">
            {book.Title}
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCover;