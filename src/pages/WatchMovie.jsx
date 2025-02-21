// src/pages/WatchMovie.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovie } from "../services/apiClient";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/WatchMovie.css";


{/*TODO: Add file (provider) selection, use regex to get url root for naming*/ }

function WatchMovie() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [movieFile, setMovieFile] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

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
      setMovieFile(movie.files[0]);

      // used for movie provider selection, removed temporarly
      /*
      if (selectedProvider === null) {
        setSelectedProvider(
          movie.files.find((source) => source.files[0].type === "hls")?.provider
        );
      }
        */
    }

  }, [movie]);

  // used for movie provider, removed temporarly
  /*
  useEffect(() => {
    if (selectedProvider) {
      setMovieFile(
        movie?.files[0]
      );
    }
  }, [selectedProvider, movie]);
  */

  return (
    <div className="watch-movie-container">
      {movieFile ? (
        movieFile.type === "hls" ? (
          <VideoPlayer m3u8Url={movieFile?.file} subtitles={movie.subtitles} />
        ) : (
          <embed src={movieFile?.file} />
        )
      ) : (
        <h1>Loading...</h1>
      )}

      {/* used for movie provider selection, removed temporarly */}
      {/*
      {movie && (
        <div className="provider-selection">
          {movie.files.map((source, index) => (
            <button
              key={index}
              className={`provider-button ${source.provider === selectedProvider ? "selected" : ""
                }`}
              onClick={() => setSelectedProvider(source.provider)}
            >
              {source.provider}
            </button>
          ))}
        </div>
      )}
        */}
    </div>
  );
}

export default WatchMovie;