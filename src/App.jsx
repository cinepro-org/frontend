import { useEffect, useState } from "react";
import "./styles/App.css";
import { fetchMovie } from "./services/apiClient";

function App() {
  const [movie, setMovie] = useState(null);
  useEffect(() => {
    fetchMovie(718930)
      .then((data) => {
        setMovie(data);
        console.log(data);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <>
      <h1>Hello World</h1>
      {movie && (
        <>
          <h1>let's-a go</h1>
          <embed src={movie.sources[2].sources[0].files[0].file} type="" />
        </>
      )}
    </>
  );
}

export default App;
