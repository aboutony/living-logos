"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import StreamCard from "./components/StreamCard";
import FilterBar from "./components/FilterBar";

// Dynamic import for Globe (SSR-incompatible WebGL)
const Globe = dynamic(() => import("./components/Globe"), {
  ssr: false,
  loading: () => (
    <div className="globe-placeholder">
      <div style={{ fontSize: 48, animation: "iconGlow 2s ease-in-out infinite" }}>☦</div>
      <p>Loading Global Map...</p>
    </div>
  ),
});

export default function HomePage() {
  const [streams, setStreams] = useState([]);
  const [filteredStreams, setFilteredStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreams() {
      try {
        const res = await fetch("/api/streams/active");
        const data = await res.json();
        setStreams(data.streams || []);
        setFilteredStreams(data.streams || []);
      } catch (err) {
        console.error("Failed to fetch streams:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStreams();
  }, []);

  const handleFilterChange = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      let result = [...streams];
      if (newFilters.liveOnly) result = result.filter((s) => s.isLive);
      if (newFilters.language) result = result.filter((s) => s.language === newFilters.language);
      if (newFilters.rite) result = result.filter((s) => s.rite === newFilters.rite);
      if (newFilters.tier) result = result.filter((s) => s.authority?.level === Number(newFilters.tier));
      setFilteredStreams(result);
    },
    [streams]
  );

  const liveCount = streams.filter((s) => s.isLive).length;
  const totalViewers = streams.reduce((sum, s) => sum + (s.viewerCount || 0), 0);

  return (
    <div className="home-page">

      {/* ══════════════════════════════════════════
          IMMERSIVE GLOBE HERO — The Map IS the Homepage
          ══════════════════════════════════════════ */}
      <section className="globe-hero">
        {/* Globe fills the hero */}
        <div className="globe-hero-map">
          <Globe
            streams={filteredStreams}
            onSelectStream={(stream) => setSelectedStream(stream)}
          />
        </div>

        {/* Overlaid stats strip */}
        <div className="globe-hero-overlay">
          <div className="globe-hero-title">
            <span className="globe-hero-label">THE SOVEREIGN ORTHODOX NETWORK</span>
          </div>
          <div className="globe-hero-stats">
            <div className="stat-pill">
              <span className="live-dot" />
              <strong>{liveCount}</strong> Live
            </div>
            <div className="stat-pill">
              <strong>{totalViewers.toLocaleString()}</strong> Watching
            </div>
            <div className="stat-pill">
              <strong>{streams.length}</strong> Parishes
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FILTER BAR — Sticky below the globe
          ══════════════════════════════════════════ */}
      <section className="filter-strip">
        <FilterBar onFilterChange={handleFilterChange} activeFilters={filters} />
      </section>

      {/* ══════════════════════════════════════════
          SELECTED STREAM — Appears when a pin is tapped
          ══════════════════════════════════════════ */}
      {selectedStream && (
        <section className="selected-section animate-fade-in">
          <div className="selected-banner card-glass">
            <div className="selected-info">
              {selectedStream.isLive && <span className="badge badge-live">● LIVE</span>}
              <h2 className="heading-card">{selectedStream.name}</h2>
              <p className="text-secondary">{selectedStream.location}</p>
            </div>
            <div className="selected-actions">
              <a href={`/watch?id=${selectedStream.id}`} className="btn btn-gold">📺 Watch</a>
              <a href={`/watch?id=${selectedStream.id}&audio=true`} className="btn btn-outline">🎧 Listen</a>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          LIVE STREAMS — Vertical card feed
          ══════════════════════════════════════════ */}
      <section className="streams-feed">
        <div className="feed-header">
          <span className="label" style={{ color: "var(--color-gold)" }}>LIVE NOW</span>
          <h2 className="heading-section">Follow the Liturgical Sunrise</h2>
          <div className="divider" />
        </div>

        {loading ? (
          <div className="feed-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 200, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        ) : (
          <div className="feed-grid">
            {filteredStreams.map((stream) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                onWatch={(s) => (window.location.href = `/watch?id=${s.id}`)}
                onListen={(s) => (window.location.href = `/watch?id=${s.id}&audio=true`)}
              />
            ))}
          </div>
        )}

        {filteredStreams.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            <p style={{ fontSize: "var(--text-lg)" }}>No streams match your filters</p>
            <p style={{ marginTop: 8 }}>Adjust your filters above.</p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════
          NON-NEGOTIABLES — Compact card grid
          ══════════════════════════════════════════ */}
      <section className="principles-section">
        <div className="feed-header">
          <span className="label" style={{ color: "var(--color-gold)" }}>THE NON-NEGOTIABLES</span>
          <h2 className="heading-section">Sovereign Sanctuary</h2>
          <div className="divider" />
        </div>
        <div className="principles-grid">
          {[
            { icon: "📖", title: "One Doctrine", desc: "Singular, vetted theological truth across all cultures." },
            { icon: "🛡️", title: "Zero Ads", desc: "100% ad-free. No secular algorithms." },
            { icon: "🌍", title: "Direct-to-Believer", desc: "Bypassing barriers to deliver the Voice." },
            { icon: "🔐", title: "Confessional Privacy", desc: "Self-Sovereign Identity protection." },
            { icon: "⛪", title: "Bridge to the Church", desc: "A companion — never a replacement." },
            { icon: "💰", title: "Financial Integrity", desc: "80% goes directly to the parish." },
          ].map((item, i) => (
            <div key={i} className={`card principle-card animate-fade-in-up animate-delay-${i + 1}`}>
              <div style={{ fontSize: 28 }}>{item.icon}</div>
              <div>
                <h3 className="heading-card">{item.title}</h3>
                <p className="text-secondary" style={{ marginTop: 4, fontSize: "var(--text-sm)" }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        /* ── MOBILE-FIRST: Base styles ARE mobile ── */
        .home-page {
          display: flex;
          flex-direction: column;
        }

        /* ── GLOBE HERO — calc(100vh - 136px) per Directive 005 ── */
        .globe-hero {
          position: relative;
          width: 100vw;
          height: calc(100vh - 136px);
          overflow: hidden;
          background: #060918;
          touch-action: none;
        }
        .globe-hero-map {
          width: 100%;
          height: 100%;
        }
        .globe-hero-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: var(--space-md) var(--space-md) var(--space-lg);
          background: linear-gradient(to top, rgba(6, 9, 24, 0.85) 0%, transparent 100%);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          z-index: 5;
          pointer-events: none;
        }
        .globe-hero-title {
          text-align: center;
        }
        .globe-hero-label {
          font-size: var(--text-xs);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--color-gold);
        }
        .globe-hero-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        .stat-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
          white-space: nowrap;
        }
        .stat-pill strong {
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }

        .globe-placeholder {
          width: 100%;
          height: 100%;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: var(--text-muted);
          background: radial-gradient(ellipse at center, #0a0e27, #060918);
        }

        /* ── FILTER STRIP ── */
        .filter-strip {
          padding: var(--space-sm) var(--space-md);
          position: sticky;
          top: var(--nav-height);
          z-index: 10;
          background: var(--color-abyss);
          border-bottom: 1px solid var(--border-subtle);
        }

        /* ── SELECTED STREAM ── */
        .selected-section {
          padding: var(--space-md);
        }
        .selected-banner {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .selected-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .selected-actions {
          display: flex;
          gap: 10px;
        }

        /* ── STREAMS FEED ── */
        .streams-feed {
          padding: var(--space-lg) var(--space-md);
        }
        .feed-header {
          text-align: center;
          margin-bottom: var(--space-lg);
        }
        .feed-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        /* ── PRINCIPLES ── */
        .principles-section {
          padding: var(--space-lg) var(--space-md);
          background: radial-gradient(ellipse at center, rgba(212, 168, 83, 0.03) 0%, transparent 60%);
        }
        .principles-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }
        .principle-card {
          display: flex;
          align-items: flex-start;
          gap: var(--space-md);
          padding: var(--space-md);
        }

        /* ── TABLET+ (≥768px) ── */
        @media (min-width: 768px) {
          .feed-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-lg);
          }
          .principles-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-md);
          }
          .selected-banner {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .filter-strip {
            padding: var(--space-sm) var(--space-lg);
          }
          .streams-feed,
          .principles-section {
            padding: var(--space-xl) var(--space-lg);
          }
        }

        /* ── DESKTOP (≥1200px) ── */
        @media (min-width: 1200px) {
          .feed-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .principles-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .streams-feed,
          .principles-section {
            padding: var(--space-2xl) var(--space-xl);
            max-width: 1400px;
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
