import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { fetchMovie, fetchTmdbDetails } from "../services/apiClient"; // Assuming fetchTmdbDetails is now available
import VideoPlayer from "../components/vidstackplayer/VideoPlayer";
import ArtPlayer from "../components/artplayer/ArtPlayer";
import { Link } from "react-router-dom";
import "../styles/WatchMovie.css";
import { EyeOff, Loader } from "lucide-react";

function WatchMovie() {
  const { id , season , episode  } = useParams();
  const location = useLocation();

  const [movie, setMovie] = useState(null); // For your backend movie data (files, subtitles)
  const [files, setMovieFiles] = useState(null);
  const [tmdbDetails, setTmdbDetails] = useState(null); // For TMDB specific details (title, backdrop)
  const [loadingBackend, setLoadingBackend] = useState(true);
  const [loadingTmdb, setLoadingTmdb] = useState(true);

  const queryParams = new URLSearchParams(location.search);
  const playerType = queryParams.get("player") || "vidstack";
  const theme = queryParams.get("theme") || "#dc2626";
  const autoplay = queryParams.get("autoplay") === "true";
  const showTitleParam = queryParams.get("title") === "true";
  const showPosterParam = queryParams.get("poster") === "true";

  useEffect(() => {
    const getBackendMovieDetails = async () => {
      setLoadingBackend(true);
      if (id) {
        try {
          const data = await fetchMovie(id);
          setMovie(data);
          setMovieFiles(data.files);
        } catch (error) {
          console.error("Error fetching backend movie details:", error);
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
  }, [id]);

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
        } catch (error) {
          console.error("Error fetching TMDB details:", error);
          setTmdbDetails(null);
        } finally {
          setLoadingTmdb(false);
        }
      } else {
        setLoadingTmdb(false);
      }
    };

    getTmdbDetails();
  }, [id , season, episode ]);

  

  const playerTitle = showTitleParam && tmdbDetails ? tmdbDetails.title : '';
  const posterUrl = showPosterParam && tmdbDetails?.backdrop_path ? `https://image.tmdb.org/t/p/original${tmdbDetails.backdrop_path}` : '';

  const playerSettingsProps = {
    theme: theme,
    autoplay: autoplay,
    showTitle: showTitleParam,
    showPoster: showPosterParam,
    poster: posterUrl,
    title: playerTitle,
    id: id,
    season: season,
    episode: episode
  };

  const isLoading = loadingBackend || loadingTmdb;
  const hasErrors = (!movie || !files) && !loadingBackend; // Check for errors only after backend loading is done
  // const hasTmdbErrors = !tmdbDetails && !loadingTmdb && showTitleParam || showPosterParam; // Check if TMDB data is needed but missing

  return (
    <div className={`watch-movie-container ${!isLoading && movie?.files ? "watch-movie-container-notLoading" : ""}`}>
      {isLoading ? (
        <div className="loading">
          
          <img className="loadingimg" src={posterUrl} alt='' />
          <div className="loading-spinner">
             <Loader className="spinner" stroke="white" size={30}/>
          </div>
          <div className="loading-title">
            {
              tmdbDetails ? (
                <h1>{tmdbDetails.title}</h1>
              ) : (
                <h1>Loading</h1>
              )
            }
          </div>
          {/* <div className="randomcorner">
            <img src="https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3d2V3OXB5Z21zMW5hbjd5cjBlNGtpbHE1ZmpwajhvZDlhbzMwZWJsMyZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9cw/i5eoyLO4iZG6SBAtmD/giphy.gif" alt="" />
          </div> */}
        </div>
      ) : hasErrors ? (
        <div className="error">
          <EyeOff className="error-icon" color="#ff4d6d" />
          <h1>Not Found </h1>
         <p>We couldn't find the movie you were looking for.</p>
          <p>Try refreshing the page or go back to the <Link to="/">homepage</Link></p>
        </div>
        
      ) : (
        <>
          {playerType === "art" ? (
            <ArtPlayer files={files} subtitles={movie.subtitles} {...playerSettingsProps} />
          ) : (
            <VideoPlayer files={files} subtitles={movie.subtitles} {...playerSettingsProps} />
          )}
        </>
      )}
    </div>
  );
}

export default WatchMovie;
