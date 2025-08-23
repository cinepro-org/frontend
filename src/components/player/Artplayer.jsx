import React, { useEffect, useRef } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import './Artplayer.css';
import { useNavigate } from "react-router";

const ProxyUrl = import.meta.env.VITE_PROXY_URL;

// Helper: debounce
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

export default function ArtPlayer({ files, subtitles, title , id, season, episode }) {
    const artRef = useRef(null);
    const playerRef = useRef(null);
    const hlsRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        // Prevent creating a new instance on every render
        if (playerRef.current) {
            return;
        }

        if (!files || files.length === 0) return;

        const defaultFile = files.find(f => f.default) || files[0];
        const lastPositionKey = `artplayer_last_position_${id}_${season}_${episode}`;
         
         const getSubtitleSettings = () => {
            if (!subtitles || subtitles.length === 0) return [];

            const subtitleSelectors = subtitles.map(sub => ({
                html: sub.lang.toUpperCase(),
                url: sub.url,
                // Add 'default: true' for the first subtitle to be selected by default
                default: sub.default || false, 
            }));

            // If you want a 'Display' toggle for subtitles, add it here
            // Example from Artplayer docs:
            subtitleSelectors.unshift({
                html: 'Display',
                tooltip: 'Show',
                switch: true,
                onSwitch: function (item) {
                    item.tooltip = item.switch ? 'Hide' : 'Show';
                    art.subtitle.show = !item.switch;
                    return !item.switch;
                },
            });

            return [
                {
                    width: 200,
                    html: 'Subtitle',
                    tooltip: 'En',
                     icon: '<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M5.25 16C5.25 15.5858 5.58579 15.25 6 15.25H10C10.4142 15.25 10.75 15.5858 10.75 16C10.75 16.4142 10.4142 16.75 10 16.75H6C5.58579 16.75 5.25 16.4142 5.25 16Z" fill="#ffffff"></path> <path d="M18 12.25C18.4142 12.25 18.75 12.5858 18.75 13C18.75 13.4142 18.4142 13.75 18 13.75H14C13.5858 13.75 13.25 13.4142 13.25 13C13.25 12.5858 13.5858 12.25 14 12.25H18Z" fill="#ffffff"></path> <path d="M11.75 16C11.75 15.5858 12.0858 15.25 12.5 15.25H14C14.4142 15.25 14.75 15.5858 14.75 16C14.75 16.4142 14.4142 16.75 14 16.75H12.5C12.0858 16.75 11.75 16.4142 11.75 16Z" fill="#ffffff"></path> <path d="M11.5 12.25C11.9142 12.25 12.25 12.5858 12.25 13C12.25 13.4142 11.9142 13.75 11.5 13.75H9.5C9.08579 13.75 8.75 13.4142 8.75 13C8.75 12.5858 9.08579 12.25 9.5 12.25H11.5Z" fill="#ffffff"></path> <path d="M15.75 16C15.75 15.5858 16.0858 15.25 16.5 15.25H18C18.4142 15.25 18.75 15.5858 18.75 16C18.75 16.4142 18.4142 16.75 18 16.75H16.5C16.0858 16.75 15.75 16.4142 15.75 16Z" fill="#ffffff"></path> <path d="M7 12.25C7.41421 12.25 7.75 12.5858 7.75 13C7.75 13.4142 7.41421 13.75 7 13.75H6C5.58579 13.75 5.25 13.4142 5.25 13C5.25 12.5858 5.58579 12.25 6 12.25H7Z" fill="#ffffff"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.94358 3.25H14.0564C15.8942 3.24998 17.3498 3.24997 18.489 3.40314C19.6614 3.56076 20.6104 3.89288 21.3588 4.64124C22.1071 5.38961 22.4392 6.33856 22.5969 7.51098C22.75 8.65018 22.75 10.1058 22.75 11.9435V12.0564C22.75 13.8942 22.75 15.3498 22.5969 16.489C22.4392 17.6614 22.1071 18.6104 21.3588 19.3588C20.6104 20.1071 19.6614 20.4392 18.489 20.5969C17.3498 20.75 15.8942 20.75 14.0565 20.75H9.94359C8.10585 20.75 6.65018 20.75 5.51098 20.5969C4.33856 20.4392 3.38961 20.1071 2.64124 19.3588C1.89288 18.6104 1.56076 17.6614 1.40314 16.489C1.24997 15.3498 1.24998 13.8942 1.25 12.0564V11.9436C1.24998 10.1058 1.24997 8.65019 1.40314 7.51098C1.56076 6.33856 1.89288 5.38961 2.64124 4.64124C3.38961 3.89288 4.33856 3.56076 5.51098 3.40314C6.65019 3.24997 8.10583 3.24998 9.94358 3.25ZM5.71085 4.88976C4.70476 5.02502 4.12511 5.27869 3.7019 5.7019C3.27869 6.12511 3.02502 6.70476 2.88976 7.71085C2.75159 8.73851 2.75 10.0932 2.75 12C2.75 13.9068 2.75159 15.2615 2.88976 16.2892C3.02502 17.2952 3.27869 17.8749 3.7019 18.2981C4.12511 18.7213 4.70476 18.975 5.71085 19.1102C6.73851 19.2484 8.09318 19.25 10 19.25H14C15.9068 19.25 17.2615 19.2484 18.2892 19.1102C19.2952 18.975 19.8749 18.7213 20.2981 18.2981C20.7213 17.8749 20.975 17.2952 21.1102 16.2892C21.2484 15.2615 21.25 13.9068 21.25 12C21.25 10.0932 21.2484 8.73851 21.1102 7.71085C20.975 6.70476 20.7213 6.12511 20.2981 5.7019C19.8749 5.27869 19.2952 5.02502 18.2892 4.88976C17.2615 4.75159 15.9068 4.75 14 4.75H10C8.09318 4.75 6.73851 4.75159 5.71085 4.88976Z" fill="#ffffff"></path> </g></svg>', // Example SVG for source icon
                      selector: subtitleSelectors,
                    onSelect: function (item) {
                        art.subtitle.switch(item.url, {
                            name: item.html,
                        });
                        return item.html;
                    },
                },
            ];
        };

        // Prepare sources setting
        const getSourcesSettings = () => {
            if (!files || files.length <= 1) return []; // Only show sources if there's more than one

            return [
                {
                    html: 'Sources',
                    tooltip: 'Source 1',
                    icon: '<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 16.5C14.4853 16.5 16.5 14.4853 16.5 12C16.5 9.51472 14.4853 7.5 12 7.5C9.51472 7.5 7.5 9.51472 7.5 12C7.5 14.4853 9.51472 16.5 12 16.5Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M2 12H7" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M17 12H22" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>',
                   selector: files.map((f, index) => ({
                        html: `Source ${index + 1}`,
                        url: f.file,
                        default: f.default || false, // Mark default source if specified
                    })),
                    onSelect: function (item) {
                        art.switchUrl(item.url);
                        return item.html;
                    },
                },
            ];
        };
        const art = new Artplayer({
            container: artRef.current,
            url: defaultFile.file,
            type: "m3u8",
            title,
            volume: 0.7,
            autoplay: true,
            pip: true,
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            subtitleOffset: true,
            fullscreenWeb: false,
            miniProgressBar: true,
            playsInline: true,
            theme: "#ffffffff",
            // quality: [], // HLS plugin will populate this if stream has multiple qualities
            subtitle: {
                // switch: true,
                default: true,
                url: subtitles && subtitles.length > 0 ? subtitles[0].url : '', // Set initial subtitle if available
                type: 'srt', // Use 'srt' type directly
                offset: -1.5,
                style: {
                    color: '#ffffffff',
                    fontSize: '20px',
                },
                encoding: 'utf-8',
            },
             settings: [
                  ...getSourcesSettings(), // Add sources directly here
                  ...getSubtitleSettings(), // Add subtitles directly here
       
             
            ],
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
           
            customType: {
 let preferProxy = false; // global/session flag

m3u8: async (video, url, art) => {
    if (!Hls.isSupported()) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
        } else {
            art.notice.show = "Unsupported format: m3u8";
        }
        return;
    }

    if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
    }

    const tryLoad = (sourceUrl) => {
        return new Promise((resolve, reject) => {
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

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                hlsRef.current = hls;
                art.hls = hls;
                resolve(true);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    hls.destroy();
                    reject(data);
                }
            });

            art.on("destroy", () => {
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                    hlsRef.current = null;
                }
            });
        });
    };

    try {
        if (!preferProxy) {
            // First, test direct fetch
            await fetch(url, { method: "HEAD", mode: "cors" });
            await tryLoad(url);
        } else {
            throw new Error("Proxy preferred already");
        }
    } catch (err) {
        console.warn("Direct URL failed or blocked:", err);

        if (ProxyUrl) {
            try {
                const proxiedUrl = ProxyUrl + encodeURIComponent(url);
                await tryLoad(proxiedUrl);
                preferProxy = true; // remember proxy works
            } catch (proxyErr) {
                console.error("Proxy also failed:", proxyErr);
                art.notice.show = "Playback failed: m3u8";
            }
        } else {
            art.notice.show = "Playback failed: no proxy available";
        }
    }
},


},
            controls: [
    {
        position: 'left',
        // FIX: Replaced direct string with a div containing the SVG and a p tag
        html: `
            <div style="display: flex; align-items: center; gap: 11px; margin-right: 6px; background-color: rgba(255, 255, 255, 0.082); padding: 10px 15px; border-radius: 20px;">
                <svg width="16px" height="16px" viewBox="-5.5 0 26 26" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>chevron-left</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke-width="0.00026000000000000003" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-423.000000, -1196.000000)" fill="#ffffff"> <path d="M428.115,1209 L437.371,1200.6 C438.202,1199.77 438.202,1198.43 437.371,1197.6 C436.541,1196.76 435.194,1196.76 434.363,1197.6 L423.596,1207.36 C423.146,1207.81 422.948,1208.41 422.985,1209 C422.948,1209.59 423.146,1210.19 423.596,1210.64 L434.363,1220.4 C435.194,1221.24 436.541,1221.24 437.371,1220.4 C438.202,1219.57 438.202,1218.23 437.371,1217.4 L428.115,1209" id="chevron-left" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
                <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">${title}</p>
                  ${(season && episode) ? `
                <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">S${season}</p>
                 <svg width="14px" height="14px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 9.5C13.3807 9.5 14.5 10.6193 14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5Z" fill="#ffffff"></path> </g></svg>
                <p style="text-transform: capitalize; margin: 0; font-size: 14.2px">E${episode}</p>
               ` : ''}
            </div>
        `,
        index: 1,
         click: function () {
                navigate('/');
            },
    },
     ...(season && id ? [{
         html: ` <div style="display: flex; align-items: center; background-color: rgba(255, 255, 255, 0.082); padding: 8px; border-radius: 50%;">
            <svg fill="#ffffff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M4.028,20.882a1,1,0,0,0,1.027-.05l12-8a1,1,0,0,0,0-1.664l-12-8A1,1,0,0,0,3.5,4V20A1,1,0,0,0,4.028,20.882ZM5.5,5.869,14.7,12,5.5,18.131ZM18.5,18V6a1,1,0,0,1,2,0V18a1,1,0,0,1-2,0Z"></path></g></svg>
            </div>`,
             tooltip: `Next Episode`,
             position: 'right',
           
            click: () => {
                // Implement your navigation logic here
                const nextEpisodeId = parseInt(episode) + 1;
                navigate(`/stream/${title.replace(/ /g, "-").toLowerCase()}/${id}/${season}/${nextEpisodeId}`);
                // Assuming you have a function to navigate
                // navigateToNextEpisode(season, nextEpisodeId);
                // console.log(`Navigating to Season ${season}, Episode ${nextEpisodeId}`);
            },
    }] : []),
    
    
],
            // Add custom icons here.
            // You can replace the default icons by providing their SVG or path.
            icons: {
              volumeClose:'<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M10 7.22L6.603 10H3v4h3.603L10 16.78V7.22zM5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm14.525-4l3.536 3.536-1.414 1.414L19 13.414l-3.536 3.536-1.414-1.414L17.586 12 14.05 8.464l1.414-1.414L19 10.586l3.536-3.536 1.414 1.414L20.414 12z"></path> </g> </g></svg>',
              volume:'<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M10 7.22L6.603 10H3v4h3.603L10 16.78V7.22zM5.889 16H2a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h3.889l5.294-4.332a.5.5 0 0 1 .817.387v15.89a.5.5 0 0 1-.817.387L5.89 16zm13.517 4.134l-1.416-1.416A8.978 8.978 0 0 0 21 12a8.982 8.982 0 0 0-3.304-6.968l1.42-1.42A10.976 10.976 0 0 1 23 12c0 3.223-1.386 6.122-3.594 8.134zm-3.543-3.543l-1.422-1.422A3.993 3.993 0 0 0 16 12c0-1.43-.75-2.685-1.88-3.392l1.439-1.439A5.991 5.991 0 0 1 18 12c0 1.842-.83 3.49-2.137 4.591z"></path> </g> </g></svg>',
              fullscreenOff:'<svg width="22px" height="22px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>fullscreen_exit_line</title> <g id="页面-1" stroke-width="0.00024000000000000003" fill="none" fill-rule="evenodd"> <g id="Media" transform="translate(-432.000000, 0.000000)"> <g id="fullscreen_exit_line" transform="translate(432.000000, 0.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M20,7 L17,7 L17,4 C17,3.44772 16.5523,3 16,3 C15.4477,3 15,3.44772 15,4 L15,7 C15,8.10457 15.8954,9 17,9 L20,9 C20.5523,9 21,8.55229 21,8 C21,7.44772 20.5523,7 20,7 Z M7,9 C8.10457,9 9,8.10457 9,7 L9,4 C9,3.44772 8.55229,3 8,3 C7.44772,3 7,3.44772 7,4 L7,7 L4,7 C3.44772,7 3,7.44771 3,8 C3,8.55228 3.44772,9 4,9 L7,9 Z M7,17 L4,17 C3.44772,17 3,16.5523 3,16 C3,15.4477 3.44772,15 4,15 L7,15 C8.10457,15 9,15.8954 9,17 L9,20 C9,20.5523 8.55228,21 8,21 C7.44771,21 7,20.5523 7,20 L7,17 Z M17,15 C15.8954,15 15,15.8954 15,17 L15,20 C15,20.5523 15.4477,21 16,21 C16.5523,21 17,20.5523 17,20 L17,17 L20,17 C20.5523,17 21,16.5523 21,16 C21,15.4477 20.5523,15 20,15 L17,15 Z" id="形状" fill="#ffffff"> </path> </g> </g> </g> </g></svg>',
              fullscreenOn:'<svg width="22px" height="22px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>fullscreen_line</title> <g id="页面-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Media" transform="translate(-480.000000, 0.000000)" fill-rule="nonzero"> <g id="fullscreen_line" transform="translate(480.000000, 0.000000)"> <path d="M24,0 L24,24 L0,24 L0,0 L24,0 Z M12.5934901,23.257841 L12.5819402,23.2595131 L12.5108777,23.2950439 L12.4918791,23.2987469 L12.4918791,23.2987469 L12.4767152,23.2950439 L12.4056548,23.2595131 C12.3958229,23.2563662 12.3870493,23.2590235 12.3821421,23.2649074 L12.3780323,23.275831 L12.360941,23.7031097 L12.3658947,23.7234994 L12.3769048,23.7357139 L12.4804777,23.8096931 L12.4953491,23.8136134 L12.4953491,23.8136134 L12.5071152,23.8096931 L12.6106902,23.7357139 L12.6232938,23.7196733 L12.6232938,23.7196733 L12.6266527,23.7031097 L12.609561,23.275831 C12.6075724,23.2657013 12.6010112,23.2592993 12.5934901,23.257841 L12.5934901,23.257841 Z M12.8583906,23.1452862 L12.8445485,23.1473072 L12.6598443,23.2396597 L12.6498822,23.2499052 L12.6498822,23.2499052 L12.6471943,23.2611114 L12.6650943,23.6906389 L12.6699349,23.7034178 L12.6699349,23.7034178 L12.678386,23.7104931 L12.8793402,23.8032389 C12.8914285,23.8068999 12.9022333,23.8029875 12.9078286,23.7952264 L12.9118235,23.7811639 L12.8776777,23.1665331 C12.8752882,23.1545897 12.8674102,23.1470016 12.8583906,23.1452862 L12.8583906,23.1452862 Z M12.1430473,23.1473072 C12.1332178,23.1423925 12.1221763,23.1452606 12.1156365,23.1525954 L12.1099173,23.1665331 L12.0757714,23.7811639 C12.0751323,23.7926639 12.0828099,23.8018602 12.0926481,23.8045676 L12.108256,23.8032389 L12.3092106,23.7104931 L12.3186497,23.7024347 L12.3186497,23.7024347 L12.3225043,23.6906389 L12.340401,23.2611114 L12.337245,23.2485176 L12.337245,23.2485176 L12.3277531,23.2396597 L12.1430473,23.1473072 Z" id="MingCute" fill-rule="nonzero"> </path> <path d="M4,15 C4.55228,15 5,15.4477 5,16 L5,19 L8,19 C8.55228,19 9,19.4477 9,20 C9,20.5523 8.55228,21 8,21 L5,21 C3.89543,21 3,20.1046 3,19 L3,16 C3,15.4477 3.44772,15 4,15 Z M20,15 C20.51285,15 20.9355092,15.386027 20.9932725,15.8833761 L21,16 L21,19 C21,20.0543909 20.18415,20.9181678 19.1492661,20.9945144 L19,21 L16,21 C15.4477,21 15,20.5523 15,20 C15,19.48715 15.386027,19.0644908 15.8833761,19.0067275 L16,19 L19,19 L19,16 C19,15.4477 19.4477,15 20,15 Z M19,3 C20.0543909,3 20.9181678,3.81587733 20.9945144,4.85073759 L21,5 L21,8 C21,8.55228 20.5523,9 20,9 C19.48715,9 19.0644908,8.61395571 19.0067275,8.11662025 L19,8 L19,5 L16,5 C15.4477,5 15,4.55228 15,4 C15,3.48716857 15.386027,3.06449347 15.8833761,3.0067278 L16,3 L19,3 Z M8,3 C8.55228,3 9,3.44772 9,4 C9,4.51283143 8.61395571,4.93550653 8.11662025,4.9932722 L8,5 L5,5 L5,8 C5,8.55228 4.55228,9 4,9 C3.48716857,9 3.06449347,8.61395571 3.0067278,8.11662025 L3,8 L3,5 C3,3.94563773 3.81587733,3.08183483 4.85073759,3.00548573 L5,3 L8,3 Z" id="形状" fill="#ffffff"> </path> </g> </g> </g> </g></svg>',
            //   setting:'<svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M12 8.25C9.92894 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92894 15.75 12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25ZM9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12Z" fill="#ffffff"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9747 1.25C11.5303 1.24999 11.1592 1.24999 10.8546 1.27077C10.5375 1.29241 10.238 1.33905 9.94761 1.45933C9.27379 1.73844 8.73843 2.27379 8.45932 2.94762C8.31402 3.29842 8.27467 3.66812 8.25964 4.06996C8.24756 4.39299 8.08454 4.66251 7.84395 4.80141C7.60337 4.94031 7.28845 4.94673 7.00266 4.79568C6.64714 4.60777 6.30729 4.45699 5.93083 4.40743C5.20773 4.31223 4.47642 4.50819 3.89779 4.95219C3.64843 5.14353 3.45827 5.3796 3.28099 5.6434C3.11068 5.89681 2.92517 6.21815 2.70294 6.60307L2.67769 6.64681C2.45545 7.03172 2.26993 7.35304 2.13562 7.62723C1.99581 7.91267 1.88644 8.19539 1.84541 8.50701C1.75021 9.23012 1.94617 9.96142 2.39016 10.5401C2.62128 10.8412 2.92173 11.0602 3.26217 11.2741C3.53595 11.4461 3.68788 11.7221 3.68786 12C3.68785 12.2778 3.53592 12.5538 3.26217 12.7258C2.92169 12.9397 2.62121 13.1587 2.39007 13.4599C1.94607 14.0385 1.75012 14.7698 1.84531 15.4929C1.88634 15.8045 1.99571 16.0873 2.13552 16.3727C2.26983 16.6469 2.45535 16.9682 2.67758 17.3531L2.70284 17.3969C2.92507 17.7818 3.11058 18.1031 3.28089 18.3565C3.45817 18.6203 3.64833 18.8564 3.89769 19.0477C4.47632 19.4917 5.20763 19.6877 5.93073 19.5925C6.30717 19.5429 6.647 19.3922 7.0025 19.2043C7.28833 19.0532 7.60329 19.0596 7.8439 19.1986C8.08452 19.3375 8.24756 19.607 8.25964 19.9301C8.27467 20.3319 8.31403 20.7016 8.45932 21.0524C8.73843 21.7262 9.27379 22.2616 9.94761 22.5407C10.238 22.661 10.5375 22.7076 10.8546 22.7292C11.1592 22.75 11.5303 22.75 11.9747 22.75H12.0252C12.4697 22.75 12.8407 22.75 13.1454 22.7292C13.4625 22.7076 13.762 22.661 14.0524 22.5407C14.7262 22.2616 15.2616 21.7262 15.5407 21.0524C15.686 20.7016 15.7253 20.3319 15.7403 19.93C15.7524 19.607 15.9154 19.3375 16.156 19.1985C16.3966 19.0596 16.7116 19.0532 16.9974 19.2042C17.3529 19.3921 17.6927 19.5429 18.0692 19.5924C18.7923 19.6876 19.5236 19.4917 20.1022 19.0477C20.3516 18.8563 20.5417 18.6203 20.719 18.3565C20.8893 18.1031 21.0748 17.7818 21.297 17.3969L21.3223 17.3531C21.5445 16.9682 21.7301 16.6468 21.8644 16.3726C22.0042 16.0872 22.1135 15.8045 22.1546 15.4929C22.2498 14.7697 22.0538 14.0384 21.6098 13.4598C21.3787 13.1586 21.0782 12.9397 20.7378 12.7258C20.464 12.5538 20.3121 12.2778 20.3121 11.9999C20.3121 11.7221 20.464 11.4462 20.7377 11.2742C21.0783 11.0603 21.3788 10.8414 21.6099 10.5401C22.0539 9.96149 22.2499 9.23019 22.1547 8.50708C22.1136 8.19546 22.0043 7.91274 21.8645 7.6273C21.7302 7.35313 21.5447 7.03183 21.3224 6.64695L21.2972 6.60318C21.0749 6.21825 20.8894 5.89688 20.7191 5.64347C20.5418 5.37967 20.3517 5.1436 20.1023 4.95225C19.5237 4.50826 18.7924 4.3123 18.0692 4.4075C17.6928 4.45706 17.353 4.60782 16.9975 4.79572C16.7117 4.94679 16.3967 4.94036 16.1561 4.80144C15.9155 4.66253 15.7524 4.39297 15.7403 4.06991C15.7253 3.66808 15.686 3.2984 15.5407 2.94762C15.2616 2.27379 14.7262 1.73844 14.0524 1.45933C13.762 1.33905 13.4625 1.29241 13.1454 1.27077C12.8407 1.24999 12.4697 1.24999 12.0252 1.25H11.9747ZM10.5216 2.84515C10.5988 2.81319 10.716 2.78372 10.9567 2.76729C11.2042 2.75041 11.5238 2.75 12 2.75C12.4762 2.75 12.7958 2.75041 13.0432 2.76729C13.284 2.78372 13.4012 2.81319 13.4783 2.84515C13.7846 2.97202 14.028 3.21536 14.1548 3.52165C14.1949 3.61826 14.228 3.76887 14.2414 4.12597C14.271 4.91835 14.68 5.68129 15.4061 6.10048C16.1321 6.51968 16.9974 6.4924 17.6984 6.12188C18.0143 5.9549 18.1614 5.90832 18.265 5.89467C18.5937 5.8514 18.9261 5.94047 19.1891 6.14228C19.2554 6.19312 19.3395 6.27989 19.4741 6.48016C19.6125 6.68603 19.7726 6.9626 20.0107 7.375C20.2488 7.78741 20.4083 8.06438 20.5174 8.28713C20.6235 8.50382 20.6566 8.62007 20.6675 8.70287C20.7108 9.03155 20.6217 9.36397 20.4199 9.62698C20.3562 9.70995 20.2424 9.81399 19.9397 10.0041C19.2684 10.426 18.8122 11.1616 18.8121 11.9999C18.8121 12.8383 19.2683 13.574 19.9397 13.9959C20.2423 14.186 20.3561 14.29 20.4198 14.373C20.6216 14.636 20.7107 14.9684 20.6674 15.2971C20.6565 15.3799 20.6234 15.4961 20.5173 15.7128C20.4082 15.9355 20.2487 16.2125 20.0106 16.6249C19.7725 17.0373 19.6124 17.3139 19.474 17.5198C19.3394 17.72 19.2553 17.8068 19.189 17.8576C18.926 18.0595 18.5936 18.1485 18.2649 18.1053C18.1613 18.0916 18.0142 18.045 17.6983 17.8781C16.9973 17.5075 16.132 17.4803 15.4059 17.8995C14.68 18.3187 14.271 19.0816 14.2414 19.874C14.228 20.2311 14.1949 20.3817 14.1548 20.4784C14.028 20.7846 13.7846 21.028 13.4783 21.1549C13.4012 21.1868 13.284 21.2163 13.0432 21.2327C12.7958 21.2496 12.4762 21.25 12 21.25C11.5238 21.25 11.2042 21.2496 10.9567 21.2327C10.716 21.2163 10.5988 21.1868 10.5216 21.1549C10.2154 21.028 9.97201 20.7846 9.84514 20.4784C9.80512 20.3817 9.77195 20.2311 9.75859 19.874C9.72896 19.0817 9.31997 18.3187 8.5939 17.8995C7.86784 17.4803 7.00262 17.5076 6.30158 17.8781C5.98565 18.0451 5.83863 18.0917 5.73495 18.1053C5.40626 18.1486 5.07385 18.0595 4.81084 17.8577C4.74458 17.8069 4.66045 17.7201 4.52586 17.5198C4.38751 17.314 4.22736 17.0374 3.98926 16.625C3.75115 16.2126 3.59171 15.9356 3.4826 15.7129C3.37646 15.4962 3.34338 15.3799 3.33248 15.2971C3.28921 14.9684 3.37828 14.636 3.5801 14.373C3.64376 14.2901 3.75761 14.186 4.0602 13.9959C4.73158 13.5741 5.18782 12.8384 5.18786 12.0001C5.18791 11.1616 4.73165 10.4259 4.06021 10.004C3.75769 9.81389 3.64385 9.70987 3.58019 9.62691C3.37838 9.3639 3.28931 9.03149 3.33258 8.7028C3.34348 8.62001 3.37656 8.50375 3.4827 8.28707C3.59181 8.06431 3.75125 7.78734 3.98935 7.37493C4.22746 6.96253 4.3876 6.68596 4.52596 6.48009C4.66055 6.27983 4.74468 6.19305 4.81093 6.14222C5.07395 5.9404 5.40636 5.85133 5.73504 5.8946C5.83873 5.90825 5.98576 5.95483 6.30173 6.12184C7.00273 6.49235 7.86791 6.51962 8.59394 6.10045C9.31998 5.68128 9.72896 4.91837 9.75859 4.12602C9.77195 3.76889 9.80512 3.61827 9.84514 3.52165C9.97201 3.21536 10.2154 2.97202 10.5216 2.84515Z" fill="#ffffff"></path> </g></svg>',
              play:'<svg width="28px" height="28px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M16.394 12L10 7.737v8.526L16.394 12zm2.982.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z"></path> </g> </g></svg>',
              pip:'<svg width="22px" height="22px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path fill-rule="nonzero" d="M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-1 2h-6v4h6v-4z"></path> </g> </g></svg>',
              pause:'<svg width="28px" height="28px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M15 7a1 1 0 0 1 2 0v10a1 1 0 1 1-2 0V7zM7 7a1 1 0 1 1 2 0v10a1 1 0 1 1-2 0V7z"></path> </g> </g></svg>',
              state:'<svg width="70px" height="70px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path fill="none" d="M0 0h24v24H0z"></path> <path d="M16.394 12L10 7.737v8.526L16.394 12zm2.982.416L8.777 19.482A.5.5 0 0 1 8 19.066V4.934a.5.5 0 0 1 .777-.416l10.599 7.066a.5.5 0 0 1 0 .832z"></path> </g> </g></svg>',
            //   loading: '<img src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDg3eDJyZnUwbzdwbmE1ZDlvaHY4eW9tNW5wZHFocTZjcXYyNWgwOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/QRmJC704DProuxlMkG/giphy.gif">',
             indicator: '<svg fill="#ffffff" height="15px" width="15px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" transform="rotate(0)matrix(-1, 0, 0, 1, 0, 0)" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M140.282,108.31c-6.197,0-11.206,5.009-11.206,11.206c0,6.186,5.009,11.206,11.206,11.206 c6.186,0,11.206-5.02,11.206-11.206C151.489,113.32,146.468,108.31,140.282,108.31z"></path> </g> </g> <g> <g> <path d="M405.886,238.72H279.601c-6.186,0-11.206,5.02-11.206,11.206c0,6.186,5.021,11.206,11.206,11.206h115.045 c-0.997,36.365-30.896,65.636-67.496,65.636h-72.214c-17.975,0-33.025-14.277-33.541-31.826 c-0.19-6.175-5.334-11.038-11.543-10.859c-6.186,0.179-11.05,5.345-10.859,11.531c0.874,29.54,25.965,53.567,55.943,53.567h72.214 c49.589,0,89.943-40.343,89.943-89.932v-9.324C417.093,243.74,412.072,238.72,405.886,238.72z"></path> </g> </g> <g> <g> <path d="M495.302,163.211c-10.153-3.452-20.934-0.202-27.478,8.293l-17.729,22.996h-228.69v-58.643 c0-36.455-27.03-66.701-62.095-71.788c3.676-6.533,10.657-10.96,18.659-10.96c6.197,0,11.206-5.009,11.206-11.206 c0-6.186-5.009-11.206-11.206-11.206c-12.932,0-24.565,5.637-32.6,14.568c-8.024-8.932-19.656-14.568-32.588-14.568 c-6.197,0-11.206,5.02-11.206,11.206c0,6.197,5.009,11.206,11.206,11.206c7.968,0,14.927,4.404,18.603,10.893 c-25.898,3.586-47.459,20.878-57.108,44.299H34.65c-9.257,0-17.964,3.608-24.52,10.164C3.597,125.008,0,133.715,0,142.961 c0,19.107,15.543,34.65,34.65,34.65h47.448c7.553,10.702,17.919,19.275,30.022,24.632c0,0,0.011,65.121,0.067,66.488 c1.065,36.141,16.205,69.928,42.618,95.131c25.999,24.8,60.033,38.461,95.838,38.461h17.751v56.57H248.57 c-6.197,0-11.206,5.02-11.206,11.206c0,6.186,5.009,11.206,11.206,11.206h31.031c6.197,0,11.206-5.021,11.206-11.206v-67.777 h40.579v56.57h-19.824c-6.197,0-11.206,5.02-11.206,11.206c0,6.186,5.009,11.206,11.206,11.206h31.031 c6.197,0,11.206-5.021,11.206-11.206v-68.673C442.52,392.461,512,317.344,512,226.292v-39.749 C512,175.829,505.444,166.662,495.302,163.211z M34.65,155.198c-6.746,0-12.237-5.491-12.237-12.237 c0-3.272,1.278-6.354,3.575-8.663c2.32-2.309,5.39-3.586,8.663-3.586h34.37c-0.112,1.703-0.202,3.418-0.202,5.144 c0,6.701,0.93,13.179,2.645,19.342H34.65z M489.587,226.292c0,84.71-68.908,153.618-153.607,153.618h-85.337 c-30.022,0-58.565-11.453-80.373-32.252c-22.11-21.113-34.785-49.376-35.681-79.633c-0.045-1.143-0.056-59.932-0.056-59.932 c2.264,0.213,4.539,0.325,6.847,0.325c6.197,0,11.206-5.009,11.206-11.206c0-6.186-5.009-11.206-11.206-11.206 c-27.646,0-50.149-22.491-50.149-50.149c0-27.646,22.503-50.149,50.149-50.149h7.464c27.646,0,50.149,22.503,50.149,50.149v69.85 c0,6.197,5.009,11.206,11.206,11.206h245.399c3.485,0,6.757-1.614,8.875-4.359l21.102-27.377c0.269-0.347,0.975-1.266,2.499-0.751 c1.513,0.516,1.513,1.681,1.513,2.118V226.292z"></path> </g> </g> <g> <g> <path d="M140.282,108.31c-6.197,0-11.206,5.009-11.206,11.206c0,6.186,5.009,11.206,11.206,11.206 c6.186,0,11.206-5.02,11.206-11.206C151.489,113.32,146.468,108.31,140.282,108.31z"></path> </g> </g> <g id="SVGCleanerId_1"> <g> <path d="M405.886,238.72H279.601c-6.186,0-11.206,5.02-11.206,11.206c0,6.186,5.021,11.206,11.206,11.206h115.045 c-0.997,36.365-30.896,65.636-67.496,65.636h-72.214c-17.975,0-33.025-14.277-33.541-31.826 c-0.19-6.175-5.334-11.038-11.543-10.859c-6.186,0.179-11.05,5.345-10.859,11.531c0.874,29.54,25.965,53.567,55.943,53.567h72.214 c49.589,0,89.943-40.343,89.943-89.932v-9.324C417.093,243.74,412.072,238.72,405.886,238.72z"></path> </g> </g> <g> <g> <path d="M405.886,238.72H279.601c-6.186,0-11.206,5.02-11.206,11.206c0,6.186,5.021,11.206,11.206,11.206h115.045 c-0.997,36.365-30.896,65.636-67.496,65.636h-72.214c-17.975,0-33.025-14.277-33.541-31.826 c-0.19-6.175-5.334-11.038-11.543-10.859c-6.186,0.179-11.05,5.345-10.859,11.531c0.874,29.54,25.965,53.567,55.943,53.567h72.214 c49.589,0,89.943-40.343,89.943-89.932v-9.324C417.093,243.74,412.072,238.72,405.886,238.72z"></path> </g> </g> <g> <g> <path d="M140.282,108.31c-6.197,0-11.206,5.009-11.206,11.206c0,6.186,5.009,11.206,11.206,11.206 c6.186,0,11.206-5.02,11.206-11.206C151.489,113.32,146.468,108.31,140.282,108.31z"></path> </g> </g> </g></svg>',
             setting:'<svg fill="#ffffff" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M12,16a4,4,0,1,0-4-4A4,4,0,0,0,12,16Zm0-6a2,2,0,1,1-2,2A2,2,0,0,1,12,10ZM3.5,12.877l-1,.579a2,2,0,0,0-.733,2.732l1.489,2.578A2,2,0,0,0,5.99,19.5L7,18.916a1.006,1.006,0,0,1,1.008.011.992.992,0,0,1,.495.857V21a2,2,0,0,0,2,2h3a2,2,0,0,0,2-2V19.782a1.009,1.009,0,0,1,1.5-.866l1.009.582a2,2,0,0,0,2.732-.732l1.488-2.578a2,2,0,0,0-.733-2.732l-1-.579a1.007,1.007,0,0,1-.5-.89,1,1,0,0,1,.5-.864l1-.579a2,2,0,0,0,.733-2.732L20.742,5.234A2,2,0,0,0,18.01,4.5L17,5.083a1.008,1.008,0,0,1-1.5-.867V3a2,2,0,0,0-2-2h-3a2,2,0,0,0-2,2V4.294a.854.854,0,0,1-.428.74l-.154.089a.864.864,0,0,1-.854,0L5.99,4.5a2,2,0,0,0-2.733.732L1.769,7.813A2,2,0,0,0,2.5,10.544l1,.578a1.011,1.011,0,0,1,.5.891A.994.994,0,0,1,3.5,12.877Zm1-3.487-1-.578L4.99,6.234l1.074.62a2.86,2.86,0,0,0,2.85,0l.154-.088A2.863,2.863,0,0,0,10.5,4.294V3h3V4.216a3.008,3.008,0,0,0,4.5,2.6l1.007-.582L20.5,8.812l-1,.578a3.024,3.024,0,0,0,0,5.219l1,.579h0l-1.488,2.578L18,17.184a3.008,3.008,0,0,0-4.5,2.6V21h-3V19.784a3.006,3.006,0,0,0-4.5-2.6l-1.007.582L3.5,15.188l1-.579a3.024,3.024,0,0,0,0-5.219Z"></path></g></svg>',

 

            },
        });
   
        // Subtitles setup
        // (async () => {
        //     if (subtitles?.length > 0) {
        //         const first = subtitles[0];
        //         const vttUrl =
        //             first.type === "srt" ? await srtToVtt(first.url) : first.url;

        //         art.subtitle.switch(vttUrl, {
        //             name: first.lang.toUpperCase(),
        //             type: "vtt",
        //         });
        //     }
        // })();

        art.on("ready", async () => {
            const lastPosition = localStorage.getItem(lastPositionKey);
            if (lastPosition) {
                art.currentTime  = parseFloat(lastPosition);
            }  

        });

        art.on("destroy", () => {
            // localStorage.setItem(lastPositionKey, art.currentTime.toFixed(2));
            if (hlsRef.current) {
            
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        });

       const debouncedSavePosition = debounce((time) => {
        localStorage.setItem(lastPositionKey, time.toFixed(2));
       }, 1500); // Saves position every 1.5 seconds

        art.on("timeupdate", () => {
        debouncedSavePosition(art.currentTime);
        });

        art.on("pause", () => {
            localStorage.setItem(lastPositionKey, art.currentTime.toFixed(2));
        });

        
        

         
        playerRef.current = art;

        return () => {
            if (art && !art.destroyed) {
                art.destroy(false);
                playerRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={artRef}
            className="artplayercontainer"
            style={{ aspectRatio: "16/9" }}
        />
    );
}