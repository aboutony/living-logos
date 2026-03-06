"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import SubtitleOverlay from "./SubtitleOverlay";
import useAudioStreamCapture from "../hooks/useAudioStreamCapture";
import useUserInteraction from "../hooks/useUserInteraction";

/**
 * YouTubePlayerMode — In-platform YouTube channel viewer.
 * Directive 012: Auto-enables subtitles on first interaction.
 */
function YouTubePlayerMode({
  youtubeChannel, streamId, subtitlesEnabled, setSubtitlesEnabled,
  autoSubtitles, streamTier, hasInteracted
}) {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!youtubeChannel?.handle) return;
    setLoading(true);
    fetch(`/api/youtube/feed?handle=${encodeURIComponent(youtubeChannel.handle)}&channelId=${encodeURIComponent(youtubeChannel.channelId || '')}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.videos && data.videos.length > 0) {
          setVideos(data.videos);
          setActiveVideo(data.videos[0]);
        } else {
          setError("No videos found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [youtubeChannel?.handle]);

  if (loading) {
    return (
      <div className="youtube-embed-wrap">
        <div className="youtube-loading">
          <div className="youtube-loading-icon">☦</div>
          <p>Loading {youtubeChannel.name} feed…</p>
        </div>
      </div>
    );
  }

  if (error || !activeVideo) {
    return (
      <div className="youtube-embed-wrap">
        <div className="youtube-loading">
          <div className="youtube-loading-icon">⚠</div>
          <p>Could not load channel feed</p>
          <p style={{ fontSize: "12px", opacity: 0.5 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-embed-wrap">
      <div className="youtube-iframe-container">
        <iframe
          key={activeVideo.videoId}
          className="youtube-iframe"
          src={`${activeVideo.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
          title={activeVideo.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          frameBorder="0"
        />
        {/* Subtitle Overlay — YouTube mode */}
        {/* Directive 017: key forces remount on video change (multi-video purge) */}
        {/* Directive 018: isPlaying tied to video state */}
        <SubtitleOverlay
          key={`yt-sub-${activeVideo?.videoId}`}
          streamId={streamId || "stream-rumorthodox"}
          enabled={subtitlesEnabled}
          onClose={() => setSubtitlesEnabled(false)}
          autoEnable={autoSubtitles}
          streamTier={streamTier}
          mediaStream={null}
          captureError={null}
          onStartCapture={() => { }}
          isYouTubeMode={true}
          hasInteracted={hasInteracted}
          isPlaying={true}
        />
      </div>

      {/* Now-Playing Bar */}
      <div className="youtube-now-playing">
        <div className="youtube-now-info">
          <span className="youtube-now-title">{activeVideo.title}</span>
          <span className="youtube-now-meta">
            {activeVideo.views?.toLocaleString() || 0} views · {youtubeChannel.name}
          </span>
        </div>
      </div>

      {/* Video Gallery */}
      {videos.length > 1 && (
        <div className="youtube-gallery">
          <div className="youtube-gallery-scroll">
            {videos.map((v) => (
              <button
                key={v.videoId}
                className={`youtube-gallery-item ${v.videoId === activeVideo.videoId ? "active" : ""}`}
                onClick={() => setActiveVideo(v)}
              >
                <img src={v.thumbnail} alt={v.title} className="youtube-gallery-thumb" />
                {v.videoId === activeVideo.videoId && (
                  <div className="youtube-gallery-playing">▶ Playing</div>
                )}
                <span className="youtube-gallery-title">{v.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SovereignPlayer — Directives 011, 012 & 017
 *
 * Directive 011: Internal audio buffer capture via Web Audio API
 * Directive 012: Zero-click activation — auto-enables subtitles on first gesture
 *               "Tap to Unmute Sanctuary" gold button if browser blocks audio
 * Directive 017: Multi-video purge — clearSubtitles() on src/video change
 */
export default function SovereignPlayer({
  src,
  posterUrl,
  isAudioOnly = false,
  streamId,
  autoSubtitles = false,
  streamTier,
  youtubeChannel,
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
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(autoSubtitles);
  // Directive 017: Key used to force-remount SubtitleOverlay on video change
  const [subtitleKey, setSubtitleKey] = useState(0);
  const hideTimer = useRef(null);

  // ─── Directive 012: Global Interaction Listener ───
  const { hasInteracted } = useUserInteraction();

  // ─── Directive 011: Internal Audio Capture ───
  const {
    captureStream,
    isCapturing,
    error: captureError,
    needsInteraction,
    startCapture,
    stopCapture,
  } = useAudioStreamCapture(videoRef, hasInteracted);

  // ─── Directive 012: Auto-enable subtitles once user interacts ───
  useEffect(() => {
    if (hasInteracted && autoSubtitles && !subtitlesEnabled) {
      setSubtitlesEnabled(true);
    }
  }, [hasInteracted, autoSubtitles]);

  // Setup HLS
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

  // ─── Directive 017: Multi-Video Purge ───
  // Clear subtitles whenever the video source changes
  useEffect(() => {
    // Increment key to force-remount SubtitleOverlay, flushing all state
    setSubtitleKey((k) => k + 1);
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

  // Handle "Tap to Unmute Sanctuary" — satisfies browser gesture requirement
  function handleUnmuteSanctuary() {
    startCapture();
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().catch(() => { });
    }
  }

  return (
    <div
      className={`sovereign-player ${isAudioOnly ? "audio-only" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* YouTube In-Platform Player */}
      {youtubeChannel ? (
        <YouTubePlayerMode
          youtubeChannel={youtubeChannel}
          streamId={streamId}
          subtitlesEnabled={subtitlesEnabled}
          setSubtitlesEnabled={setSubtitlesEnabled}
          autoSubtitles={autoSubtitles}
          streamTier={streamTier}
          hasInteracted={hasInteracted}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            className="player-video"
            poster={posterUrl}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onClick={togglePlay}
            playsInline
            crossOrigin="anonymous"
          />

          {isAudioOnly && (
            <div className="audio-visual">
              <div className="audio-icon">☦</div>
              <div className="waveform">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="waveform-bar" />
                ))}
              </div>
              <p className="audio-label">Audio-Only Mode</p>
              {subtitlesEnabled && (
                <p className="audio-subtitle-active">📡 Subtitles Active — Internal Stream</p>
              )}
            </div>
          )}

          {/* Directive 012: "Tap to Unmute Sanctuary" — gold center button */}
          {needsInteraction && !hasInteracted && (
            <div className="unmute-sanctuary-overlay">
              <button className="unmute-sanctuary-btn" onClick={handleUnmuteSanctuary}>
                <span className="unmute-sanctuary-icon">☦</span>
                <span className="unmute-sanctuary-text">Tap to Unmute Sanctuary</span>
              </button>
            </div>
          )}
        </>
      )}

      {children}

      {/* Patristic AI Subtitle Overlay — Directives 011+012+017+018 */}
      {!youtubeChannel && (
        <SubtitleOverlay
          key={`sub-${subtitleKey}`}
          streamId={streamId || "stream-phanar-001"}
          enabled={subtitlesEnabled}
          onClose={() => setSubtitlesEnabled(false)}
          autoEnable={autoSubtitles}
          streamTier={streamTier}
          mediaStream={captureStream}
          captureError={captureError}
          onStartCapture={startCapture}
          isYouTubeMode={false}
          hasInteracted={hasInteracted}
          isPlaying={isPlaying}
        />
      )}

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
          type="range" min="0" max="1" step="0.05"
          value={volume} onChange={handleVolumeChange}
          className="player-volume"
        />

        <button className="player-btn" onClick={togglePiP} title="Picture-in-Picture">
          📌
        </button>

        <button
          className={`player-btn ${subtitlesEnabled ? "player-btn--active" : ""}`}
          onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
          title={subtitlesEnabled ? "Hide Subtitles" : "Patristic AI Subtitles"}
        >
          CC
        </button>

        {subtitlesEnabled && (
          <span className="player-capture-status" title="Internal audio — no microphone">
            📡
          </span>
        )}

        <button className="player-btn" onClick={toggleFullscreen} title="Fullscreen">
          {isFullscreen ? "⬜" : "⛶"}
        </button>
      </div>

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
        .audio-subtitle-active {
          font-size: 11px;
          color: var(--color-gold);
          opacity: 0.8;
          animation: subtitlePulse 2s ease-in-out infinite;
        }
        @keyframes subtitlePulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        /* ── Directive 012: Tap to Unmute Sanctuary ── */
        .unmute-sanctuary-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.6);
          z-index: 50;
          backdrop-filter: blur(4px);
        }
        .unmute-sanctuary-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px 40px;
          background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dim, #b8963a) 100%);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-xl, 16px);
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 32px rgba(212, 168, 83, 0.4);
          animation: sanctuaryPulse 2s ease-in-out infinite;
        }
        .unmute-sanctuary-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 48px rgba(212, 168, 83, 0.6);
        }
        .unmute-sanctuary-btn:active {
          transform: scale(0.98);
        }
        .unmute-sanctuary-icon {
          font-size: 48px;
          color: var(--color-deep-navy, #0a1628);
        }
        .unmute-sanctuary-text {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-deep-navy, #0a1628);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        @keyframes sanctuaryPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(212, 168, 83, 0.4); }
          50% { box-shadow: 0 8px 48px rgba(212, 168, 83, 0.7); }
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
        .player-btn--active {
          color: var(--color-gold);
          opacity: 1;
        }
        .player-capture-status {
          font-size: 14px;
          display: flex;
          align-items: center;
          opacity: 0.7;
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
          .unmute-sanctuary-btn {
            padding: 20px 28px;
          }
          .unmute-sanctuary-icon {
            font-size: 36px;
          }
          .unmute-sanctuary-text {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
