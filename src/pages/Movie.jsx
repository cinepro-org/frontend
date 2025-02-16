import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovie } from "../services/apiClient";
import VideoPlayer from "../components/VideoPlayer";

function Movie() {
  const { movieId } = useParams();

  const [movie, setMovie] = useState(null);
  const [movieSource, setMovieSource] = useState(null);
  useEffect(() => {
    if (movieId) {
      fetchMovie(movieId)
        .then((data) => {
          setMovie(data);
          console.log(data);
        })
        .catch((error) => console.error(error));
    }
  }, []);

  useEffect(() => {
    if (movie) {
      setMovieSource(
        movie.sources.find((source) => source.provider === "EmbedSu")?.files[0]
          .file
      );
    }
  }, [movie]);

  return (
    <>
      {movieSource ? (
        <VideoPlayer m3u8Url={movieSource} />
      ) : (
        <h1>loading...</h1>
      )}
    </>
  );
}

export default Movie;
