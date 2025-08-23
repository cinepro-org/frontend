import PropTypes from "prop-types";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "../carousel/carousel";
import apiConfig from "../../../services/apiConfig";
import { MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Spotlight = ({ trending }) => {
  const isLoading = !trending || trending.length === 0;
  const navigate = useNavigate();

   const handlePlayClick = (movie) => {
    // e.stopPropagation();
    if (movie.media_type === "movie") {
      navigate(`/stream/${movie.title}/${movie.id}`);
    } else if (movie.media_type === "tv") {
      navigate(`/stream/${movie.name}/${movie.id}/1/1`);
    }
  };


  const handleMoreDetailsClick = (movie) => {
    // e.stopPropagation();
    const slug = movie.title || movie.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "");
    navigate(`/${slug}/details/${movie.id}`, { state: { itemInfo: movie } });
  };

  return (
    <div className="relative container pl-9 pt-6 pb-6">
      <Carousel className="lg:w-[121%]">
        <CarouselContent className="w-full">
          {isLoading
            ? // Skeleton loader placeholders
              Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <div className="relative flex flex-col items-baseline bg-white/10 rounded-3xl shadow-sm w-58 h-full animate-pulse">
                    <div className="w-full h-95 bg-gray-700 rounded-3xl mb-2" />
                    <div className="flex flex-col absolute bottom-0 w-full backdrop-blur-md rounded-b-3xl pb-2 px-2">
                      <div className="flex justify-between items-center w-full mb-2">
                        <div className="h-4 w-3/4 bg-gray-600 rounded" />
                        <div className="h-4 w-8 bg-gray-600 rounded" />
                      </div>
                      <div className="h-3 w-full bg-gray-600 rounded mb-1" />
                      <div className="h-3 w-2/3 bg-gray-600 rounded" />
                    </div>
                  </div>
                </CarouselItem>
              ))
            : // Render real data
              trending.map((movie) => (
                <CarouselItem
                  key={movie.id}
                  className="pl-2 sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <div className="relative flex flex-col items-baseline bg-white/10 rounded-3xl shadow-sm hover:shadow-md transition-shadow duration-300 w-58">
                    <img
                      src={apiConfig.w500Image(movie.poster_path)}
                      alt={movie.name || movie.title}
                      className="w-full h-95 object-cover rounded-3xl mb-2"
                      onError={(e) =>
                        (e.target.src =
                          "https://placehold.co/400x300/cccccc/333333?text=Image+Error")
                      }
                    />

                    <div className="flex flex-col absolute bottom-0 backdrop-blur-md rounded-b-3xl pb-2 pl-1">
                      <div className="flex justify-between items-center w-full mb-2">
                        <h3 className="text-lg font-normal text-white/80 line-clamp-1 px-1 border-b border-white/50 text-left pl-2 w-3/4">
                          {movie.name || movie.title}
                        </h3>
                        <h3 className="text-lg font-normal text-white/80 line-clamp-1 px-1 border-b border-white/50 text-left pl-2">
                          {movie.vote_average
                            ? movie.vote_average.toFixed(1)
                            : "-"}
                        </h3>
                      </div>
                      <p className="text-white/60 line-clamp-2 text-xs text-left px-1">
                        {movie.overview}
                      </p>
                    </div>

                    <div className="flex justify-between gap-2 w-58 items-center px-1 py-0 absolute bottom-20">
                      <div className="flex gap-1">
                        <button onClick={() => handlePlayClick(movie)} >Play</button>
                        <div className="flex items-center bg-white/40 p-2 rounded-full hover:bg-white cursor-pointer backdrop-blur-md backdrop-saturate-500">
                          <Plus size={20} />
                        </div>
                      </div>
                      <div  onClick={() => handleMoreDetailsClick(movie)} className="flex items-center bg-white/20 hover:bg-white cursor-pointer p-2 rounded-full backdrop-blur-md backdrop-saturate-500">
                        <MoreVertical size={20} />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
        </CarouselContent>

        {/* Navigation buttons */}
        <CarouselPrevious className="left-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-gray-100 text-black z-100 " />
        <CarouselNext className="right-1 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-gray-100 text-black" />
      </Carousel>
    </div>
  );
};

// ✅ Fix prop-types warning
Spotlight.propTypes = {
  trending: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      poster_path: PropTypes.string,
      name: PropTypes.string,
      title: PropTypes.string,
      vote_average: PropTypes.number,
      overview: PropTypes.string,
    })
  ),
};

export default Spotlight;
