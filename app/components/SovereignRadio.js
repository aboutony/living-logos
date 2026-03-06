"use client";

import { useRef, useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";

/**
 * SovereignRadio — Directive 022: The Sovereign Radio Bridge
 *
 * Live Icecast/Shoutcast audio player with:
 *   - HTML5 <audio> for MP3/AAC streams
 *   - Media Session API for background play & lock-screen controls
 *   - Animated waveform visualization
 *   - Now Playing metadata display
 *   - play()/pause() exposed via ref for unified controls
 */
const SovereignRadio = forwardRef(function SovereignRadio(
    { radioUrl, nowPlaying, onPlay, onPause, streamName },
    ref
) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState(null);
    const [showVolume, setShowVolume] = useState(false);

    // ── Expose play/pause to parent via ref ──
    useImperativeHandle(ref, () => ({
        play: () => {
            audioRef.current?.play().catch(() => { });
        },
        pause: () => {
            audioRef.current?.pause();
        },
        get isPlaying() {
            return isPlaying;
        },
    }));

    // ── Load audio source ──
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !radioUrl) return;
        audio.src = radioUrl;
        audio.volume = volume;
        setError(null);
    }, [radioUrl]);

    // ── Media Session API — background play + lock-screen controls ──
    useEffect(() => {
        if (!("mediaSession" in navigator)) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: nowPlaying?.title || "Sovereign Radio",
            artist: nowPlaying?.artist || streamName || "The Living Logos",
            album: "The Living Logos Network",
            artwork: [
                {
                    src: "/icons/icon-192.png",
                    sizes: "192x192",
                    type: "image/png",
                },
            ],
        });

        navigator.mediaSession.setActionHandler("play", () => {
            audioRef.current?.play();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            audioRef.current?.pause();
        });

        return () => {
            navigator.mediaSession.setActionHandler("play", null);
            navigator.mediaSession.setActionHandler("pause", null);
        };
    }, [nowPlaying, streamName]);

    // ── Event Handlers ──
    const handlePlay = useCallback(() => {
        setIsPlaying(true);
        setIsBuffering(false);
        onPlay?.();
    }, [onPlay]);

    const handlePause = useCallback(() => {
        setIsPlaying(false);
        onPause?.();
    }, [onPause]);

    const handleWaiting = useCallback(() => {
        setIsBuffering(true);
    }, []);

    const handleCanPlay = useCallback(() => {
        setIsBuffering(false);
    }, []);

    const handleError = useCallback(() => {
        setError("Unable to connect to radio stream");
        setIsPlaying(false);
        setIsBuffering(false);
    }, []);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            audio.play().catch(() => setError("Playback blocked — tap to retry"));
        } else {
            audio.pause();
        }
    }, []);

    const toggleMute = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.muted = !audio.muted;
        setIsMuted(audio.muted);
    }, []);

    const handleVolumeChange = useCallback((e) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (audioRef.current) {
            audioRef.current.volume = val;
            setIsMuted(val === 0);
        }
    }, []);

    const title = nowPlaying?.title || "Awaiting stream…";
    const artist = nowPlaying?.artist || streamName || "The Living Logos";

    return (
        <div className="sovereign-radio">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                preload="none"
                onPlay={handlePlay}
                onPause={handlePause}
                onWaiting={handleWaiting}
                onCanPlay={handleCanPlay}
                onError={handleError}
            />

            {/* ── Radio Visual ── */}
            <div className="radio-visual">
                <div className="radio-icon-wrap">
                    <span className={`radio-icon ${isPlaying ? "playing" : ""}`}>📻</span>
                    {isBuffering && <div className="radio-buffering-ring" />}
                </div>

                {/* Waveform */}
                <div className={`radio-waveform ${isPlaying ? "active" : ""}`}>
                    {[...Array(16)].map((_, i) => (
                        <div
                            key={i}
                            className="radio-wave-bar"
                            style={{ animationDelay: `${i * 0.08}s` }}
                        />
                    ))}
                </div>

                <p className="radio-mode-label">
                    {isBuffering ? "Connecting…" : isPlaying ? "LIVE RADIO" : "Radio Standby"}
                </p>
            </div>

            {/* ── Now Playing ── */}
            <div className="radio-now-playing">
                <div className="radio-now-badge">
                    <span className={`radio-live-dot ${isPlaying ? "active" : ""}`} />
                    <span>NOW PLAYING</span>
                </div>
                <div className="radio-now-info">
                    <span className="radio-now-title">{title}</span>
                    <span className="radio-now-artist">{artist}</span>
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="radio-controls">
                <button
                    className="radio-play-btn"
                    onClick={togglePlay}
                    title={isPlaying ? "Pause Radio" : "Play Radio"}
                    aria-label={isPlaying ? "Pause Radio" : "Play Radio"}
                >
                    {isPlaying ? "⏸" : "▶"}
                </button>

                <div
                    className="radio-volume-wrap"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                >
                    <button
                        className="radio-vol-btn"
                        onClick={toggleMute}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
                    </button>
                    {showVolume && (
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="radio-volume-slider"
                        />
                    )}
                </div>
            </div>

            {/* ── Error State ── */}
            {error && (
                <div className="radio-error">
                    <span>⚠ {error}</span>
                    <button className="radio-retry-btn" onClick={togglePlay}>
                        Retry
                    </button>
                </div>
            )}

            {/* ── Background Play Notice ── */}
            {isPlaying && (
                <div className="radio-bg-notice">
                    🔒 Radio continues when you minimize or lock your screen
                </div>
            )}

            <style jsx>{`
        .sovereign-radio {
          width: 100%;
          min-height: 300px;
          background: radial-gradient(
            ellipse at center,
            rgba(212, 168, 83, 0.04) 0%,
            var(--color-deep-navy, #0a1628) 70%
          );
          border-radius: var(--radius-xl, 16px);
          border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
          box-shadow: var(--shadow-lg, 0 8px 32px rgba(0, 0, 0, 0.3));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 32px 24px;
          position: relative;
          overflow: hidden;
        }

        /* ── Radio Visual ── */
        .radio-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .radio-icon-wrap {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .radio-icon {
          font-size: 56px;
          transition: transform 0.3s ease;
        }
        .radio-icon.playing {
          animation: radioGlow 2s ease-in-out infinite;
        }
        @keyframes radioGlow {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.08); filter: brightness(1.2); }
        }
        .radio-buffering-ring {
          position: absolute;
          inset: -4px;
          border: 2px solid transparent;
          border-top-color: var(--color-gold, #d4a853);
          border-radius: 50%;
          animation: bufferSpin 1s linear infinite;
        }
        @keyframes bufferSpin {
          to { transform: rotate(360deg); }
        }

        /* ── Waveform ── */
        .radio-waveform {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 40px;
        }
        .radio-wave-bar {
          width: 3px;
          height: 8px;
          background: var(--color-gold, #d4a853);
          border-radius: 2px;
          opacity: 0.3;
          transition: opacity 0.3s;
        }
        .radio-waveform.active .radio-wave-bar {
          opacity: 1;
          animation: waveAnim 1.2s ease-in-out infinite alternate;
        }
        @keyframes waveAnim {
          0% { height: 6px; }
          100% { height: 36px; }
        }

        .radio-mode-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-muted, rgba(255, 255, 255, 0.5));
          font-weight: 600;
        }

        /* ── Now Playing ── */
        .radio-now-playing {
          width: 100%;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(212, 168, 83, 0.15);
          border-radius: var(--radius-lg, 12px);
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .radio-now-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-gold, #d4a853);
        }
        .radio-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-muted, #666);
          transition: background 0.3s;
        }
        .radio-live-dot.active {
          background: #ef4444;
          animation: dotPulse 1.5s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .radio-now-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }
        .radio-now-title {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary, #fff);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .radio-now-artist {
          font-size: 13px;
          color: var(--text-secondary, rgba(255, 255, 255, 0.6));
        }

        /* ── Controls ── */
        .radio-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .radio-play-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: linear-gradient(
            135deg,
            var(--color-gold, #d4a853) 0%,
            var(--color-gold-dim, #b8963a) 100%
          );
          border: 2px solid rgba(255, 255, 255, 0.15);
          color: var(--color-deep-navy, #0a1628);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(212, 168, 83, 0.3);
        }
        .radio-play-btn:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 28px rgba(212, 168, 83, 0.5);
        }
        .radio-play-btn:active {
          transform: scale(0.96);
        }

        .radio-volume-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .radio-vol-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          background: none;
          border: none;
          color: var(--text-primary, #fff);
          cursor: pointer;
          opacity: 0.7;
          transition: opacity 0.2s;
          border-radius: var(--radius-md, 8px);
        }
        .radio-vol-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.06);
        }
        .radio-volume-slider {
          width: 80px;
          height: 4px;
          accent-color: var(--color-gold, #d4a853);
        }

        /* ── Error ── */
        .radio-error {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md, 8px);
          font-size: 13px;
          color: #fca5a5;
        }
        .radio-retry-btn {
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 600;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 6px;
          color: #fca5a5;
          cursor: pointer;
          transition: background 0.2s;
        }
        .radio-retry-btn:hover {
          background: rgba(239, 68, 68, 0.3);
        }

        /* ── Background notice ── */
        .radio-bg-notice {
          font-size: 11px;
          color: var(--text-muted, rgba(255, 255, 255, 0.4));
          text-align: center;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: var(--radius-md, 8px);
        }

        @media (max-width: 480px) {
          .sovereign-radio {
            padding: 24px 16px;
            min-height: 260px;
            border-radius: var(--radius-lg, 12px);
          }
          .radio-play-btn {
            width: 56px;
            height: 56px;
            font-size: 24px;
          }
          .radio-now-playing {
            padding: 12px 14px;
          }
        }
      `}</style>
        </div>
    );
});

export default SovereignRadio;
