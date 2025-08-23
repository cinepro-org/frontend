import PropTypes from "prop-types";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useState, useEffect, useMemo } from "react";
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { reverseLanguageMap } from "../utils/languages";

function VideoPlayer({ files, subtitles }) {
    // Helper to map file.type to MIME type
    function getMimeType(fileType) {
        switch (fileType) {
            case "hls":
                return "application/x-mpegurl";
            case "mp4":
                return "video/mp4";
            case "webm":
                return "video/webm";
            case "ogg":
                return "video/ogg";
            case "embed":
                return "text/html";
            default:
                return "application/x-mpegurl";
        }
    }
    // Ensure files is always an array, memoized for stable reference
    const safeFiles = useMemo(() => Array.isArray(files) ? files : [], [files]);
    // Sort subtitles by label alphabetically
    const sortedSubtitles = useMemo(() => {
        return (subtitles || []).filter(subtitle => subtitle).sort((a, b) => {
            const langA = reverseLanguageMap[a.lang] || '';
            const langB = reverseLanguageMap[b.lang] || '';
            return langA.localeCompare(langB);
        });
    }, [subtitles]);

    // check if it is loaded with ?autoplay=true
    const urlParams = new URLSearchParams(window.location.search);
    const autoplay = urlParams.get("autoplay") === "true";

    // Find the first file with type 'hls'
    const hlsFile = safeFiles.find(file => file.type === 'hls');

    // State to keep track of the selected file
    const [selectedFile, setSelectedFile] = useState(hlsFile || safeFiles[safeFiles.length - 1]);

    useEffect(() => {
        if (hlsFile) {
            setSelectedFile(hlsFile);
        } else {
            setSelectedFile(safeFiles[safeFiles.length - 1]);
        }
    }, [files, hlsFile, safeFiles]);

    return (
        <div className="video-container">
            {/* Provider Selection Menu */}
            {selectedFile ? (
                <div className="provider-menu">
                    <h3>Select Provider</h3>
                    {safeFiles.map((file, index) => (
                        <div key={index}>
                            <input
                                type="radio"
                                id={`provider-${index}`}
                                name="provider"
                                value={file.file}
                                checked={selectedFile.file === file.file}
                                onChange={() => setSelectedFile(file)}
                            />
                            <label htmlFor={`provider-${index}`}>Source {index} ({file.type})</label>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="provider-menu"><h3>No video file available</h3></div>
            )}

            {/* Vidstack Video Player */}
            {selectedFile && (
                <MediaPlayer
                    title="Video Player"
                    src={{
                        src: selectedFile.file,
                        type: getMimeType(selectedFile.type)
                    }}
                    playsInline
                    crossOrigin
                    autoPlay={autoplay}
                >
                    <MediaProvider />
                    <DefaultVideoLayout icons={defaultLayoutIcons} />
                    {
                        sortedSubtitles.map((subtitle, index) => (
                            <Track
                                key={`${subtitle.lang}-${index}`}
                                kind="subtitles"
                                src={subtitle.url}
                                srcLang={subtitle.lang}
                                label={`${reverseLanguageMap[subtitle.lang]} - ${index}`}
                            />
                        ))
                    }
                </MediaPlayer>
            )}
        </div>
    );
}

VideoPlayer.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            file: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            lang: PropTypes.string,
        })
    ).isRequired,
    subtitles: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string.isRequired,
            lang: PropTypes.string.isRequired,
            type: PropTypes.string,
        })
    ).isRequired,
};

export default VideoPlayer;