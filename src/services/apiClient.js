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
    const movieUrl = `${API_URL}/v1/movies/${id}`;
    const data = await fetchData(movieUrl);
    return transformResponse(data);
};

const fetchSeries = async (id, season, episode) => {
    if (/\D/.test(id) || /\D/.test(season) || /\D/.test(episode)) {
        throw new Error("Invalid series id, season, or episode");
    }
    const seriesUrl = `${API_URL}/v1/tv/${id}/seasons/${season}/episodes/${episode}`;
    const data = await fetchData(seriesUrl);
    return transformResponse(data);
};

export const refreshSources = async (responseId) => {
    const url = `${API_URL}/v1/refresh/${responseId}`;
    const data = await fetchData(url);
    return transformResponse(data);
};
// transforms backend response to frontend shape
const transformResponse = (data) => {
    if (!data || !data.sources) return data;

    const files = data.sources.map((source, index) => {
        // decode proxy url to extract headers
        let headers = {};
        try {
            const dataParam = new URL(source.url).searchParams.get('data');
            if (dataParam) {
                const parsed = JSON.parse(decodeURIComponent(dataParam));
                headers = parsed.headers || {};
            }
        } catch {
            // ignore decode errors
        }

        return {
            file: source.url,
            type: source.type === 'hls' ? 'hls' : source.type,
            quality: source.quality || 'unknown',
            headers,
            provider: source.provider,
            label: `${source.provider?.name || 'Source'} - ${source.quality || ''}`.trim(),
            default: index === 0,
        };
    });

    const subtitles = (data.subtitles || []).map((sub) => ({
        url: sub.url,
        lang: sub.label?.toLowerCase().replace(/\s+/g, '_') || 'unknown',
        label: sub.label,
        format: sub.format,
        default: sub.label?.toLowerCase() === 'english',
    }));

    return {
        files,
        subtitles,
        responseId: data.responseId,
        expiresAt: data.expiresAt,
        diagnostics: data.diagnostics,
    };
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