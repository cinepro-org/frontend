import PropTypes from "prop-types";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { reverseLanguageMap } from "../utils/languages";

function VideoPlayer({ files, subtitles }) {
    // Sort subtitles by label alphabetically
    const sortedSubtitles = (subtitles || []).filter(subtitle => subtitle).sort((a, b) => reverseLanguageMap[a.lang].localeCompare(reverseLanguageMap[b.lang]));

    // check if it is loaded with ?autoplay=true
    const urlParams = new URLSearchParams(window.location.search);
    const autoplay = urlParams.get("autoplay") === "true";

    return (
        <div className="video-container">
            {/* Vidstack Video Player */}
            <MediaPlayer title="Video Player" src={files[files.length - 1].file} playsInline crossOrigin autoPlay={autoplay}>
                <MediaProvider />
                <DefaultVideoLayout icons={defaultLayoutIcons} />
                {
                    sortedSubtitles.map((subtitle, index) => (
                        <Track key={`${subtitle.lang}-${index}`} kind="subtitles" src={subtitle.url} lang={subtitle.lang} label={reverseLanguageMap[subtitle.lang]} />
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