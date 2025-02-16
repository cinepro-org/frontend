import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

const VideoPlayer = ({ m3u8Url }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(m3u8Url);
        hls.attachMedia(videoRef.current);
        return () => {
          hls.destroy();
        };
      } else if (
        videoRef.current.canPlayType("application/vnd.apple.mpegurl")
      ) {
        videoRef.current.src = m3u8Url;
      }
    }
  }, [m3u8Url]);

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        style={{ backgroundColor: "black" }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
