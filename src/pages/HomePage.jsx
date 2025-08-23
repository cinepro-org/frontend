import { useEffect, useRef, useState } from "react";
import Spotlight from "../components/ui/spotlight/Spotlight";
import { fetchTrending } from "../services/apiClient";
import MovieCard from "../components/ui/moviecard/MovieCard";
import SearchBar from "../components/searchbar/SearchBar";
import { Library, Projector, ChevronLeft, ChevronRight } from "lucide-react";

function HomePage() {
  const [trending, setTrending] = useState([]);
  const [movie, setMovie] = useState(null);
  const [tv, setTv] = useState(null);

  // refs for scrollable containers
  const movieRowRef = useRef(null);
  const tvRowRef = useRef(null);

  useEffect(() => {
    fetchTrending("all", "day").then((data) => {
      setTrending(data.results);
    });

    fetchTrending("movie", "day").then((data) => {
      setMovie(data.results);
    });

    fetchTrending("tv", "day").then((data) => {
      setTv(data.results);
    });
  }, []);

  const scrollRow = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 500; // adjust per scroll
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-tr from-black/92 to-gray-500 overflow-auto ">
      <header className="fixed top-0 left-15 w-[92%] h-16 flex items-center justify-between z-40 border-b border-white/10 ">
        <div className="flex items-center justify-between w-screen ">
          <div className="flex items-center gap-2">
            <Projector size={25} color="white" />
            <h2 className="text-2xl font-semi-bold text-left mb-6 text-white font-inter">
              CinePro
            </h2>
          </div>
          <div className="flex items-center z-40 h-0">
            <SearchBar />
          </div>
          <div>
            <Library size={30} color="white" />
          </div>
        </div>
      </header>

      <main className="flex flex-col items-start pl-9 mt-20 z-10">
        {/* Spotlight Row */}
        <h2 className="text-2xl font-normal text-left mb-6 text-white mb-3 pl-8">
          Trending Today
        </h2>

        <Spotlight trending={trending} />

        {/* Movies Row */}
        <div className="flex items-center justify-between w-full ">
          <h2 className="text-2xl font-normal text-left text-white pl-8">
            Trending Movies
          </h2>
          <div className="flex gap-2 pr-7">
            <button
              onClick={() => scrollRow(movieRowRef, "left")}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollRow(movieRowRef, "right")}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={movieRowRef}
          style={{ scrollbarWidth: "none" }}
          className="flex overflow-x-scroll gap-4 w-full pl-7 ml-0 z-10"
        >
          {movie &&
            movie.map((movie) => (
              <div className="shrink-0 w-58 p-2 py-5" key={movie.id}>
                <MovieCard item={movie} />
              </div>
            ))}
        </div>

        {/* TV Shows Row */}
        <div className="flex items-center justify-between w-full ">
          <h2 className="text-2xl font-normal text-left text-white pl-8">
            Trending TV Shows
          </h2>
          <div className="flex gap-3 pr-7">
            <button
              onClick={() => scrollRow(tvRowRef, "left")}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollRow(tvRowRef, "right")}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={tvRowRef}
          style={{ scrollbarWidth: "none" }}
          className="flex overflow-x-scroll gap-4 w-full pl-7"
        >
          {tv &&
            tv.map((tv) => (
              <div className="shrink-0 w-58 p-2 py-5" key={tv.id}>
                <MovieCard item={tv} />
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
