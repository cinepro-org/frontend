import  { useMemo, useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider, Track, Poster,Captions} from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { reverseLanguageMap } from "../../utils/languages";
import "./Videoplayer.css";
import QualitySubmenu from "./qualitysubmenu/QualitySubmenu";
import SourceSubmenu from "./sourcessubmenu/SourcesSubmenu";
import {
  PlayIcon,
  PauseIcon,
  Volume1Icon,
  Volume2Icon,
  VolumeXIcon,
  MaximizeIcon,
  MinimizeIcon,
  SubtitlesIcon,
  AirplayIcon,
  CastIcon,
  PictureInPictureIcon,
  SettingsIcon, // Add SettingsIcon
  PictureInPicture2,
  CaptionsOffIcon,
  ListEnd,
  ChevronLeft,
  ChevronRight,  // For back button in settings
} from 'lucide-react';
import EpisodeOverlay from "../episodesOverlay/EpisodeOverlay";
import { useNavigate } from "react-router-dom";
// import { type DefaultLayoutIcons } from '@vidstack/react/player/layouts/default';

 const customIcons = {
  // Main Play/Pause Button
  PlayButton: {
    Play: () => <PlayIcon className='vds-icon' />,
    Pause: () => <PauseIcon className='vds-icon' />,
    Replay: () => <PlayIcon className='vds-icon' />,
  },
  // Main Mute/Volume Button
  MuteButton: {
    Mute: () => <VolumeXIcon className='vds-icon' />,
    VolumeLow: () => <Volume1Icon className='vds-icon' />,
    VolumeHigh: () => <Volume2Icon className='vds-icon' />,
  },
  
  // Fullscreen Button
  FullscreenButton: {
    Enter: () => <MaximizeIcon className='vds-icon' />,
    Exit: () => <MinimizeIcon className='vds-icon' />,
  },
  // Captions Button
  CaptionButton: {
    On: () => <SubtitlesIcon className='vds-icon' />,
    Off: () => <CaptionsOffIcon className='vds-icon' />,
  },
  // AirPlay Button
  AirPlayButton: {
    Default: () => <AirplayIcon className='vds-icon' />,
  },
  // Cast Button
  GoogleCastButton: {
    Default: () => <CastIcon className='vds-icon' />,
  },
  // Picture-in-Picture Button
  PIPButton: {
    Enter: () => <PictureInPicture2 className='vds-icon' />,
    Exit: () => <PictureInPictureIcon className='vds-icon' />,
  },
  // Settings Button
   Menu: {
    ...defaultLayoutIcons.Menu, // Merges the default menu icons
  
    Settings: () => <SettingsIcon className='vds-icon' />,
    Captions: () => <SubtitlesIcon className='vds-icon' />,

    // Chevron for going back
    // ArrowLeft: () => <ChevronLeftIcon className='vds-icon' />,
  },
  // For the sub-menus like speed, quality, etc.
};

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
  const contentId = playerSettingsProps.id;
  const contentType = playerSettingsProps.season && playerSettingsProps.episode ? "series" : "movie";
  const seasonNumber = playerSettingsProps.season;
  const episodeNumber = playerSettingsProps.episode;

  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [hasFailedAllSources, setHasFailedAllSources] = useState(false);
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

  const handleSeek = (seconds) => {
    if (playerRef.current) {
      const newTime = playerRef.current.currentTime + seconds;
      playerRef.current.currentTime = Math.max(0, newTime);
    }
  };

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
      label: file.lang ? `${reverseLanguageMap[file.lang]} (${file.type})` : `Source ${index + 1} (${file.type})`,
      value: index.toString(),
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
  }, [contentId, contentType, seasonNumber, episodeNumber]);

  // --- Save Playback Progress to Local Storage (Debounced) ---
  const saveProgressToLocalStorage = useCallback(() => {
    if (!contentId || !playerRef.current || !playerRef.current.duration || playerRef.current.duration === Infinity) {
      return;
    }
    const watched = playerRef.current.currentTime;
    const duration = playerRef.current.duration;
    // Only save if content has been watched for a significant amount of time
    if (watched < 5 || watched >= duration - 5) {
      return;
    }
    try {
      const storedProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
      const progressData = {
        id: contentId,
        type: contentType,
        title: playerSettingsProps.title || "Unknown Title",
        poster_path: playerSettingsProps.poster || "",
        backdrop_path: playerSettingsProps.backdrop || "",
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
    } catch (error) {
      console.error("Error saving playback progress to local storage:", error);
    }
  }, [contentId, contentType, seasonNumber, episodeNumber, playerSettingsProps.title, playerSettingsProps.poster, playerSettingsProps.backdrop]);

  const debouncedSaveProgress = useMemo(() => debounce(saveProgressToLocalStorage, 5000), [saveProgressToLocalStorage]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && contentId) {
      player.addEventListener('time-update', debouncedSaveProgress);
      return () => {
        player.removeEventListener('time-update', debouncedSaveProgress);
        saveProgressToLocalStorage();
      };
    }
  }, [contentId, debouncedSaveProgress, saveProgressToLocalStorage]);

  // --- Player UI and error handling ---
  useEffect(() => {
    setCurrentSourceIndex(0);
    setHasFailedAllSources(false);

  }, [files, contentId]);

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

  const handleDropdownSelect = (value) => {
    const selectedIndex = parseInt(value, 10);
    setCurrentSourceIndex(selectedIndex);
    setHasFailedAllSources(false);
    
  };

  const [areControlsVisible, setAreControlsVisible] = useState(true);
 const handleControlsChange = (isVisible) => {
    setAreControlsVisible(isVisible);
    
  };

  const [showEpisodes , setShowEpisodes] = useState(false);

  const episodes = playerSettingsProps.episodes;
  const navigate = useNavigate();
  const currentEpisodeNumber = parseInt(episodeNumber, 10);
  const totalEpisodes = episodes?.length;

  const toggleEpisodes = () => {
    setShowEpisodes(!showEpisodes);
  };

  const handleNextEp = () => {
    const totalEpisodes = playerSettingsProps.episodes;
    if (totalEpisodes) {
      const nextEpisodeNumber = parseInt(episodeNumber , 10) + 1;
       if (nextEpisodeNumber <= totalEpisodes) {
        navigate(`/tv/${contentId}/${seasonNumber}/${nextEpisodeNumber}`);
      }
    }
  };

  const handlePrevEp = () => {
    const totalEpisodes = playerSettingsProps.episodes;
    if (totalEpisodes) {
      const prevEpisodeNumber = parseInt(episodeNumber) - 1;
      if (prevEpisodeNumber > 0) {
        navigate(`/tv/${contentId}/${seasonNumber}/${prevEpisodeNumber}`);
      }
    }
  };
  
  return (
    <div className="video-container">
      <div className="video-player-wrapper">
        {safeFiles.length > 0 && !hasFailedAllSources ? (
          <>

           
            <MediaPlayer
              ref={playerRef}
              // title={
              //   seasonNumber && episodeNumber
              //     ? `${playerSettingsProps.title || ""} S${seasonNumber} • E${episodeNumber}`
              //     : playerSettingsProps.title || ""
              // }
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

              {
                showEpisodes && (
                  <EpisodeOverlay contentId={contentId} currentSeason={seasonNumber} currentEpisode={episodeNumber} onClose={toggleEpisodes} />
                )
              }

       {
   areControlsVisible && (
    seasonNumber && episodeNumber ? (
      <div className="vds-custom-title">
        <p>{playerSettingsProps.title || ""}</p>
        <h1>
          S{seasonNumber}:E{episodeNumber} - <p>&quot;</p>{playerSettingsProps.activeEpisodeTitle || ""} <p>&quot;</p>
        </h1>
      </div>
    ) : (
      <div className="vds-custom-title">
        <p>Watching - {playerSettingsProps.tagline}</p>
        <h1>{playerSettingsProps.title || ""}</h1>
        
      </div>
    )
  )
}

 {
   areControlsVisible && (
    <div className="gradientholder">
      <div className="topgradient"></div>
      <div className="bottomgradient"></div>
    </div>
  )
}
             
             
              <DefaultVideoLayout icons={
                customIcons}
               slots={{
               largeLayout:{
                 beforePlayButton:
                  <button className="vds-button" onClick={() => handleSeek(-10)}>
                     <p>10</p>
                  <svg  className="vds-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>rotate-left-solid</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" data-name="icons Q2"> <g> <path d="M5.7,2A2,2,0,0,1,8,4V8.9A22,22,0,0,1,46,24h0a2,2,0,0,1-4,0h0A18,18,0,0,0,10.6,12h5.3A2.1,2.1,0,0,1,18,13.7,2,2,0,0,1,16,16H6a2,2,0,0,1-2-2V4.1A2.1,2.1,0,0,1,5.7,2Z"></path> <path d="M24,42h0a2,2,0,1,1-2,2A2,2,0,0,1,24,42Z"></path> <path d="M33,39.6h0a1.9,1.9,0,0,1,2.7.7A1.9,1.9,0,0,1,35,43a2,2,0,0,1-2-3.4Z"></path> <path d="M39.6,33a1.9,1.9,0,0,1,2.7-.7,2,2,0,0,1,.8,2.7,2.1,2.1,0,0,1-2.8.7,1.9,1.9,0,0,1-.7-2.7Z"></path> <path d="M5.7,32.3a1.9,1.9,0,0,1,2.7.7h0a1.9,1.9,0,0,1-.7,2.7A1.9,1.9,0,0,1,5,35,1.9,1.9,0,0,1,5.7,32.3Z"></path> <path d="M15,39.6h0a1.9,1.9,0,0,1,.7,2.7,2,2,0,0,1-2.7.8,2.1,2.1,0,0,1-.7-2.8A1.9,1.9,0,0,1,15,39.6Z"></path> </g> </g> </g> </g></svg>

                
                 </button>,
                 afterPlayButton: 
                     <button className="vds-button" onClick={() => handleSeek(-10)}>
                    <svg className="vds-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>rotate-right-solid</title> <g id="Layer_2" data-name="Layer 2"> <g id="invisible_box" data-name="invisible box"> <rect width="48" height="48" fill="none"></rect> </g> <g id="icons_Q2" data-name="icons Q2"> <g> <path d="M42.3,2A2,2,0,0,0,40,4V8.9A22,22,0,0,0,2,24H2a2,2,0,0,0,4,0H6A18,18,0,0,1,37.4,12H32.1A2.1,2.1,0,0,0,30,13.7,2,2,0,0,0,32,16H42a2,2,0,0,0,2-2V4.1A2.1,2.1,0,0,0,42.3,2Z"></path> <path d="M24,42h0a2,2,0,1,0,2,2A2,2,0,0,0,24,42Z"></path> <path d="M15,39.6h0a1.9,1.9,0,0,0-2.7.7A1.9,1.9,0,0,0,13,43a2,2,0,0,0,2-3.4Z"></path> <path d="M8.4,33a1.9,1.9,0,0,0-2.7-.7A2,2,0,0,0,4.9,35a2.1,2.1,0,0,0,2.8.7A1.9,1.9,0,0,0,8.4,33Z"></path> <path d="M42.3,32.3a1.9,1.9,0,0,0-2.7.7h0a1.9,1.9,0,0,0,.7,2.7A1.9,1.9,0,0,0,43,35,1.9,1.9,0,0,0,42.3,32.3Z"></path> <path d="M33,39.6h0a1.9,1.9,0,0,0-.7,2.7,2,2,0,0,0,2.7.8,2.1,2.1,0,0,0,.7-2.8A1.9,1.9,0,0,0,33,39.6Z"></path> </g> </g> </g> </g></svg>
                    <p>10</p>
                   </button>,

                    beforeTopControlsGroupEnd: seasonNumber ? <div className="season-selector">
                        {episodes && currentEpisodeNumber > 1 && (
      <button className="vds-button" onClick={handlePrevEp}>
       {currentEpisodeNumber - 1} <ChevronLeft className="vds-icon" /> 
      </button>
    )}

    <button className="custom-vds-button" onClick={toggleEpisodes} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' , padding: '0rem 1rem'}}>
      <div className="divider">|</div>
      <p style={{ fontSize: "0.8rem" }}>Episodes ({currentEpisodeNumber}/{totalEpisodes}) </p>
      <div className="divider">|</div>
    </button>

    {episodes && currentEpisodeNumber < totalEpisodes && (
      <button className="vds-button" onClick={handleNextEp}>
        <ChevronRight className="vds-icon" />  {currentEpisodeNumber + 1}
      </button>
    )}
                    </div> : null,
                    
               },
               smallLayout: {
                  beforeTopControlsGroupStart: seasonNumber ? <button className="custom-vds-button"  onClick={toggleEpisodes} ><ListEnd  className="vds-icon"/></button> : null,
               
               },
                afterCaptionButton: <div className="divider">|</div>,
                //  beforeSettingsMenuItemsStart: <QualitySubmenu />,
                 beforeMuteButton: <div className="divider">|</div>,
                 afterVolumeSlider: <div className="divider">|</div>,
                 beforeSettingsMenu : <QualitySubmenu />,
                 beforeGoogleCastButton: <div className="divider">|</div>,
                 afterSettingsMenu: <SourceSubmenu sources={videoSources} selectedValue={currentSourceIndex} onSelect={handleDropdownSelect} />,
              }}
              />
    
               <Captions className="vds-captions" />
             
               {
                sortedSubtitles.map((subtitle, index) => (
                  <Track
                    key={`${subtitle.lang}-${index}`}
                    kind="subtitles"
                    src={subtitle.url}
                    type={subtitle.type}
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
            <h3 className="no-video-text">
              {hasFailedAllSources ? "All video sources failed to load." : "No video file available"}
            </h3>
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
  seasonNumber: PropTypes.number,
  episodeNumber: PropTypes.number,
  playerSettingsProps: PropTypes.shape({
    theme: PropTypes.string,
    autoplay: PropTypes.bool,
    showTitle: PropTypes.bool,
    poster: PropTypes.string,
    title: PropTypes.string,
    backdrop: PropTypes.string,
  }).isRequired,
};

export default VideoPlayer;
