// src/services/apiClient.js
const API_URL = import.meta.env.VITE_API_URL;
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY; 

const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        return new Error(error);
    }
};

const fetchMovie = async (id) => {
    if (/\D/.test(id)) {
        throw new Error("Invalid movie id");
    }
    const movieUrl = `${API_URL}/movie/${id}`;
    return fetchData(movieUrl);
};

const fetchSeries = async (id, season, episode) => {
    if (/\D/.test(id) || /\D/.test(season) || /\D/.test(episode)) {
        throw new Error("Invalid series id, season, or episode");
    }
    const seriesUrl = `${API_URL}/tv/${id}?s=${season}&e=${episode}`;
    return fetchData(seriesUrl);
};

//fetchTmdbDetails
export const fetchTmdbDetails = async (movieId, SN , EP) => {
  const movieType = SN && EP ? 'tv' : 'movie';
  const response = await fetch(`https://api.themoviedb.org/3/${movieType}/${movieId}?api_key=${TMDB_API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch TMDB details for movie ID: ${movieId}`);
  }
  const data = await response.json();
  return data;
};

export { fetchMovie, fetchSeries };