import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Movie.css";

function Movie() {
  const [movieId, setMovieId] = useState("");
  const navigate = useNavigate();

  function handleMovieIdSubmit(e) {
    e.preventDefault();
    navigate(`/movie/${movieId}`);
  }

  return (
    <div className="movie-container">
      <h1>Enter a Movie id</h1>
      <form onSubmit={handleMovieIdSubmit}>
        <input
          type="text"
          placeholder="Enter a movie id"
          value={movieId}
          onChange={(e) => setMovieId(e.target.value.replace(/\D/, ""))}
          pattern="\d*"
        />
        <button type="submit">Watch</button>
      </form>
      <Link to={"/movie/339403"}>Watch sample movie</Link>
    </div>
  );
}

export default Movie;