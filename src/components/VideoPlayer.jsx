import PropTypes from "prop-types";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { useState, useEffect, useMemo } from "react";
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { reverseLanguageMap } from "../utils/languages";

function VideoPlayer({ files, subtitles }) {
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
    const hlsFile = files.find(file => file.type === 'hls');

    // State to keep track of the selected file
    const [selectedFile, setSelectedFile] = useState(hlsFile || files[files.length - 1]);

    useEffect(() => {
        if (hlsFile) {
            setSelectedFile(hlsFile);
        } else {
            setSelectedFile(files[files.length - 1]);
        }
    }, [files, hlsFile]);

    return (
        <div className="video-container">
            {/* Provider Selection Menu */}
            <div className="provider-menu">
                <h3>Select Provider</h3>
                {files.map((file, index) => (
                    <div key={index}>
                        <input
                            type="radio"
                            id={`provider-${index}`}
                            name="provider"
                            value={file.file}
                            checked={selectedFile.file === file.file}
                            onChange={() => setSelectedFile(file)}
                        />
                        <label htmlFor={`provider-${index}`}>{file.type} - {file.quality}</label>
                        {file.type === 'direct' && (
                            <a href={file.file} download className="download-button">
                                Download
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Vidstack Video Player */}
            <MediaPlayer title="Video Player" src={selectedFile.file} type={selectedFile.type} playsInline crossOrigin autoPlay={autoplay}>
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
        </div>
    );
}

VideoPlayer.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            file: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            quality: PropTypes.string,
            lang: PropTypes.string,
            headers: PropTypes.object,
        })
    ).isRequired,
    subtitles: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            lang: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default VideoPlayer;