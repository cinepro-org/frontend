// src/pages/WatchMovie.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovie } from "../services/apiClient";
import VideoPlayer from "../components/VideoPlayer";
import "../styles/WatchMovie.css";

function WatchMovie() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [movieFile, setMovieFile] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);

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
      if (selectedProvider === null) {
        setSelectedProvider(
            movie.sources.find((source) => source.files[0].type === "hls")?.provider
        );
      }
    }
  }, [movie]);

  useEffect(() => {
    if (selectedProvider) {
      setMovieFile(
          movie.sources.find((source) => source.provider === selectedProvider)?.files[0]
      );
    }
  }, [selectedProvider, movie]);

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

        {movie && (
            <div className="provider-selection">
              {movie.sources.map((source, index) => (
                  <button
                      key={index}
                      className={`provider-button ${
                          source.provider === selectedProvider ? "selected" : ""
                      }`}
                      onClick={() => setSelectedProvider(source.provider)}
                  >
                    {source.provider}
                  </button>
              ))}
            </div>
        )}
      </div>
  );
}

export default WatchMovie;