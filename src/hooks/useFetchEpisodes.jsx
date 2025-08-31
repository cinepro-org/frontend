import { useState, useEffect } from "react";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const useFetchEpisodes = (seriesId, seasonNumber) => {
  const [episodes, setEpisodes] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!seriesId || !seasonNumber) {
      setError("Series ID and season number are required.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- Fetch TV Show details (contains seasons) ---
        const detailsUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${TMDB_API_KEY}`;
        const detailsRes = await fetch(detailsUrl);
        if (!detailsRes.ok) throw new Error("Failed to fetch show details");
        const detailsData = await detailsRes.json();

        if (detailsData.seasons) {
          setSeasons(detailsData.seasons);
        } else {
          setSeasons([]);
        }

        // --- Fetch selected season episodes ---
        const seasonUrl = `https://api.themoviedb.org/3/tv/${seriesId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`;
        const seasonRes = await fetch(seasonUrl);
        if (!seasonRes.ok) throw new Error("Failed to fetch season episodes");
        const seasonData = await seasonRes.json();

        if (seasonData.episodes) {
          setEpisodes(seasonData.episodes);
        } else {
          setEpisodes([]);
          setError("No episodes found for this season.");
        }
      } catch (err) {
        console.error(err);
        setError("An error occurred while fetching data. Please try again later.");
        setEpisodes([]);
        setSeasons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [seriesId, seasonNumber]);

  return { seasons, episodes, loading, error };
};

export default useFetchEpisodes;
