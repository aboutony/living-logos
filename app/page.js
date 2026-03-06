"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

/**
 * Step 3 — Full-Bleed Map Page
 * Directive 019: Reads stored country from localStorage and passes
 * targetCountry to the Globe for auto-pivot after the 360° revolution.
 *
 * The Globe fills the entire viewport between the 64px header and 72px bottom bar.
 * Height: calc(100vh - 136px)
 */
const Globe = dynamic(() => import("./components/Globe"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "var(--text-muted)",
        background: "radial-gradient(ellipse at center, #0a0e27, #060918)",
      }}
    >
      <div style={{ fontSize: 48, animation: "iconGlow 2s ease-in-out infinite" }}>☦</div>
      <p>Loading Global Map...</p>
    </div>
  ),
});

export default function HomePage() {
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [targetCountry, setTargetCountry] = useState(null);

  // ── Directive 019: Load stored country for Globe auto-pivot ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("ll-country");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.lat && parsed?.lng) {
          setTargetCountry(parsed);
        }
      }
    } catch { /* silent */ }
  }, []);

  // Listen for onboarding completion event (real-time update)
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ll-country" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.lat && parsed?.lng) {
            setTargetCountry(parsed);
          }
        } catch { /* silent */ }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    async function fetchStreams() {
      try {
        const res = await fetch("/api/streams/active");
        const data = await res.json();
        setStreams(data.streams || []);
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      }
    }
    fetchStreams();
  }, []);

  const liveCount = streams.filter((s) => s.isLive).length;

  return (
    <>
      {/* ══════════════════════════════════════════
          FULL-BLEED GLOBE — calc(100vh - 136px)
          Clamped between 64px header + 72px bottom bar
          ══════════════════════════════════════════ */}
      <section className="globe-hero-fullbleed">
        <Globe
          streams={streams}
          onSelectStream={setSelectedStream}
          targetCountry={targetCountry}
        />

        {/* Overlaid stats strip — pointer-events: none */}
        <div className="globe-hero-overlay">
          <span className="globe-hero-label">THE SOVEREIGN ORTHODOX NETWORK</span>
          <div className="globe-hero-stats">
            <div className="stat-pill">
              <span className="live-dot" />
              <strong>{liveCount}</strong> Live
            </div>
            <div className="stat-pill">
              <strong>{streams.length}</strong> Parishes
            </div>
          </div>
        </div>

        {/* Selected stream toast */}
        {selectedStream && (
          <div className="globe-selected-toast">
            <div className="toast-info">
              {selectedStream.isLive && <span className="badge badge-live">● LIVE</span>}
              <strong>{selectedStream.name}</strong>
              <span className="text-muted">{selectedStream.location}</span>
            </div>
            <a href={`/watch?id=${selectedStream.id}`} className="btn btn-gold btn-sm">
              Watch
            </a>
          </div>
        )}
      </section>

      <style jsx>{`
        /* ── FULL-BLEED GLOBE CONTAINER ── */
        .globe-hero-fullbleed {
          position: fixed;
          top: 64px;
          left: 0;
          width: 100vw;
          height: calc(100vh - 136px);
          overflow: hidden;
          background: #060918;
          touch-action: none;
          z-index: 1;
        }

        /* ── OVERLAY ── */
        .globe-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: var(--space-sm) var(--space-md) var(--space-md);
          background: linear-gradient(to top, rgba(6, 9, 24, 0.8) 0%, transparent 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-xs);
          z-index: 5;
          pointer-events: none;
        }
        .globe-hero-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--color-gold);
        }
        .globe-hero-stats {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 999px;
          backdrop-filter: blur(8px);
          white-space: nowrap;
        }
        .stat-pill strong {
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }

        /* ── SELECTED STREAM TOAST ── */
        .globe-selected-toast {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-sm);
          padding: 10px 14px;
          background: rgba(10, 14, 39, 0.92);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 168, 83, 0.25);
          border-radius: var(--radius-lg);
          z-index: 10;
          animation: fadeIn 0.3s var(--ease-out);
        }
        .toast-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          font-size: var(--text-sm);
        }
        .toast-info strong {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}
