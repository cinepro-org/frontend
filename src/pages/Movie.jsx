import { useEffect, useState } from "react";
import "./styles/App.css";
import { fetchMovie } from "./services/apiClient";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const [movie, setMovie] = useState(null);
  const [movieSource, setMovieSource] = useState(null);
  const movieId = 718930;
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

export default App;
