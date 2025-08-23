import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import ArtPlayer from '../components/player/Artplayer';

const BackendUrl = import.meta.env.VITE_BACKEND_URL;

export default function PlayerPage() {
    const [mediaData, setMediaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id, title, season, episode } = useParams(); // trailerUrl is not a direct URL param
      
    useEffect(() => {
       
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            // Construct the API URL based on whether it's a TV show or movie
            let apiUrl = BackendUrl;
            if (season && episode) {
                apiUrl += `tv/${id}?s=${season}&e=${episode}`;
            } else {
                apiUrl += `movie/${id}`;
            }

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                
                // Basic validation of the received data
                if (!data.files || data.files.length === 0) {
                    throw new Error("No media files found in the API response.");
                }

                setMediaData(data);
            } catch (e) {
                console.error("Failed to fetch media data:", e);
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
    }

    if (error) {
        return <div className="flex items-center justify-center h-screen bg-gray-900 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="w-full h-screen bg-black">
            {mediaData && (
                <ArtPlayer
                    files={mediaData.files}
                    subtitles={mediaData.subtitles}
                    title={title}
                    season={season}
                    episode={episode}
                    id={id}
                />
            )}
        </div>
    );
}
