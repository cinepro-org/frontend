import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Plus, Banana, Ticket, X, Search, ChevronLeft } from 'lucide-react';

// Assuming these paths are correct relative to where DetailsPage.jsx is located
import apiConfig from '../services/apiConfig'; // Adjusted path

// ProgressBar component (remains unchanged as it's a UI element)
const ProgressBar = ({ progress }) => {
  const clampedProgress = Math.max(0, Math.min(progress, 100));
  const isWatched = clampedProgress > 90; // Or whatever threshold you prefer

  return (
    <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden mt-1">
      <div
        className={`h-full rounded-full ${isWatched ? 'bg-green-500' : 'bg-purple-500'}`}
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};

// Helper for debouncing (remains unchanged)
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

// --- MODIFIED: DetailsPageButton (formerly DetailsPageFocusButton) ---
// This button is now a standard clickable component, without spatial navigation
const DetailsPageButton = ({ label, icon, onClick, showProgressBar = false, progress = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center bg-white text-black px-7 py-3 mt-3 rounded transition-all duration-150
                hover:ring-2 hover:ring-white hover:bg-white hover:opacity-100 scale-100 hover:scale-105 opacity-90`}
      // Removed 'focused' styling and replaced with 'hover' for standard web interaction
    >
      <div className="flex items-center gap-2 text-sm font-semibold p-2">
        {icon} {label}
      </div>
      {/* ProgressBar only shown if `showProgressBar` is true and progress exists */}
      {showProgressBar && (
        <div className="absolute bottom-1 w-[calc(100%-1rem)] px-1">
          <ProgressBar progress={progress} />
        </div>
      )}
    </button>
  );
};

// --- MODIFIED: DetailsPageButtonRow (formerly DetailsPageFocusButtonRow) ---
// Now a standard div, holds the buttons without spatial navigation context
const DetailsPageButtonRow = ({ tmdbData, onPlayResume, isTvShow, onPlayTrailer }) => {
  // Logic for play button is simplified as persistence is removed
  const getPlayButtonProps = useCallback(() => {
    // For Movies:
    if (!isTvShow) {
      return {
        label: "Watch Movie",
        icon: <Play size={16} />,
        showProgressBar: false, // No progress without persistence
        progress: 0,
        onClick: () => onPlayResume(tmdbData.id, tmdbData.title, 0), // Always start from 0
      };
    }
    // For TV Shows:
    else {
      const firstSeasonNumber = tmdbData.seasons?.[0]?.season_number || 1;
      const firstEpisodeNumber = 1;

      return {
        label: `Watch S${firstSeasonNumber} E${firstEpisodeNumber}`,
        icon: <Play size={16} />,
        showProgressBar: false, // No progress without persistence
        progress: 0,
        onClick: () => onPlayResume(tmdbData.id, tmdbData.name, 0, firstSeasonNumber, firstEpisodeNumber),
      };
    }
  }, [tmdbData, isTvShow, onPlayResume]);

  const playButtonProps = getPlayButtonProps();

  return (
    <div className="flex gap-4 mb-3">
      {/* Use the new DetailsPageButton */}
      <DetailsPageButton {...playButtonProps} />
      <DetailsPageButton label="Add to Watchlist" icon={<Plus size={16} />} onClick={() => console.log('Add to Watchlist')} />
      {/* Only show trailer button if trailers exist */}
      {tmdbData.videos?.results?.length > 0 && (
        <DetailsPageButton label="Trailer" icon={<Ticket size={16} />} onClick={onPlayTrailer} />
      )}
    </div>
  );
};

// --- MODIFIED: MediaItem (formerly FocusItem) ---
// This is now a standard clickable item, without spatial navigation
const MediaItem = ({ item, prefix, isImageRow, imageFunc, tmdbData, activeSeason, onSelect, onHover }) => {
  const navigate = useNavigate();
  const isEpisode = prefix === 'EPISODE';
  const isCast = prefix === 'CAST';
  const isComingSoon = isEpisode && (!item.still_path || !item.air_date || new Date(item.air_date) > new Date());

  // Simplified: Progress bar and 'watched' status removed as persistence hook is gone
  const episodeProgress = 0;
  const isWatched = false;

  const handleItemClick = () => {
    if (isEpisode) {
      const seasonNumber = item.season_number;
      const episodeNumber = item.episode_number;
      // When playing from episode list, always start from 0 for the specific episode
      navigate(`/player/${tmdbData.name || tmdbData.title}/${tmdbData.id}/${seasonNumber}/${episodeNumber}`, { state: { initialPlaybackPosition: 0 } });
    } else if (isCast) {
      navigate(`/search?query=${item.name}`); // Navigate to search with actor's name
    } else if (prefix === 'SEASON') {
      // For seasons, clicking will trigger the `onSelect` prop (which calls loadEpisodes)
      onSelect(item);
    }
  };

  const itemHeight = isEpisode ? 'h-[200px]' : (isCast ? 'h-[100px]' : 'h-[70px]'); // Adjust height for cast

  if (isComingSoon) {
    return (
      <div
        className={`min-w-[320px] ${itemHeight} bg-white/10 m-2 rounded-lg flex items-center justify-center text-gray-500 transition-all duration-150`}
      >
        <p className="text-sm">N/A</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleItemClick}
    //   enable this if you want to use hover
    //   onMouseEnter={() => onHover && onHover(item)} // Trigger onHover for seasons
      className={`relative ${isEpisode ? 'min-w-[320px] min-h-[200px]' : isCast ? 'min-w-[110px]' : 'min-w-[140px]'} m-3 rounded-2xl overflow-hidden
                 transition-all duration-150 hover:scale-105 hover:ring-1 hover:ring-white/10
                 ${prefix === 'SEASON' && activeSeason === item.id ? 'bg-white text-black' : 'bg-white/10'}`}
    >
      {isImageRow ? ( // This applies to episodes primarily
        <>
          <img
            src={apiConfig.w500Image(item.still_path)}
            alt={item.name}
            className={` absolute top-0 left-0 min-w-[320px] min-h-[200px] ${itemHeight} bg-white/10 object-cover opacity-90 hover:opacity-100`}
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/320x200/cccccc/333333?text=No+Image'; }}
          />
          <div className="absolute top-1 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
            E {item.episode_number}
            {isWatched && <span className="ml-1 text-green-400">✓</span>}
          </div>
          {/* Progress bar removed here */}
        </>
      ) : ( // This applies to seasons and cast
        <div className={`p-3 ${isCast ? 'text-left' : 'text-center'}`}> {/* Center text for cast */}
          {isCast && item.profile_path && (
            <img
              src={apiConfig.w200Image(item.profile_path)}
              alt={item.name}
              className="w-24 h-24 object-cover rounded-full mb-2 mx-auto" // Adjust size and center for cast images
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/96x96/cccccc/333333?text=N/A'; }}
            />
          )}
          <p className="font-semibold truncate text-sm">{item.name}</p>
          <p className="text-xs text-gray-400 truncate">{item.character || `${item.episode_count || ''} eps`}</p>
        </div>
      )}
    </button>
  );
};

// --- MODIFIED: MediaRow (formerly FocusRow) ---
// Now a standard div, passes items to MediaItem
const MediaRow = ({ items, title, focusKeyPrefix, onItemSelect, isImageRow = false, imageFunc, tmdbData, activeSeason, updateActiveSeason }) => {
  const scrollRef = useRef(null);

  const handleItemHover = useCallback(
    (item) => {
      if (focusKeyPrefix === 'SEASON') {
        // Trigger the season loading immediately on hover instead of focus
        // This simulates the previous spatial nav behavior of "focusing" to load content
        if (item.id !== activeSeason) {
          onItemSelect?.(item); // onItemSelect for seasons is loadEpisodes
        }
      }
    },
    [focusKeyPrefix, activeSeason, onItemSelect]
  );

  return (
    <div className="mb-1">
      <h2 className="text-l text-left mb-0 ml-5 text-white">{title}</h2>
      <div
        ref={scrollRef}
        className="flex overflow-x-auto py-4 scrollbar-none snap-x snap-mandatory "
        style={{ scrollbarWidth: 'none', scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => (
          <MediaItem
            key={item.id || item.credit_id || `item-${index}`} // Ensure unique key
            item={item}
            prefix={focusKeyPrefix}
            isImageRow={isImageRow}
            imageFunc={imageFunc}
            tmdbData={tmdbData}
            activeSeason={activeSeason}
            onSelect={onItemSelect} // For seasons, this will be loadEpisodes
            onHover={handleItemHover} // Add hover handler for seasons
          />
        ))}
        {/* Placeholder to ensure horizontal scrolling extends a bit */}
        <div style={{ minWidth: '50vw', flexShrink: 0 }} />
      </div>
    </div>
  );
};

const genreMap = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
  53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
  10762: 'Kids', 10763: 'News', 10764: 'Reality', 10765: 'Sci-Fi & Fantasy',
  10766: 'Soap', 10767: 'Talk', 10768: 'War & Politics'
};

const mapGenreIdsToNames = (ids = []) =>
  ids.map(id => genreMap[id] || 'N/A').join(' - ');


const DetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();



  // Initial tmdbData from location.state (passed from MovieCard)
  const initialTmdbData = location.state?.itemInfo; // Corrected to `itemInfo` as passed by MovieCard
  const isTvShow = initialTmdbData?.media_type === 'tv';

  const tmdbId = initialTmdbData?.id;

  const getW500ImageUrl = apiConfig.w500Image(initialTmdbData.backdrop_path);
  const getW1280ImageUrl = apiConfig.w1280Image(initialTmdbData.backdrop_path);

  // State to hold full TMDB data including videos (fetched via append_to_response)
  const [tmdbDataWithVideos, setTmdbDataWithVideos] = useState(initialTmdbData);

  // Removed usePlayerSettingsPersistence and its related states/functions
  // Removed internalLastFocusedSeason, updateInternalLastFocusedSeason, consolidatedMediaData

  const [logo, setLogo] = useState(null);
  const [cast, setCast] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [activeSeason, setActiveSeason] = useState(null); // Keeps track of the currently viewed season
  const episodeRowRef = useRef(null); // Still useful for general DOM referencing if needed

  // Removed useFocusable for the page itself

  // Handle Backspace key for navigation (standard web behavior)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace' || e.key === 'Escape') { // Also allow Escape key
        navigate(-1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  // Fetches full details for the media item, including credits, images, and videos
  useEffect(() => {
    if (!initialTmdbData?.id || !initialTmdbData?.media_type) return;

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${initialTmdbData.media_type}/${initialTmdbData.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}&append_to_response=credits,images,videos`
        );
        const data = await res.json();

        setCast(data.credits?.cast?.slice(0, 12) || []); // Limit cast to top 12

        // Merge new details (like 'genres', 'tagline', 'overview', 'videos') into the state
        setTmdbDataWithVideos({ ...initialTmdbData, ...data });

        // For TV Shows, filter and set seasons
        if (isTvShow) {
          const filteredSeasons = data.seasons?.filter(s => s.season_number !== 0) || [];
          setSeasons(filteredSeasons);

          // Automatically load episodes for the first season (or a default)
          if (filteredSeasons.length > 0) {
            // No persistence, so always load the first season by default
            const firstSeason = filteredSeasons[0];
            loadEpisodes(firstSeason.id, firstSeason.season_number);
          }
        }

        // Find and set the logo if available
        const logoFile = data.images?.logos?.find(l => l.iso_639_1 === 'en') || data.images?.logos?.[0];
        if (logoFile) setLogo(apiConfig.w500Image(logoFile.file_path));

      } catch (error) {
        console.error("Failed to fetch TMDB details:", error);
      }
    };

    fetchDetails();
  }, [initialTmdbData, isTvShow]); // Dependencies updated

  // Loads episodes for a given season (TV Shows)
  const loadEpisodes = useCallback(async (seasonId, seasonNumber) => {
    // Only load if the season is different to avoid unnecessary API calls
    if (activeSeason === seasonId && episodes.length > 0) {
      return;
    }

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${initialTmdbData.id}/season/${seasonNumber}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
      );
      const data = await res.json();
      setEpisodes(data.episodes || []);
      setActiveSeason(seasonId); // Set the active season
    } catch (error) {
      console.error("Failed to fetch episodes:", error);
      setEpisodes([]); // Clear episodes on error
    }
  }, [initialTmdbData, activeSeason, episodes.length]);

  const debouncedLoadEpisodes = useCallback(
    debounce((item) => {
      loadEpisodes(item.id, item.season_number);
    }, 300), // Adjust debounce delay as needed (e.g., 300ms)
    [loadEpisodes]
  );

  // Handles playing a movie or resuming/starting a TV episode
  const handlePlayResume = useCallback((id, title, initialPlaybackPosition = 0, seasonNum = null, episodeNum = null) => {
    if (seasonNum && episodeNum) {
      navigate(`/stream/${title}/${id}/${seasonNum}/${episodeNum}`, { state: { initialPlaybackPosition: initialPlaybackPosition } });
    } else {
      navigate(`/stream/${title}/${id}`, { state: { initialPlaybackPosition: initialPlaybackPosition } });
    }
  }, [navigate]);

  // Handles playing the trailer
  const handlePlayTrailer = useCallback(() => {
    const trailer = tmdbDataWithVideos?.videos?.results?.find(
      (video) => video.type === 'Trailer' && video.site === 'YouTube'
    );
    if (trailer) {
      navigate(`/player/${tmdbDataWithVideos.title || tmdbDataWithVideos.name}/${tmdbDataWithVideos.id}?trailer=${trailer.key}`);
    } else {
      console.warn("No trailer found for this media.");
      // Optionally show a user-friendly message, e.g., using a toast notification
    }
  }, [navigate, tmdbDataWithVideos]);


  // Use tmdbDataWithVideos for rendering details, ensuring it has the latest data
  if (!tmdbDataWithVideos) return null;

  const { backdrop_path, title, name, release_date, first_air_date, vote_average, genres, tagline, overview, genre_ids } = tmdbDataWithVideos;
  const displayTitle = title || name;
  const year = (release_date || first_air_date || '').split('-')[0];
  const original_language = tmdbDataWithVideos.original_language;
  const finalVote = vote_average ? vote_average.toFixed(1) : 'N/A';
  const finalGenres = genres
    ? genres.map(g => g.name).join(' - ')
    : mapGenreIdsToNames(genre_ids); // Fallback to map if 'genres' array is missing

  const getColor = (vote) => {
    const v = parseFloat(vote);
    if (isNaN(v)) return 'text-gray-400'; // Handle N/A or invalid votes
    if (v >= 8.6) return 'text-purple-400';
    if (v >= 7.0) return 'text-green-400';
    if (v >= 5.5) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="relative w-screen h-screen inset-0 bg-black text-white flex flex-col align-left overflow-auto">
      {/* Background Image with Gradients */}
      <div
        className="fixed top-0 left-0 inset-0 z-0"
        style={{
          backgroundImage: `linear-gradient(to right, rgb(0, 0, 0) 10%, rgba(0, 0, 0, 0.47) 60%, rgba(0, 0, 0, 0)), linear-gradient(to top, rgba(0, 0, 0, 0.85) 20%, rgba(0, 0, 0, 0.47) 60%, transparent 100%), url(${getW1280ImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div 
      onClick={() => navigate(-1)}
      className="fixed top-0 left-0 z-20 flex items-center justify-center w-13 h-13 mt-4 ml-4 cursor-pointer hover:scale-110 transition-all duration-300 ease-in-out bg-white/10 rounded-full flex items-center justify-center"
      >
        <ChevronLeft/>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 p-5 px-25 flex-shrink-0 mt-10">
        {logo ? (
          <img src={logo} alt="Logo" className="w-[270px] max-h-[170px] min-h-[110px] object-contain top-0 mb-2" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/270x170/cccccc/333333?text=Logo+Error'; }} />
        ) : (
          <h1 className="text-3xl font-bold mb-2 text-left">{displayTitle}</h1>
        )}
        {tagline && <p className="italic text-gray-300 mb-2 text-left">{tagline}</p>}

        {/* Metadata Row */}
        <div className="flex flex-wrap items-center text-gray-300 text-md mb-4 space-x-3 gap-2">
          {year && <span>{year}</span>}
          {original_language && <span>{original_language.toUpperCase()}</span>}
          <span className="flex items-center gap-1">
            <span className={`font-bold flex items-center gap-1 ${getColor(finalVote)}`}> <Banana size={16} /> {finalVote}</span> / 10
          </span>
          {finalGenres && <span>{finalGenres}</span>}
        </div>

        {/* Overview */}
        <p className="text-gray-200 text-sm leading-relaxed mb-6 line-clamp-4 w-150 text-justify">
          {overview}
        </p>

        {/* Action Buttons Row */}
        <DetailsPageButtonRow
          tmdbData={tmdbDataWithVideos} // Use tmdbDataWithVideos here
          onPlayResume={handlePlayResume}
          isTvShow={isTvShow}
          onPlayTrailer={handlePlayTrailer} // Pass the trailer handler
        />

        {/* Media Rows */}
        <div className="flex-1 overflow-y-auto w-full">
        {seasons.length > 0 && (
          <MediaRow
            title="Seasons"
            items={seasons}
            focusKeyPrefix="SEASON"
            onItemSelect={debouncedLoadEpisodes} // Debounced handler for seasons
            activeSeason={activeSeason}
            // No consolidatedMediaData passed since persistence is removed
            // No updateInternalLastFocusedSeason needed
          />
        )}

        {episodes.length > 0 && (
          <MediaRow
            title="Episodes"
            items={episodes}
            focusKeyPrefix="EPISODE"
            isImageRow
            activeSeason={activeSeason}
            imageFunc={getW500ImageUrl}
            tmdbData={tmdbDataWithVideos} // Use tmdbDataWithVideos here
            // No consolidatedMediaData passed since persistence is removed
          />
        )}

        {cast.length > 0 && (
          <MediaRow
            title="Cast"
            items={cast}
            focusKeyPrefix="CAST"
            imageFunc={getW500ImageUrl} // This could be adjusted or removed if not strictly needed
          />
        )}
      </div>
      </div>

      {/* Scrollable Content Area (Seasons, Episodes, Cast) */}
      
    </div>
  );
};

export default DetailsPage;
