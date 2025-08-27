
import PropTypes from "prop-types";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { MediaPlayer, MediaProvider, Track, Poster } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { reverseLanguageMap } from "../../utils/languages";
import "./Videoplayer.css";
import { ToggleLeft } from "lucide-react";

// Debounce utility function
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

function VideoPlayer({ files, subtitles, ...playerSettingsProps }) {
  const playerRef = useRef(null);
  const selectRef = useRef(null);
  const contentId = playerSettingsProps.id;
  const contentType = playerSettingsProps.season && playerSettingsProps.episode ? "series" : "movie";
  const seasonNumber = playerSettingsProps.season;
  const episodeNumber = playerSettingsProps.episode;

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasFailedAllSources, setHasFailedAllSources] = useState(false);
  const [showSourceSelect, setShowSourceSelect] = useState(false);
  const [areControlsVisible, setAreControlsVisible] = useState(false);

  // Helper to determine MIME type
  function getMimeType(fileType) {
    switch (fileType) {
      case "hls": return "application/x-mpegurl";
      case "mp4": return "video/mp4";
      case "webm": return "video/webm";
      case "ogg": return "video/ogg";
      case "embed": return "video/mp4";
      default: return "application/x-mpegurl";
    }
  }

  // Memoized safe files and sorted subtitles
  const safeFiles = useMemo(() => Array.isArray(files) ? files : [], [files]);
  const sortedSubtitles = useMemo(() => {
    return Array.from(new Set((subtitles || []).filter(subtitle => subtitle).map(subtitle => subtitle.lang))).sort((a, b) => {
      const langA = reverseLanguageMap[a] || '';
      const langB = reverseLanguageMap[b] || '';
      return langA.localeCompare(langB);
    }).map(lang => subtitles.find(sub => sub.lang === lang));
  }, [subtitles]);

  // Memoized video sources
  const videoSources = useMemo(() => {
    return safeFiles.map((file, index) => ({
      src: file.file,
      type: getMimeType(file.type),
      label: file.lang ? `${reverseLanguageMap[file.lang]} (${file.type})` : `Source ${index + 1} (${file.type})`
    }));
  }, [safeFiles]);

  const currentSource = videoSources[currentSourceIndex];

  // --- Local Storage Key ---
  const LOCAL_STORAGE_KEY = "cinepro_playback_progress";

  // --- Load Playback Progress from Local Storage ---
  useEffect(() => {
    if (!contentId) return;

    const loadProgress = () => {
      try {
        const storedProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
        const contentProgress = storedProgress[contentId];

        if (contentProgress && playerRef.current) {
          let watchedTime = 0;

          if (contentType === 'movie') {
            watchedTime = contentProgress.progress?.watched || 0;
          } else if (contentType === 'series' || contentType === 'anime') {
            const episodeKey = `s${seasonNumber}e${episodeNumber}`;
            watchedTime = contentProgress.show_progress?.[episodeKey]?.progress?.watched || 0;
          }

          if (watchedTime > 0) {
            playerRef.current.currentTime = watchedTime;
          }
        }
      } catch (error) {
        console.error("Error loading playback progress from local storage:", error);
      }
    };

    // Ensure player is ready before trying to seek
    const onPlayerReady = () => {
      loadProgress();
      playerRef.current.removeEventListener('can-play', onPlayerReady);
    };

    if (playerRef.current) {
      playerRef.current.addEventListener('can-play', onPlayerReady);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.removeEventListener('can-play', onPlayerReady);
      }
    };

  }, [contentId, contentType, seasonNumber, episodeNumber ]);


  // --- Save Playback Progress to Local Storage (Debounced) ---
  const saveProgressToLocalStorage = useCallback(() => {
    if (!contentId || !playerRef.current || !playerRef.current.duration || playerRef.current.duration === Infinity) {
      return;
    }

    const watched = playerRef.current.currentTime;
    const duration = playerRef.current.duration;

    // Only save if content has been watched for a significant amount of time
    if (watched < 5 || watched >= duration - 5) { // e.g., only save if > 5 seconds watched and not near end
      return;
    }

    try {
      const storedProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

      const progressData = {
        id: contentId,
        type: contentType,
        title: playerSettingsProps.title || "Unknown Title",
        poster_path: playerSettingsProps.poster || "",
        backdrop_path: playerSettingsProps.backdrop || "", // Assuming backdrop_path might come from props
        progress: {
          watched: watched,
          duration: duration,
        },
        last_updated: Date.now(),
      };

      if (contentType === 'series' || contentType === 'anime') {
        const episodeKey = `s${seasonNumber}e${episodeNumber}`;
        const existingShowProgress = storedProgress[contentId]?.show_progress || {};

        progressData.last_season_watched = String(seasonNumber);
        progressData.last_episode_watched = String(episodeNumber);
        progressData.show_progress = {
          ...existingShowProgress,
          [episodeKey]: {
            season: String(seasonNumber),
            episode: String(episodeNumber),
            progress: {
              watched: watched,
              duration: duration,
            },
          },
        };
      }

      const updatedProgress = {
        ...storedProgress,
        [contentId]: progressData,
      };

      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
      // console.log("Progress saved to local storage:", progressData);
    } catch (error) {
      console.error("Error saving playback progress to local storage:", error);
    }
  }, [contentId, contentType, seasonNumber, episodeNumber, playerSettingsProps.title, playerSettingsProps.poster, playerSettingsProps.backdrop]);

  const debouncedSaveProgress = useMemo(() => debounce(saveProgressToLocalStorage, 5000), [saveProgressToLocalStorage]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && contentId) {
      player.addEventListener('time-update', debouncedSaveProgress);
      // Save final progress when the component unmounts or content changes
      return () => {
        player.removeEventListener('time-update', debouncedSaveProgress);
        // Ensure one last save on unmount or content change
        saveProgressToLocalStorage(); // Call non-debounced version for immediate save
      };
    }
  }, [contentId, debouncedSaveProgress, saveProgressToLocalStorage]);


  // --- Player UI and error handling ---
  useEffect(() => {
    setCurrentSourceIndex(0);
    setHasFailedAllSources(false);
    setShowSourceSelect(false);
  }, [files, contentId]); // Reset when files or content ID changes

  useEffect(() => {
    if (showSourceSelect && selectRef.current) {
      selectRef.current.focus();
    }
  }, [showSourceSelect]);

  const handleMediaError = () => {
    console.warn(`Failed to load source at index ${currentSourceIndex}.`);
    if (currentSourceIndex < videoSources.length - 1) {
      const nextIndex = currentSourceIndex + 1;
      setCurrentSourceIndex(nextIndex);
      console.warn(`Attempting next source at index ${nextIndex}...`);
    } else {
      setHasFailedAllSources(true);
      console.error("All video sources failed to load.");
    }
  };

  const handleSourceChange = (event) => {
    const selectedIndex = parseInt(event.target.value, 10);
    setCurrentSourceIndex(selectedIndex);
    setHasFailedAllSources(false);
    setShowSourceSelect(false);
  };

  const toggleSourceSelect = () => {
    setShowSourceSelect(prev => !prev);
  };

  const handleControlsChange = (isVisible) => {
    setAreControlsVisible(isVisible);
    if (!isVisible) {
      setShowSourceSelect(false);
    }
  };


  return (
    <div className="video-container">
      <div className="video-player-wrapper">
        {safeFiles.length > 0 && !hasFailedAllSources ? (
          <>
            {areControlsVisible && !showSourceSelect && (
              <button
                className="source-toggle-button"
                onClick={toggleSourceSelect}
                aria-label="Select video source"
              >
                <ToggleLeft size={20} />
              </button>
            )}

            {showSourceSelect && (
              <div className="sources-container">
                <select
                  id="source-select"
                  className="source-select"
                  value={currentSourceIndex}
                  onChange={handleSourceChange}
                  ref={selectRef}
                  onBlur={() => setShowSourceSelect(false)}
                >
                  {videoSources.map((source, index) => (
                    <option className="source-option" key={index} value={index}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <MediaPlayer
              ref={playerRef}
              title={playerSettingsProps.showTitle ? (playerSettingsProps.title || "") : ""}
              poster={playerSettingsProps.poster || ""}
              src={currentSource}
              playsInline
              crossOrigin
              autoPlay={playerSettingsProps.autoplay || false}
              onError={handleMediaError}
              onControlsChange={handleControlsChange}
              className="video-player"
            >

              <MediaProvider>
                <Poster
                  className="vds-poster"
                  src={playerSettingsProps.poster || ""}
                  alt={playerSettingsProps.showTitle ? (playerSettingsProps.title || "") : ""}
                />
              </MediaProvider>
              <DefaultVideoLayout icons={defaultLayoutIcons}>

              </DefaultVideoLayout>
              {
                sortedSubtitles.map((subtitle, index) => (
                  <Track
                    key={`${subtitle.lang}-${index}`}
                    kind="subtitles"
                    src={subtitle.url}
                    srcLang={subtitle.lang}
                    label={reverseLanguageMap[subtitle.lang] || subtitle.lang}
                    default={index === 0}
                  />
                ))
              }
            </MediaPlayer>
          </>
        ) : (
          <div className="no-video-message">
            <h1 className="no-video-text">
              {hasFailedAllSources ? "All video sources failed to load." : "No video file available"}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}

VideoPlayer.propTypes = {
  files: PropTypes.arrayOf(
    PropTypes.shape({
      file: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      lang: PropTypes.string,
    })
  ).isRequired,
  subtitles: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      lang: PropTypes.string.isRequired,
      type: PropTypes.string,
    })
  ).isRequired,
  contentId: PropTypes.string.isRequired,
  contentType: PropTypes.oneOf(['movie', 'series', 'anime']).isRequired,
  seasonNumber: PropTypes.number, // Required for series/anime
  episodeNumber: PropTypes.number, // Required for series/anime
  playerSettingsProps: PropTypes.shape({
    theme: PropTypes.string,
    autoplay: PropTypes.bool,
    showTitle: PropTypes.bool,
    poster: PropTypes.string,
    title: PropTypes.string,
    backdrop: PropTypes.string, // Added for consistency with the provided structure
  }).isRequired,
};

export default VideoPlayer;
