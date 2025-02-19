// src/components/VideoPlayer.jsx
import React, { useEffect } from "react";
import Hls from "hls.js";
import PropTypes from "prop-types";

function VideoPlayer({ m3u8Url, subtitles }) {
    const videoRef = React.useRef(null);

    useEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(m3u8Url);
            hls.attachMedia(videoRef.current);
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = m3u8Url;
        }
    }, [m3u8Url]);

    return (
        <video controls ref={videoRef} className="video-player">
            {subtitles &&
                subtitles.map((subtitle, index) => (
                    <track
                        key={index}
                        label={subtitle.label}
                        kind="subtitles"
                        srcLang={subtitle.lang}
                        src={subtitle.url}
                        default={index === 0}
                    />
                ))}
        </video>
    );
}

VideoPlayer.propTypes = {
    m3u8Url: PropTypes.string.isRequired,
    subtitles: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            lang: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default VideoPlayer;