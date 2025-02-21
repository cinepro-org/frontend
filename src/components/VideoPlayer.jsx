import React, { useEffect, useState } from "react";
import Hls from "hls.js";
import PropTypes from "prop-types";
import "../styles/VideoPlayer.css";

function VideoPlayer({ m3u8Url, subtitles, providers }) {
    const videoRef = React.useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const [currentProvider, setCurrentProvider] = useState(m3u8Url);

    useEffect(() => {
        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(currentProvider);
            hls.attachMedia(videoRef.current);
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = currentProvider;
        }
    }, [currentProvider]);

    return (
        <div className="video-container">
            {/* Video Player */}
            <video controls controlsList="nofullscreen" ref={videoRef} className="video-player">
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

            {/* Overlay Controls */}
            <div className="custom-controls">
                {/* Provider Selection Button */}
                <button className="provider-btn" onClick={() => setShowMenu(!showMenu)}>
                    📡 Providers
                </button>

                {/* Provider Selection Menu */}
                {showMenu && (
                    <div className="provider-menu">
                        {providers.map((provider, index) => (
                            <button
                                key={index}
                                className="provider-option"
                                onClick={() => {
                                    setCurrentProvider(provider.url);
                                    setShowMenu(false);
                                }}
                            >
                                {provider.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
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
    providers: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default VideoPlayer;
