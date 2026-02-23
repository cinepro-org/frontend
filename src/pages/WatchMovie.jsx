/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchMovie, fetchSeries, refreshSources, fetchTmdbDetails } from "../services/apiClient";
import VideoPlayer from "../components/vidstackplayer/VideoPlayer";
import ArtPlayer from "../components/artplayer/ArtPlayer";
import { Link } from "react-router-dom";
import "../styles/WatchMovie.css";
import { EyeOff, Loader } from "lucide-react";
import useFetchEpisodes from "../hooks/useFetchEpisodes";

// Define a key for local storage
const LOCAL_STORAGE_KEY = "cinepro_player_config";

function WatchMovie() {
  const { id, season, episode } = useParams();
  const { episodes, loading, error } = useFetchEpisodes(id, season);
  const location = useLocation();

    const [movie, setMovie] = useState(null);
    const [files, setMovieFiles] = useState(null);
    const [tmdbDetails, setTmdbDetails] = useState(null);
    const [loadingBackend, setLoadingBackend] = useState(true);
    const [loadingTmdb, setLoadingTmdb] = useState(true);
    const [responseId, setResponseId] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);

  // Read saved params from local storage on initial render
  const savedParams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || {};

  const queryParams = new URLSearchParams(location.search);

  // Use URL params if available, otherwise fall back to saved params or default values
  const playerType = queryParams.get("player") || savedParams.player || "vidstack";
  const theme = queryParams.get("theme") || savedParams.theme || "#dc2626";
  const subtitleColor = queryParams.get("subtitleColor") || savedParams.subtitleColor || "#ffffff";
  const nextButton = queryParams.get("nextButton") === "true" || (savedParams.nextButton === true && queryParams.get("nextButton") === null) || false;
  const subtitleFontSize = queryParams.get("subtitleFontSize") || savedParams.subtitleFontSize || 16;
  const autoplay = queryParams.get("autoplay") === "true" || (savedParams.autoplay === true && queryParams.get("autoplay") === null) || false;
  const showTitleParam = queryParams.get("title") === "true" || (savedParams.showTitle === true && queryParams.get("title") === null) || false;
  const showPosterParam = queryParams.get("poster") === "true" || (savedParams.showPoster === true && queryParams.get("poster") === null) || false;

  const currentEpisode = episodes[episode - 1];
  const activeEpisodeTitle = currentEpisode ? currentEpisode.name : null;

  // New useEffect to save params to local storage whenever they change
  useEffect(() => {
    const newParams = {
      player: playerType,
      theme: theme,
      subtitleColor: subtitleColor,
      nextButton: nextButton,
      subtitleFontSize: subtitleFontSize,
      autoplay: autoplay,
      showTitle: showTitleParam,
      showPoster: showPosterParam,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newParams));
  }, [playerType, theme, subtitleColor, nextButton, subtitleFontSize, autoplay, showTitleParam, showPosterParam]);

  useEffect(() => {
    const finalTheme = theme.startsWith("#") ? theme : `#${theme}`;
    document.documentElement.style.setProperty("--theme-color", finalTheme);
  }, [theme]);

  useEffect(() => {
    const getBackendMovieDetails = async () => {
      setLoadingBackend(true);
      if (!id) return;

      if (id) {
        try {
          if (season && episode) {
            const data = await fetchSeries(id, season, episode);
            setMovie(data);
              setMovieFiles(data.files);
              if (data.responseId) setResponseId(data.responseId);
              if (data.expiresAt) setExpiresAt(data.expiresAt);
          } else {
            const data = await fetchMovie(id);
            setMovie(data);
            setMovieFiles(data.files);
              if (data.responseId) setResponseId(data.responseId);
              if (data.expiresAt) setExpiresAt(data.expiresAt);
          }
        } catch (error) {
          setMovie(null);
          setMovieFiles(null);
        } finally {
          setLoadingBackend(false);
        }
      } else {
        setLoadingBackend(false);
      }
    };

    getBackendMovieDetails();
  }, [id, season, episode]);

  useEffect(() => {
    const getTmdbDetails = async () => {
      setLoadingTmdb(true);
      if (id) {
        try {
          if (season && episode) {
            const data = await fetchTmdbDetails(id, season, episode);
            setTmdbDetails(data);
          } else {
            const data = await fetchTmdbDetails(id);
            setTmdbDetails(data);
          }
          //
        
        } catch (error) {
          setTmdbDetails(null);
        } finally {
          setLoadingTmdb(false);
        }
      } else {
        setLoadingTmdb(false);
      }
    };

    getTmdbDetails();
  }, [id, season, episode]);

  const playerTitle = showTitleParam && tmdbDetails ? tmdbDetails.title || tmdbDetails.name : "";
  const posterUrl = showPosterParam && tmdbDetails?.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbDetails.backdrop_path}` : "";

  const playerSettingsProps = {
    theme: theme,
    autoplay: autoplay,
    showTitle: showTitleParam,
    showPoster: showPosterParam,
    poster: posterUrl,
    title: playerTitle,
    id: id,
    tagline: tmdbDetails?.tagline,
    season: season,
    episode: episode,
    activeEpisodeTitle: activeEpisodeTitle,
    episodes: episodes,
    subtitleColor: subtitleColor,
    subtitleFontSize: subtitleFontSize,
    nextButton: nextButton,
  };

  const isLoading = loadingBackend || loadingTmdb;
  const hasErrors = (!movie || !files) && !loadingBackend;

    useEffect(() => {
        if (!expiresAt || !responseId) return;

        const expiryTime = new Date(expiresAt).getTime();
        const now = Date.now();
        // refresh 2 minutes before expiry
        const delay = expiryTime - now - 2 * 60 * 1000;

        if (delay <= 0) {
            // already expired or about to, refresh now
            refreshSources(responseId).then((data) => {
                if (data?.files) {
                    setMovieFiles(data.files);
                    setMovie(data);
                }
                if (data?.responseId) setResponseId(data.responseId);
                if (data?.expiresAt) setExpiresAt(data.expiresAt);
            }).catch(console.error);
            return;
        }

        const timer = setTimeout(() => {
            refreshSources(responseId).then((data) => {
                if (data?.files) {
                    setMovieFiles(data.files);
                    setMovie(data);
                }
                if (data?.responseId) setResponseId(data.responseId);
                if (data?.expiresAt) setExpiresAt(data.expiresAt);
            }).catch(console.error);
        }, delay);

        return () => clearTimeout(timer);
    }, [expiresAt, responseId]);

  return (
    <div className={`watch-movie-container ${!isLoading && movie?.files ? "watch-movie-container-notLoading" : ""}`}>
      {isLoading ? (
        <div className="loading">
          <img className="loadingimg" src={posterUrl} alt="" />
          <div className="loading-spinner">
            <Loader className="spinner" stroke="white" size={30} />
          </div>
          <div className="loading-title">
            {tmdbDetails ? <h1>{tmdbDetails.title || tmdbDetails.name}</h1> : <h1>Loading</h1>}
          </div>
        </div>
      ) : hasErrors ? (
        <div className="error">
          <EyeOff className="error-icon" color="#ff4d6d" />
          <h1>Not Found </h1>
          <p>We couldn&apos;t find the movie you were looking for.</p>
          <p>
            Try refreshing the page or go back to the
          </p>
        </div>
      ) : (
        <>
          {playerType === "art" ? (
            <ArtPlayer files={files} subtitles={movie.subtitles} {...playerSettingsProps} />
          ) : (
            <VideoPlayer files={files} subtitles={movie.subtitles} {...playerSettingsProps} t />
          )}
        </>
      )}
    </div>
  );
}

export default WatchMovie;