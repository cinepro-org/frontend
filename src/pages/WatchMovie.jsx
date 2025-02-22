import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovie } from "../services/apiClient";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/WatchMovie.css";

function WatchMovie() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [files, setMovieFile] = useState(null);

  // get movie data
  useEffect(() => {
    if (movieId) {
      fetchMovie(movieId)
        .then((data) => {
          setMovie(data);
        })
        .catch((error) => console.error(error));
    }
  }, [movieId]);

  useEffect(() => {
    if (movie) {
      setMovieFile(movie.files);
    }
  }, [movie]);

  return (
    <div className={`watch-movie-container ${movie?.files ? "watch-movie-container-notLoading" : ""}`}>
      {movie?.files ? (
        <VideoPlayer files={movie.files} subtitles={movie.subtitles} />
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
}

export default WatchMovie;