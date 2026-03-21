"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SovereignPlayer from "../components/SovereignPlayer";
import SovereignRadio from "../components/SovereignRadio";
import LiquidToggle from "../components/LiquidToggle";
import DigitalSeal from "../components/DigitalSeal";

/**
 * Step 4 — Sovereign Player: Mobile-First Vertical Stack
 * Directive 022: Unified Video/Audio/Radio with Liquid Toggle
 *
 * Layout (< 768px):
 *   64px Header
 *   ┌─────────────────────┐
 *   │  16:9 Video Player  │  OR  Radio Panel
 *   ├─────────────────────┤
 *   │  Liquid Toggle      │  (Video · Audio · Radio)
 *   │  Stream Info         │
 *   │  Digital Taper       │
 *   │  Prayer Wall         │
 *   │  Digital Seal        │
 *   └─────────────────────┘
 *   72px Bottom Bar
 */

function WatchContent() {
  const searchParams = useSearchParams();
  const streamId = searchParams.get("id");
  const startAudio = searchParams.get("audio") === "true";
  const startRadio = searchParams.get("radio") === "true";

  const [stream, setStream] = useState(null);
  const [playerMode, setPlayerMode] = useState(
    startRadio ? "radio" : startAudio ? "audio" : "video"
  );
  const [loading, setLoading] = useState(true);
  const [taperLoading, setTaperLoading] = useState(false);
  const [taperSuccess, setTaperSuccess] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [nowPlaying, setNowPlaying] = useState(null);

  const radioRef = useRef(null);
  const metaPollRef = useRef(null);

  useEffect(() => {
    async function fetchStream() {
      try {
        // Atomic 16: VOD items route through /api/library
        if (streamId && streamId.startsWith("vod-")) {
          const res = await fetch(`/api/library/${encodeURIComponent(streamId)}`);
          const data = await res.json();
          if (data.success && data.stream) {
            setStream(data.stream);
          } else {
            setStream(null);
          }
        } else {
          const res = await fetch("/api/streams/active");
          const data = await res.json();
          const found = data.streams?.find((s) => s.id === streamId);
          setStream(found || data.streams?.[0] || null);
        }
      } catch (err) {
        console.error("Failed to fetch stream:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStream();
  }, [streamId]);

  // ── Atomic 05 + Directive 022: Poll metadata when Radio is active ──
  // Dual-source: Direct Pipe metadata (source=pipe) for yt-dlp streams,
  // ICY metadata for external Icecast/Shoutcast stations.
  useEffect(() => {
    if (playerMode !== "radio") {
      setNowPlaying(null);
      if (metaPollRef.current) clearInterval(metaPollRef.current);
      return;
    }

    async function fetchMeta() {
      try {
        // Use Direct Pipe metadata if stream has a ytUrl (Live/VOD),
        // otherwise fall back to ICY metadata for external radio
        const url = stream?.radioUrl
          ? `/api/streams/radio-meta?url=${encodeURIComponent(stream.radioUrl)}`
          : `/api/streams/radio-meta?source=pipe`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && data.metadata) {
          setNowPlaying({
            title: data.metadata.title,
            artist: data.metadata.artist || data.metadata.stationName,
          });
        }
      } catch { /* silent */ }
    }

    fetchMeta();
    metaPollRef.current = setInterval(fetchMeta, 10000);
    return () => clearInterval(metaPollRef.current);
  }, [playerMode, stream?.radioUrl]);

  // ── Directive 022: Unified mode switching — mutual exclusion ──
  const handleModeChange = useCallback(
    (newMode) => {
      // Pause radio when switching AWAY from radio
      if (playerMode === "radio" && newMode !== "radio") {
        radioRef.current?.pause();
      }
      setPlayerMode(newMode);
    },
    [playerMode]
  );

  // ── Light a Candle — POST to Stewardship API ──
  async function handleLightCandle(amount) {
    if (taperLoading || !stream) return;
    setSelectedAmount(amount);
    setTaperLoading(true);
    setTaperSuccess(null);
    try {
      const res = await fetch("/api/stewardship/taper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamId: stream.id, amount }),
      });
      const data = await res.json();
      if (data.success) {
        setTaperSuccess(data);
        setTimeout(() => {
          setTaperSuccess(null);
          setSelectedAmount(null);
        }, 4000);
      }
    } catch (err) {
      console.error("Taper transaction failed:", err);
    } finally {
      setTaperLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="watch-loading">
        <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9", borderRadius: 0 }} />
        <div style={{ padding: "var(--space-md)" }}>
          <div className="skeleton" style={{ height: 24, width: "70%", marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 16, width: "40%" }} />
        </div>
      </div>
    );
  }

  const isRadioMode = playerMode === "radio";
  const isAudioOnly = playerMode === "audio";

  return (
    <div className="watch-page">
      {/* ═══════════════════════════════════════
          PLAYER AREA — Video/Audio OR Radio
          ═══════════════════════════════════════ */}
      <div className="watch-player-wrap">
        {isRadioMode ? (
          <SovereignRadio
            ref={radioRef}
            radioUrl={
              stream?.radioUrl
                || (stream?.ytUrl ? `/api/radio/stream?url=${encodeURIComponent(stream.ytUrl)}&streamId=${encodeURIComponent(stream?.id || "")}` : null)
            }
            nowPlaying={nowPlaying}
            streamName={stream?.name}
            onPlay={() => { }}
            onPause={() => { }}
          />
        ) : (
          <SovereignPlayer
            src={stream?.ytUrl || null}
            isAudioOnly={isAudioOnly}
            streamId={stream?.id}
            autoSubtitles={stream?.authority?.level <= 2}
            streamTier={stream?.authority?.level}
            youtubeChannel={stream?.youtubeChannel}
            ytVideoId={stream?.ytVideoId}
            isVOD={stream?.isVOD || false}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════
          CONTROLS + SCROLLABLE MODULES
          ═══════════════════════════════════════ */}
      <div className="watch-scroll-area">
        {/* ── Liquid Toggle: Video · Audio · Radio ── */}
        <div className="watch-controls">
          <LiquidToggle mode={playerMode} onToggle={handleModeChange} />
        </div>

        {/* ── Stream Info ── */}
        {stream && (
          <div className="watch-info">
            <div className="watch-info-top">
              <div>
                {stream.isLive && <span className="badge badge-live">● LIVE</span>}
                {stream.isVOD && <span className="badge badge-live" style={{ background: "rgba(212, 168, 83, 0.15)", color: "var(--color-gold)", border: "1px solid rgba(212, 168, 83, 0.3)" }}>📡 VOD RELAY</span>}
                <h1 className="watch-title">{stream.name}</h1>
                <p className="text-secondary watch-location">{stream.location}</p>
              </div>
              {stream.viewerCount > 0 && (
                <div className="watch-viewers">
                  <span className="watch-viewers-count">{stream.viewerCount?.toLocaleString()}</span>
                  <span className="text-muted" style={{ fontSize: 11 }}>watching</span>
                </div>
              )}
            </div>
            <div className="watch-tags">
              <span className="badge badge-gold">{stream.language}</span>
              <span className={`badge badge-tier${stream.authority?.level || 3}`}>
                Tier {stream.authority?.level || 3}
              </span>
              {stream.radioUrl && (
                <span className="badge badge-radio">📻 Radio Available</span>
              )}
            </div>
          </div>
        )}

        {/* ── Digital Taper ── */}
        <div className="card-flat taper-card">
          <h3 className="heading-card">🕯️ Digital Taper</h3>
          <p className="taper-desc">
            Light a candle for this parish. 80% goes directly to{" "}
            <strong>{stream?.name || "the streaming parish"}</strong>.
          </p>

          {taperSuccess && (
            <div className="taper-confirmation">
              <div className="taper-candle-pulse">🕯️</div>
              <p className="taper-confirm-text">{taperSuccess.message}</p>
              <div className="taper-split-detail">
                <span>Parish: <strong>${taperSuccess.transaction.amount.parishShare.toFixed(2)}</strong></span>
                <span>Network: <strong>${taperSuccess.transaction.amount.networkShare.toFixed(2)}</strong></span>
              </div>
            </div>
          )}

          <div className="taper-amounts">
            {[1, 5, 10, 25].map((amount) => (
              <button
                key={amount}
                className={`taper-btn ${selectedAmount === amount ? "active" : ""}`}
                onClick={() => handleLightCandle(amount)}
                disabled={taperLoading}
              >
                ${amount}
              </button>
            ))}
          </div>
          <button
            className="btn btn-gold taper-action"
            onClick={() => handleLightCandle(selectedAmount || 5)}
            disabled={taperLoading}
          >
            {taperLoading ? "Processing..." : "🕯️ Light a Candle"}
          </button>
          <p className="taper-note">80% to parish · 20% to network · Zero platform fees</p>
        </div>

        {/* ── Prayer Wall ── */}
        <div className="card-flat prayer-card">
          <h3 className="heading-card">🙏 Prayer Wall</h3>
          <p className="text-secondary" style={{ fontSize: "var(--text-sm)", marginTop: 4 }}>
            Submit names for intercession during this service.
          </p>
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="Enter a name for prayer..."
              className="prayer-input"
            />
            <button className="btn btn-outline prayer-submit">
              Submit for Prayer
            </button>
          </div>
        </div>

        {/* ── Digital Seal ── */}
        {stream && (
          <div className="card-flat seal-card">
            <h3 className="heading-card" style={{ marginBottom: "var(--space-sm)" }}>
              Canonical Verification
            </h3>
            <DigitalSeal stream={stream} size="lg" />
          </div>
        )}
      </div>

      <style jsx>{`
        /* ═══════════════════════════════════════
           MOBILE-FIRST: Base styles ARE mobile 
           ═══════════════════════════════════════ */
        .watch-page {
          display: flex;
          flex-direction: column;
          min-height: calc(100vh - 136px);
        }
        .watch-loading {
          min-height: calc(100vh - 136px);
        }

        /* ── PLAYER: 16:9 aspect ratio, full width ── */
        .watch-player-wrap {
          width: 100%;
          background: #000;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }

        /* ── SCROLLABLE MODULES BELOW PLAYER ── */
        .watch-scroll-area {
          flex: 1;
          padding: var(--space-md);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        /* ── CONTROLS ROW ── */
        .watch-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
        }

        /* ── STREAM INFO ── */
        .watch-info {
          padding-bottom: var(--space-sm);
          border-bottom: 1px solid var(--border-subtle);
        }
        .watch-info-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-sm);
        }
        .watch-title {
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          margin-top: 4px;
        }
        .watch-location {
          font-size: var(--text-sm);
          margin-top: 2px;
        }
        .watch-viewers {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .watch-viewers-count {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }
        .watch-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: var(--space-sm);
        }

        /* ── Radio Available Badge ── */
        :global(.badge-radio) {
          background: rgba(212, 168, 83, 0.12) !important;
          color: var(--color-gold) !important;
          border: 1px solid rgba(212, 168, 83, 0.3) !important;
        }

        /* ── DIGITAL TAPER ── */
        .taper-card {
          text-align: center;
        }
        .taper-desc {
          font-size: var(--text-sm);
          color: var(--text-secondary);
          margin: 8px 0 16px;
        }
        .taper-amounts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .taper-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-gold);
          background: var(--surface-card);
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          -webkit-tap-highlight-color: transparent;
        }
        .taper-btn:hover,
        .taper-btn:active {
          background: rgba(212, 168, 83, 0.12);
          border-color: var(--color-gold);
          transform: scale(1.02);
        }
        .taper-btn.active {
          background: rgba(212, 168, 83, 0.20);
          border-color: var(--color-gold);
          box-shadow: 0 0 12px rgba(212, 168, 83, 0.25);
        }
        .taper-btn:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        .taper-action {
          width: 100%;
          min-height: 52px;
          font-size: var(--text-base);
        }
        .taper-note {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-top: 10px;
        }

        /* ── PRAYER WALL ── */
        .prayer-input {
          width: 100%;
          margin-bottom: 8px;
          min-height: 48px;
        }
        .prayer-submit {
          width: 100%;
          min-height: 48px;
        }

        /* ── DIGITAL SEAL ── */
        .seal-card {
          text-align: center;
        }

        /* ── SYNC OVERLAY: 14px font cap on mobile ── */
        :global(.sync-overlay) {
          font-size: 14px !important;
        }

        /* ── TAPER CONFIRMATION ── */
        .taper-confirmation {
          padding: 16px;
          margin-bottom: 12px;
          background: rgba(212, 168, 83, 0.08);
          border: 1px solid rgba(212, 168, 83, 0.25);
          border-radius: var(--radius-lg);
          text-align: center;
          animation: fadeIn 0.3s var(--ease-out);
        }
        .taper-candle-pulse {
          font-size: 40px;
          animation: candlePulse 1.5s ease-in-out infinite;
        }
        @keyframes candlePulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.15); filter: brightness(1.3); }
        }
        .taper-confirm-text {
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-gold);
          margin-top: 8px;
        }
        .taper-split-detail {
          display: flex;
          justify-content: center;
          gap: var(--space-md);
          margin-top: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .taper-split-detail strong {
          color: var(--color-gold);
        }

        /* ═══════════════════════════════════════
           TABLET+ (≥768px): Horizontal split
           ═══════════════════════════════════════ */
        @media (min-width: 768px) {
          .watch-page {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: var(--space-lg);
            padding: var(--space-md);
          }
          .watch-player-wrap {
            border-radius: var(--radius-lg);
          }
          .watch-scroll-area {
            padding: 0;
          }
          .watch-title {
            font-size: var(--text-xl);
          }
        }
      `}</style>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="watch-loading" style={{ padding: "0" }}>
          <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
