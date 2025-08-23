import { useState, useEffect, useRef } from 'react';
import { Search, Film } from 'lucide-react'; // Importing icons from lucide-react
import apiConfig from '../../services/apiConfig';

const TMDB_API_KEY = apiConfig.apiKey;
const TMDB_BASE_URL = apiConfig.baseUrl;
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92'; // Small poster size

function SearchBar() {
   const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchBarRef = useRef(null);
  const modalRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Effect for handling clicks outside the search bar/modal to close the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target) &&
        modalRef.current &&
        !modalRef.current.contains(event.target)
      ) {
        setShowModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Effect for debounced search term changes
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowModal(false);
      return;
    }

    setLoading(true);
    setError(null);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchTerm)}`
        );

        if (!response.ok) {
          // If the HTTP status is not OK (e.g., 404, 500), try to get an error message.
          let errorMsg = `HTTP error! Status: ${response.status}`;
          try {
              // Attempt to read the response body as text, in case it's an HTML error page or similar.
              const errorBody = await response.text();
              if (errorBody) errorMsg += ` - ${errorBody.substring(0, 200)}`; // Limit length to avoid overwhelming logs
          // eslint-disable-next-line no-unused-vars
          } catch (e) {
              // Ignore if reading the text response also fails
          }
          throw new Error(errorMsg);
        }

        let data;
        try {
          // Attempt to parse the JSON response. This is the line that was throwing the error.
          data = await response.json();
        } catch (jsonError) {
          if (jsonError instanceof SyntaxError) {
            // Specifically catch JSON parsing errors like "Unexpected end of JSON input"
            console.error("Failed to parse JSON response:", jsonError);
            // Log the raw response text to help debug what the server actually sent
            const rawResponseText = await response.text();
            console.error("Raw (unparseable) response from TMDB:", rawResponseText);
            throw new Error("Received invalid or empty JSON from the server. Please check your API key and network connection.");
          }
          // Re-throw any other type of error encountered during JSON parsing
          throw jsonError;
        }

        setSearchResults(data.results || []);
        setShowModal(true); // Show modal once results are fetched
      } catch (err) {
        console.error("Failed to fetch movies:", err);
        setError(`Failed to load movies: ${err.message || 'Unknown error'}`);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // Debounce for 500ms

    // Cleanup on unmount or before next effect run
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="relative flex flex-col justify-center p-4 w-[600px] items-center text-white font-inter z-100">
      {/* Search Input */}
      <div ref={searchBarRef} className="relative w-full mt-4 ">
        <input
          type="text"
          placeholder="Search for movies..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.trim() !== '' && setShowModal(true)} // Show modal if there's text
          className="w-full py-5 pl-15 pr-4 rounded-full bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg shadow-lg transition-all duration-300"
        />
        <Search className="absolute left-4 top-7.5 -translate-y-3/4 text-gray-400" size={20} />
      </div>

    
      {/* Movie Details Modal */}
      {showModal && (searchTerm.trim() !== '' || loading || error) && (
        <div
          ref={modalRef}
          style={{ scrollbarWidth: 'none' }}
          className="fixed z-10 lg:top-15 lg:left-1/4 lg:w-[600px] h-full bg-black/50 backdrop-blur-lg backdrop-saturate-400 rounded-xl lg:p-2
                     lg:max-h-[500px]  overflow-y-auto transform transition-all duration-300 ease-in-out
                     md:top-full md:mt-2
                     // Mobile-specific styling: full screen
                     sm:fixed sm:top-0 sm:left-0 sm:w-screen sm:h-screen sm:max-w-none sm:max-h-none sm:rounded-none sm:p-6
                     flex flex-col gap-3"
        >
          {loading && (
            <div className="flex items-center justify-center py-4 text-gray-400">
              <Film className="animate-spin mr-2" size={24} /> Loading...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-4 text-red-400">
              Error: {error}
            </div>
          )}

          {!loading && !error && searchResults.length === 0 && searchTerm.trim() !== '' && (
            <div className="flex items-center justify-center py-4 text-gray-400">
              No results found for {searchTerm}
            </div>
          )}

          {!loading && !error && searchResults.length > 0 && (
            <>
              {searchResults.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between p-2 bg-white/10 hover:bg-white/20 rounded-xl cursor-pointer transition-colors duration-200"
                >
                  {/* Left part: Icon and Movie Name (flex-col for YouTube style on small details) */}
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <Search className="text-gray-400 flex-shrink-0" size={20} />
                    <span className="text-white text-lg truncate">{movie.title || movie.name}</span>
                  </div>

                  {/* Right part: Small Image */}
                  {movie.poster_path ? (
                    <img
                      src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
                      alt={`${movie.title} poster`}
                      className="w-10 h-15 object-cover rounded-md ml-4 flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/48x72/333/fff?text=No+Image'; // Placeholder for broken images
                      }}
                    />
                  ) : (
                    <div className="w-10 h-15 bg-gray-600 flex items-center justify-center rounded-md text-xs text-gray-400 ml-4 flex-shrink-0">
                      No<br/>Img
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
