import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlayCircle, CheckCircle, Eye, X } from "lucide-react";
import "./EpisodeOverlay.css";
import PropTypes from "prop-types";
import useFetchEpisodes from "../../hooks/useFetchEpisodes"; // <-- adjust path

const LOCAL_STORAGE_KEY = "cinepro_playback_progress";

export default function EpisodeOverlay({ contentId, currentSeason, currentEpisode ,onClose }) {
  const [selectedSeason, setSelectedSeason] = useState(currentSeason || 1);

  const { seasons, episodes, loading, error } = useFetchEpisodes(contentId, selectedSeason);
  const navigate = useNavigate();

  // --- Load saved progress from localStorage ---
  const savedProgress = useMemo(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw)[contentId]?.show_progress || {};
    } catch {
      return {};
    }
  }, [contentId]);

  if (loading) return <div className="eo-loading">Loading episodes...</div>;
  if (error) return <div className="eo-error">{error}</div>;

  return (
    <>
      <div className="closebutton"><X onClick={onClose}/></div>
 
    <div className="episode-overlay">
    <div className="holder">
        <h1>Seasons</h1>
        <p>{seasons.length}</p>
      </div>
      {/* --- Season Selector --- */}
      <div className="season-selector">
        {seasons.map((s) => (
          <div
            key={s.season_number}
            onClick={() => setSelectedSeason(s.season_number)}
            className={`season-btn ${s.season_number == selectedSeason ? "active" : ""}`}
          >
            {`${s.season_number}`}
          </div>
        ))}
      </div>
      <div className="holder">
        <h1>Episodes</h1>
        <p>{episodes.length}</p>
      </div>
      
    
      {/* --- Episodes List --- */}
      <div className="episodes-list">
        {episodes.map((ep) => {
          const key = `s${ep.season_number}e${ep.episode_number}`;
          const progress = savedProgress[key]?.progress;
          const watched = progress?.watched || 0;
          const duration = progress?.duration || ep.runtime * 60; // fallback runtime in sec
          const percent = duration ? Math.min((watched / duration) * 100, 100) : 0;

          const isActive =
            ep.season_number == currentSeason &&
            ep.episode_number == currentEpisode;

          const isCompleted = percent >= 95;

          
          return (
            <div
              key={ep.id}
              className={`episode-card ${isActive ? "active" : ""}`}
              onClick={() =>
                navigate(`/tv/${contentId}/${ep.season_number}/${ep.episode_number}`)
              }
            >
              {/* Poster */}
              <img
                src={
                  ep.still_path
                    ? `https://image.tmdb.org/t/p/w200${ep.still_path}`
                    : "/placeholder.png"
                }
                alt={ep.name}
                className="episode-poster"
              />

              {/* Info */}
              <div className="episode-info">
                <div className="episode-title">
                  <span>
                    E{ep.episode_number}. {ep.name}
                  </span>
                  {isActive && <PlayCircle size={18} className="icon active" />}
                  {isCompleted && <CheckCircle size={18} className="icon completed" />}
                  {!isCompleted && watched > 0 && (
                    <Eye size={18} className="icon watched" />
                  )}
                </div>
                <p className="episode-overview">{ep.overview}</p>

                {/* Progress Bar */}
                {watched > 0 && (
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${percent}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
    
  );
}

EpisodeOverlay.propTypes = {
  contentId: PropTypes.number.isRequired,
  currentSeason: PropTypes.number.isRequired,
  currentEpisode: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};
