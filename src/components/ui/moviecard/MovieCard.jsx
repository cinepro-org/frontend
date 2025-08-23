import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Gamepad2, MoreVertical, X, Loader } from "lucide-react";
import apiConfig from "../../../services/apiConfig";

export default function MovieCard({ item }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContentType, setModalContentType] = useState(null); // 'details' | 'trailer'
  const [trailerKey, setTrailerKey] = useState(item?.trailerKey || null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  // Build image URLs
  const posterBaseUrl = "https://image.tmdb.org/t/p/w500";
  const backdropBaseUrl = "https://image.tmdb.org/t/p/original";

  const imageUrl = item?.poster_path
    ? `${posterBaseUrl}${item.poster_path}`
    : "https://placehold.co/224x112/cccccc/333333?text=No+Image";

  const backdropUrl = item?.backdrop_path
    ? `${backdropBaseUrl}${item.backdrop_path}`
    : imageUrl;

  const displayTitle = item?.title || item?.name || "Untitled";

  // Fetch trailer from TMDB
  const fetchTrailer = async () => {
    if (!item?.id || !item?.media_type) return;
    setLoadingTrailer(true);
    try {
      const res = await fetch(
        `${apiConfig.baseUrl}/${item.media_type}/${item.id}/videos?api_key=${apiConfig.apiKey}&language=en-US`
      );
      const data = await res.json();
      const ytTrailer = data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube"
      );
      if (ytTrailer) {
        setTrailerKey(ytTrailer.key);
      }
    } catch (err) {
      console.error("Error fetching trailer:", err);
    } finally {
      setLoadingTrailer(false);
    }
  };

  // --- Handlers ---
  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (item.media_type === "movie") {
      navigate(`/stream/${item.title}/${item.id}`);
    } else if (item.media_type === "tv") {
      navigate(`/stream/${item.name}/${item.id}/1/1`);
    }
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    setModalContentType("trailer");
    setIsModalOpen(true);
    if (!trailerKey) fetchTrailer();
  };

  const handleMoreDetailsClick = (e) => {
    e.stopPropagation();
    setModalContentType("details");
    setIsModalOpen(true);
    const slug = displayTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-*|-*$/g, "");
    navigate(`/${slug}/details/${item.id}`, { state: { itemInfo: item } });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContentType(null);
  };

  // --- Skeleton state ---
  if (!item) {
    return (
      <div className="relative group rounded-lg overflow-hidden w-58 h-30 bg-white/20 animate-pulse shadow-lg" />
    );
  }

  return (
    <div className="relative group rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 transform-gpu hover:scale-130 hover:z-20 w-58 h-30 bg-gray-900 shadow-lg">
      {/* Lazy loaded poster */}
      <img
        loading="lazy"
        src={apiConfig.w500Image(item.backdrop_path || item.poster_path)}
        alt={displayTitle}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-30"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/224x112/cccccc/333333?text=No+Image";
        }}
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/20 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-2 right-2 flex space-x-2 text-white">
          <div
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Add ${displayTitle} to list`);
            }}
            className="p-1 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-600 transition-colors"
          >
            <Plus size={16} />
          </div>
          <div
            onClick={handleTrailerClick}
            className="p-1 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-600 transition-colors"
          >
            <Gamepad2 size={16} />
          </div>
          <div
            onClick={handleMoreDetailsClick}
            className="p-1 flex items-center justify-center rounded-full bg-white/20 hover:bg-red-600 transition-colors"
          >
            <MoreVertical size={16} />
          </div>
        </div>

        <div
          onClick={handlePlayClick}
          className="flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-white text-sm font-semibold hover:bg-white hover:text-black transition-colors self-start mb-0"
        >
          <Play size={14} />
          <span className="text-[12px] font-normal line-clamp-1">
            {item.title || item.name}
          </span>
        </div>
      </div>

      {/* Full-screen modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center ">
          <div
            onClick={closeModal}
            className="absolute top-1 right-1 text-white z-9999 bg-white/20 p-2 rounded-full hover:bg-gray-500"
          >
            <X size={15} />
          </div>

          {modalContentType === "details" && (
            <div
              className="relative w-full h-full max-w-4xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden flex flex-col md:flex-row shadow-2xl"
              style={{
                backgroundImage: `linear-gradient(to top, rgba(17,24,39,1) 0%, rgba(17,24,39,0.8) 50%, rgba(17,24,39,0.6) 100%), url(${backdropUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="md:w-1/3 p-6 flex flex-col justify-center items-center">
                <img
                  loading="lazy"
                  src={imageUrl}
                  alt={displayTitle}
                  className="w-48 h-auto object-cover rounded-lg shadow-xl"
                />
              </div>
              <div className="md:w-2/3 p-6 text-white overflow-y-auto">
                <h2 className="text-4xl font-bold mb-4">{displayTitle}</h2>
                <p className="text-lg text-gray-300 mb-6">{item.overview}</p>
                {item.media_type === "movie" && item.release_date && (
                  <p className="text-gray-400">
                    Release Date: {item.release_date}
                  </p>
                )}
                {item.media_type === "tv" && item.first_air_date && (
                  <p className="text-gray-400">
                    First Air Date: {item.first_air_date}
                  </p>
                )}
                {item.vote_average && (
                  <p className="text-gray-400">
                    Rating: {item.vote_average.toFixed(1)}/10
                  </p>
                )}
              </div>
            </div>
          )}

          {modalContentType === "trailer" && (
            <div className="relative w-full h-full max-w-4xl max-h-[70vh] bg-black flex items-center justify-center rounded-lg overflow-hidden shadow-2xl">
              {loadingTrailer && (
                <p className="text-white text-center animate-spin"><Loader size={10}/> </p>
              )}
              {!loadingTrailer && trailerKey ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                  title={`${displayTitle} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

MovieCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    name: PropTypes.string,
    poster_path: PropTypes.string,
    backdrop_path: PropTypes.string,
    media_type: PropTypes.string,
    overview: PropTypes.string,
    genre_ids: PropTypes.arrayOf(PropTypes.number),
    release_date: PropTypes.string,
    first_air_date: PropTypes.string,
    vote_average: PropTypes.number,
    trailerKey: PropTypes.string,
  }),
};
