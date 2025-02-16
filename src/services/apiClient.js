const API_URL = import.meta.env.VITE_API_URL;

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error: ", error);
    throw error;
  }
};

const fetchMovie = async (id) => {
  const movieUrl = `${API_URL}/movie/${id}`;
  return fetchData(movieUrl);
};

const fetchSeries = async (id, season, episode) => {
  const seriesUrl = `${API_URL}/tv/${id}?s=${season}&e=${episode}`;
  return fetchData(seriesUrl);
};

export { fetchMovie, fetchSeries };
