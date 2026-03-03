"use client";

import { useRef, useState, useEffect } from "react";

/**
 * SovereignPlayer — Ad-free HTML5 video player shell
 * Zero third-party scripts. Supports HLS via hls.js.
 * Features: custom controls, PiP, fullscreen.
 */
export default function SovereignPlayer({
    src,
    posterUrl,
    isAudioOnly = false,
    children,
}) {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const hideTimer = useRef(null);

    // Setup HLS if the src is an HLS manifest
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !src) return;

        if (src.endsWith(".m3u8")) {
            import("hls.js").then(({ default: Hls }) => {
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                }
            });
        } else {
            video.src = src;
        }
    }, [src]);

    function togglePlay() {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }

    function toggleMute() {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }

    function handleVolumeChange(e) {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setIsMuted(val === 0);
        }
    }

    function handleTimeUpdate() {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        setProgress((video.currentTime / video.duration) * 100);
        setDuration(video.duration);
    }

    function handleSeek(e) {
        const video = videoRef.current;
        if (!video || !video.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        video.currentTime = pct * video.duration;
    }

    function toggleFullscreen() {
        const container = videoRef.current?.parentElement?.parentElement;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }

    async function togglePiP() {
        const video = videoRef.current;
        if (!video) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (err) {
            console.log("PiP not supported:", err);
        }
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    function handleMouseMove() {
        setShowControls(true);
        clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    }

    return (
        <div
            className={`sovereign-player ${isAudioOnly ? "audio-only" : ""}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* Video Element */}
            <video
                ref={videoRef}
                className="player-video"
                poster={posterUrl}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlay}
                playsInline
            />

            {/* Audio-Only Visual */}
            {isAudioOnly && (
                <div className="audio-visual">
                    <div className="audio-icon">☦</div>
                    <div className="waveform">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="waveform-bar" />
                        ))}
                    </div>
                    <p className="audio-label">Audio-Only Mode</p>
                </div>
            )}

            {/* Sync Overlay children (bilingual text) */}
            {children}

            {/* Custom Controls */}
            <div className={`player-controls ${showControls ? "visible" : ""}`}>
                <button className="player-btn" onClick={togglePlay} title={isPlaying ? "Pause" : "Play"}>
                    {isPlaying ? "⏸" : "▶"}
                </button>

                <div className="player-progress" onClick={handleSeek}>
                    <div className="player-progress-fill" style={{ width: `${progress}%` }} />
                </div>

                <span className="player-time">
                    {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                </span>

                <button className="player-btn" onClick={toggleMute} title={isMuted ? "Unmute" : "Mute"}>
                    {isMuted ? "🔇" : "🔊"}
                </button>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="player-volume"
                />

                <button className="player-btn" onClick={togglePiP} title="Picture-in-Picture">
                    📌
                </button>

                <button className="player-btn" onClick={toggleFullscreen} title="Fullscreen">
                    {isFullscreen ? "⬜" : "⛶"}
                </button>
            </div>

            {/* No-play overlay */}
            {!isPlaying && !src && (
                <div className="player-placeholder">
                    <div className="player-placeholder-icon">☦</div>
                    <p>Select a stream from the Global Map</p>
                </div>
            )}

            <style jsx>{`
        .sovereign-player {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: var(--color-deep-navy);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-subtle);
          box-shadow: var(--shadow-lg);
        }
        .sovereign-player.audio-only {
          aspect-ratio: auto;
          min-height: 300px;
        }
        .player-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .audio-only .player-video {
          display: none;
        }
        .audio-visual {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: radial-gradient(ellipse at center, rgba(212, 168, 83, 0.05) 0%, var(--color-deep-navy) 70%);
        }
        .audio-icon {
          font-size: 64px;
          animation: iconGlow 3s ease-in-out infinite;
        }
        .audio-label {
          font-size: var(--text-sm);
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .player-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
          opacity: 0;
          transition: opacity var(--duration-normal) var(--ease-out);
        }
        .player-controls.visible {
          opacity: 1;
        }
        .player-btn {
          font-size: 20px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0.85;
          transition: opacity var(--duration-fast);
          background: none;
          border: none;
          color: white;
          border-radius: var(--radius-md);
          flex-shrink: 0;
        }
        .player-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.08);
        }
        .player-btn:active {
          transform: scale(0.92);
        }
        .player-progress {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          min-height: 24px;
          display: flex;
          align-items: center;
        }
        .player-progress:hover {
          height: 8px;
        }
        .player-progress-fill {
          height: 6px;
          background: var(--color-gold);
          border-radius: 3px;
          transition: width 0.1s linear;
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        .player-time {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-variant-numeric: tabular-nums;
          min-width: 80px;
        }
        .player-volume {
          width: 70px;
          height: 6px;
          accent-color: var(--color-gold);
        }
        .player-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-muted);
        }
        .player-placeholder-icon {
          font-size: 56px;
          opacity: 0.3;
        }
        @media (max-width: 768px) {
          .player-controls {
            gap: 6px;
            padding: 10px 12px;
            flex-wrap: wrap;
          }
          .player-btn {
            font-size: 22px;
          }
          .player-volume {
            display: none;
          }
          .player-time {
            font-size: 11px;
            min-width: 60px;
          }
        }
        @media (max-width: 480px) {
          .sovereign-player {
            border-radius: var(--radius-lg);
          }
        }
      `}</style>
        </div>
    );
}
