import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMovie } from "../services/apiClient";
import VideoPlayer from "../components/VideoPlayer";

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
  }, []);

  useEffect(() => {
    if (movie) {
      if (selectedProvider === null) {
        setSelectedProvider(
          movie.sources.find((source) => source.files[0].type === "hls")
            ?.provider
        );
      }
    }
  }, [movie]);

  useEffect(() => {
    if (selectedProvider) {
      setMovieFile(
        movie.sources.find((source) => source.provider === selectedProvider)
          ?.files[0]
      );
    }
  }, [selectedProvider]);

  return (
    <>
      {movieFile ? (
        movieFile.type === "hls" ? (
          <VideoPlayer m3u8Url={movieFile?.file} />) : (
          <embed src={movieFile?.file} />
        )
      ) : (
        <h1>loading...</h1>
      )}

      {movie &&
        movie.sources.map((source, index) => (
          <p key={index}>{source.provider}</p>
        ))}

      <h1>{selectedProvider}</h1>
      {/*TODO: add Provider Selection and Styling*/}
      {/*TODO: add Subtitles*/}
    </>
  );
}

export default WatchMovie;
