// src/services/apiClient.js
const API_URL = import.meta.env.VITE_API_URL;

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

export { fetchMovie, fetchSeries };