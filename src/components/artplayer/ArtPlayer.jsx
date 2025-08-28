import { useEffect, useRef, useMemo, useCallback } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import './Artplayer.css';
import { useNavigate } from "react-router";
import PropTypes from "prop-types";
import { reverseLanguageMap } from "../../utils/languages";

// Debounce utility function
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function ArtPlayer({ files, subtitles, ...playerSettingsProps }) {
    const artRef = useRef(null);
    const playerInstanceRef = useRef(null); // Renamed to avoid confusion with `playerRef` from Vidstack example
    const hlsRef = useRef(null);
    const navigate = useNavigate();

    // Use memoized values for consistent access within effects
    const currentContentId = playerSettingsProps.id;
    const currentContentType = playerSettingsProps.season && playerSettingsProps.episode ? "series" : "movie";
    const currentSeasonNumber = playerSettingsProps.season;
    const currentEpisodeNumber = playerSettingsProps.episode;
    const currentTitle = playerSettingsProps.title;
    const currentPoster = playerSettingsProps.poster;
    const currentBackdrop = playerSettingsProps.backdrop; // Assuming backdrop from props

    const getMimeType = (fileType) => {
        switch (fileType) {
            case "hls": return "m3u8";
            case "mp4": return "mp4";
            case "webm": return "webm";
            case "ogg": return "ogg";
            case "embed": return "mp4";
            default: return "m3u8";
        }
    };

    const sortedSubtitles = useMemo(() => {
        return Array.from(new Set((subtitles || []).filter(subtitle => subtitle).map(subtitle => subtitle.lang))).sort((a, b) => {
            const langA = reverseLanguageMap[a] || '';
            const langB = reverseLanguageMap[b] || '';
            return langA.localeCompare(langB);
        }).map(lang => subtitles.find(sub => sub.lang === lang));
    }, [subtitles]);

    // --- Local Storage Key ---
    const LOCAL_STORAGE_KEY = "cinepro_playback_progress";

    // --- Save Playback Progress to Local Storage (Debounced) ---
    const saveProgressToLocalStorage = useCallback(() => {
        const player = playerInstanceRef.current;
        if (!currentContentId || !player || player.duration === 0 || player.duration === Infinity) {
            return;
        }

        const watched = player.currentTime;
        const duration = player.duration;

        // Only save if content has been watched for a significant amount of time
        // or if it's almost finished (to mark as watched)
        if (watched < 5 || watched >= duration - 5) {
            return;
        }

        try {
            const storedProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');

            const progressData = {
                id: currentContentId,
                type: currentContentType,
                title: currentTitle || "Unknown Title",
                poster_path: currentPoster || "",
                backdrop_path: currentBackdrop || "",
                progress: {
                    watched: watched,
                    duration: duration,
                },
                last_updated: Date.now(),
            };

            if (currentContentType === 'series' || currentContentType === 'anime') {
                const episodeKey = `s${currentSeasonNumber}e${currentEpisodeNumber}`;
                const existingShowProgress = storedProgress[currentContentId]?.show_progress || {};

                progressData.last_season_watched = String(currentSeasonNumber);
                progressData.last_episode_watched = String(currentEpisodeNumber);
                progressData.show_progress = {
                    ...existingShowProgress,
                    [episodeKey]: {
                        season: String(currentSeasonNumber),
                        episode: String(currentEpisodeNumber),
                        progress: {
                            watched: watched,
                            duration: duration,
                        },
                    },
                };
            }

            const updatedProgress = {
                ...storedProgress,
                [currentContentId]: progressData,
            };

            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProgress));
            // console.log("ArtPlayer Progress saved to local storage:", progressData);
        } catch (error) {
            console.error("Error saving ArtPlayer playback progress to local storage:", error);
        }
    }, [currentContentId, currentContentType, currentSeasonNumber, currentEpisodeNumber, currentTitle, currentPoster, currentBackdrop]);

    const debouncedSaveProgress = useMemo(() => debounce(saveProgressToLocalStorage, 5000), [saveProgressToLocalStorage]);

    useEffect(() => {
        // Prevent creating a new instance on every render or if player is already initialized
        if (playerInstanceRef.current) {
            // If contentId, season, episode changes, destroy and re-initialize for new content
            const isNewContent =
                playerInstanceRef.current.option.id !== currentContentId ||
                playerInstanceRef.current.option.season !== currentSeasonNumber ||
                playerInstanceRef.current.option.episode !== currentEpisodeNumber;

            if (isNewContent) {
                playerInstanceRef.current.destroy(false);
                playerInstanceRef.current = null; // Mark for re-initialization
            } else {
                return; // Content is the same, no need to re-initialize
            }
        }

        if (!files || files.length === 0 || !currentContentId) {
            return;
        }

        const defaultFile = files.find(f => f.default) || files[0];

        const getSubtitleSettings = () => {
            if (!sortedSubtitles || sortedSubtitles.length === 0) return [];

            const subtitleSelectors = sortedSubtitles.map(sub => ({
                html: reverseLanguageMap[sub.lang] || sub.lang.toUpperCase(),
                url: sub.url,
                default: sub.default || false,
            }));

            // Add 'Display' toggle at the beginning if subtitles are available
            subtitleSelectors.unshift({
                html: 'Display',
                tooltip: 'Show',
                switch: true, // Default to true (subtitles shown)
                onSwitch: function (item) {
                    item.tooltip = item.switch ? 'Hide' : 'Show';
                    playerInstanceRef.current.subtitle.show = !item.switch;
                    return !item.switch;
                },
            });

            return [
                {
                    width: 250,
                    html: 'Subtitle',
                    tooltip: subtitleSelectors.find(sub => sub.default)?.html || 'Off',
                    icon: '<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H10C10.4142 15.25 10.75 15.5858 10.75 16C10.75 16.4142 10.4142 16.75 10 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16Z" fill="#ffffff"></path> <path d="M18 12.25C18.4142 12.25 18.75 12.5858 18.75 13C18.75 13.4142 18.4142 13.75 18 13.75H14C13.5858 13.75 13.25 13.4142 13.25 13C13.25 12.5858 13.5858 12.25 14 12.25H18Z" fill="#ffffff"></path> <path d="M11.75 16C11.75 15.5858 12.0858 15.25 12.5 15.25H14C14.4142 15.25 14.75 15.5858 14.75 16C14.75 16.4142 14.4142 16.75 14 16.75H12.5C12.0858 16.75 11.75 16.4142 11.75 16Z" fill="#ffffff"></path> <path d="M11.5 12.25C11.9142 12.25 12.25 12.5858 12.25 13C12.25 13.4142 11.9142 13.75 11.5 13.75H9.5C9.08579 13.75 8.75 13.4142 8.75 13C8.75 12.5858 9.08579 12.25 9.5 12.25H11.5Z" fill="#ffffff"></path> <path d="M15.75 16C15.75 15.5858 16.0858 15.25 16.5 15.25H18C18.4142 15.25 18.75 15.5858 18.75 16C18.75 16.4142 18.4142 16.75 18 16.75H16.5C16.0858 16.75 15.75 16.4142 15.75 16Z" fill="#ffffff"></path> <path d="M7 12.25C7.41421 12.25 7.75 12.5858 7.75 13C7.75 13.4142 7.41421 13.75 7 13.75H6C5.58579 13.75 5.25 13.4142 5.25 13C5.25 12.5858 5.58579 12.25 6 12.25H7Z" fill="#ffffff"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.94358 3.25H14.0564C15.8942 3.24998 17.3498 3.24997 18.489 3.40314C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33856 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.6104 20.1071 19.6614 20.4392 18.489 20.5969C17.3498 20.75 15.8942 20.75 14.0565 20.75H9.94359C8.10585 20.75 6.65018 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10583 3.24998 9.94358 3.25ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.75159 8.73851 2.75 10.0932 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H14C15.9068 19.25 17.2615 19.2484 18.2892 19.1102C19.2952 18.975 19.8749 18.7213 20.2981 18.2981C20.7213 17.8749 20.975 17.2952 21.1102 16.2892C21.2484 15.2615 21.25 13.9068 21.25 12C21.25 10.0932 21.2484 8.73851 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976Z" fill="#ffffff"></path> </g></svg>',
                    selector: subtitleSelectors,
                    onSelect: function (item) {
                        playerInstanceRef.current.subtitle.switch(item.url, {
                            name: item.html,
                        });
                        return item.html;
                    },
                },
            ];
        };

        const getSourcesSettings = () => {
            if (!files || files.length <= 1) return [];

            return [
                {
                    html: 'Sources',
                    tooltip: 'Source 1',
                    icon: '<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M2 12H7" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17 12H22" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>',
                    selector: files.map((f, index) => ({
                        html: `Source ${index + 1}`,
                        url: f.file,
                        default: f.default || false,
                    })),
                    onSelect: function (item) {
                        playerInstanceRef.current.switchUrl(item.url);
                        return item.html;
                    },
                },
            ];
        };

        const art = new Artplayer({
            container: artRef.current,
            url: defaultFile.file,
            type: getMimeType(defaultFile.type),
            title: currentTitle,
            volume: 0.7,
            autoplay: playerSettingsProps.autoplay || false,
            pip: true,
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            subtitleOffset: true,
            fullscreenWeb: false,
            miniProgressBar: true,
            playsInline: true,
            theme: playerSettingsProps.theme ? `#${playerSettingsProps.theme}` : '#ff4d6d', // Use default theme if not provided
            poster: currentPoster || '',
            backdrop: playerSettingsProps.showPoster || false, // Use showPoster from props
            subtitle: {
                default: true,
                url: sortedSubtitles && sortedSubtitles.length > 0 ? sortedSubtitles[0].url : '',
                type: 'srt', // Assuming srt for now, adjust if multiple types are needed
                offset: -1.5,
                style: {
                    color: playerSettingsProps.subtitleColor || '#ffffffff',
                    fontSize: playerSettingsProps.subtitleFontSize ? `${playerSettingsProps.subtitleFontSize}px` : '20px',
                    // subtitleOpacity needs custom handling or direct CSS via theme
                },
                encoding: 'utf-8',
            },
            id: currentContentId, // Store these props in options for access
            season: currentSeasonNumber,
            episode: currentEpisodeNumber,
            plugins: [
                artplayerPluginHlsControl({
                    quality: {
                        control: true,
                        setting: true,
                        getName: (level) => (level.height ? `${level.height}P` : `<svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M3 7h2v4h4V7h2v10H9v-4H5v4H3V7zm10 8V7h6v2h-4v6h4v2h-6v-2zm6 0V9h2v6h-2z" fill="#ffffff"></path> </g></svg>`),
                        title: "Quality",
                        auto: "Auto",
                    },
                    audio: {
                        control: true,
                        setting: true,
                        getName: (track) => track.name || "Track",
                        title: "Audio",
                        auto: "Auto",
                    },
                }),
            ],
            controls: [
                {
                    position: 'left',
                    html: `
                        <div style="display: flex; align-items: center; gap: 11px; margin-right: 6px; background-color: rgba(255, 255, 255, 0.082); padding: 10px 15px; border-radius: 20px;">
                            <svg width="16px" height="16px" viewBox="-5.5 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>chevron-left</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke-width="0.00026000000000000003" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-423.000000, -1196.000000)" fill="#ffffff"> <path d="M428.115,1209 L437.371,1200.6 C438.202,1199.77 438.202,1198.43 437.371,1197.6 C436.541,1196.76 435.194,1196.76 434.363,1197.6 L423.596,1207.36 C423.146,1207.81 422.948,1208.41 422.985,1209 C422.948,1209.59 423.146,1210.19 423.596,1210.64 L434.363,1220.4 C435.194,1221.24 436.541,1221.24 437.371,1220.4 C438.202,1219.57 438.202,1218.23 437.371,1217.4 L428.115,1209" id="chevron-left" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
                            <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">${currentTitle}</p>
                            ${(currentSeasonNumber && currentEpisodeNumber) ? `
                            <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">S${currentSeasonNumber}</p>
                            <svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="#ffffff"></path> </g></svg>
                            <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">E${currentEpisodeNumber}</p>
                            ` : ''}
                        </div>
                    `,
                    index: 1,
                    click: function () {
                        navigate('/');
                    },
                },
            ],
            customType: {
                m3u8: (video, url, artInstance) => { // Renamed 'art' to 'artInstance'
                    if (Hls.isSupported()) {
                        if (hlsRef.current) {
                            hlsRef.current.destroy();
                            hlsRef.current = null;
                        }

                        const hls = new Hls({
                            xhrSetup: function (xhr) {
                                const source = files.find(f => f.file === url);
                                if (source?.headers) {
                                    Object.entries(source.headers).forEach(([k, v]) =>
                                        xhr.setRequestHeader(k, v)
                                    );
                                }
                            },
                        });

                        hls.loadSource(url);
                        hls.attachMedia(video);
                        hlsRef.current = hls;
                        artInstance.hls = hls;

                        artInstance.on("destroy", () => {
                            if (hlsRef.current) {
                                hlsRef.current.destroy();
                                hlsRef.current = null;
                            }
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                    } else {
                        artInstance.notice.show = "Unsupported format: m3u8";
                    }
                },
            },
            // Include dynamic settings
            settings: [
                ...getSourcesSettings(),
                ...getSubtitleSettings(),
            ],
        });

        playerInstanceRef.current = art; // Store the Artplayer instance

        // --- Load Progress from Local Storage on Ready ---
        art.on("ready", () => {
            try {
                const storedProgress = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
                const contentProgress = storedProgress[currentContentId];

                if (contentProgress) {
                    let watchedTime = 0;
                    if (currentContentType === 'movie') {
                        watchedTime = contentProgress.progress?.watched || 0;
                    } else if (currentContentType === 'series' || currentContentType === 'anime') {
                        const episodeKey = `s${currentSeasonNumber}e${currentEpisodeNumber}`;
                        watchedTime = contentProgress.show_progress?.[episodeKey]?.progress?.watched || 0;
                    }

                    if (watchedTime > 0) {
                        art.currentTime = watchedTime;
                    }
                }
            } catch (error) {
                console.error("Error loading ArtPlayer playback progress from local storage:", error);
            }
        });

        art.on("timeupdate", () => {
            debouncedSaveProgress();
        });

        art.on("destroy", () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            saveProgressToLocalStorage(); // Ensure final save on destroy
        });


        // Cleanup function for Artplayer
        return () => {
            if (playerInstanceRef.current && !playerInstanceRef.current.destroyed) {
                playerInstanceRef.current.destroy(false);
                playerInstanceRef.current = null;
            }
        };
    }, [files, sortedSubtitles, navigate, playerSettingsProps, currentContentId, currentContentType, currentSeasonNumber, currentEpisodeNumber, currentTitle, currentPoster, currentBackdrop, debouncedSaveProgress]);


    return (
        <div
            ref={artRef}
            className="artplayercontainer"
            style={{ aspectRatio: "16/9" }}
        />
    );
}

ArtPlayer.propTypes = {
    files: PropTypes.arrayOf(
        PropTypes.shape({
            file: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
            headers: PropTypes.object,
            default: PropTypes.bool,
        })
    ).isRequired,
    subtitles: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string.isRequired,
            lang: PropTypes.string.isRequired,
            default: PropTypes.bool,
        })
    ).isRequired,
    // Changed id, season, episode to contentId, contentType, seasonNumber, episodeNumber for consistency
    contentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    contentType: PropTypes.oneOf(['movie', 'series', 'anime']).isRequired,
    seasonNumber: PropTypes.number,
    episodeNumber: PropTypes.number,
    playerSettingsProps: PropTypes.shape({
        theme: PropTypes.string,
        autoplay: PropTypes.bool,
        showTitle: PropTypes.bool,
        poster: PropTypes.string,
        title: PropTypes.string,
        backdrop: PropTypes.string,
        subtitleColor: PropTypes.string,
        subtitleFontSize: PropTypes.number,
        showPoster: PropTypes.bool, // Added to reflect usage in backdrop property
    }).isRequired,
};
