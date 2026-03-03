"use client";

/**
 * StreamCard — Compact card for a live or archived stream
 * Shows: parish name, location, rite, language, authority tier, Digital Seal
 */
export default function StreamCard({ stream, onWatch, onListen }) {
    const tierClass =
        stream.authority?.level === 1
            ? "badge-tier1"
            : stream.authority?.level === 2
                ? "badge-tier2"
                : "badge-tier3";

    const tierLabel =
        stream.authority?.level === 1
            ? "Patriarchal"
            : stream.authority?.level === 2
                ? "Archdiocesan"
                : "Parish";

    const riteShort =
        typeof stream.rite === "string"
            ? stream.rite
                .replace("Divine Liturgy of ", "")
                .replace("Liturgy of the ", "")
            : "Liturgy";

    return (
        <div className={`stream-card card ${stream.isLive ? "stream-card--live" : ""}`}>
            {/* Header */}
            <div className="stream-card-header">
                <div className="stream-card-name">
                    {stream.isLive && <span className="live-dot" />}
                    <h3 className="heading-card">{stream.name}</h3>
                </div>
                {stream.digitalSeal && (
                    <span className="seal-icon tooltip" data-tooltip="Digital Seal of Authenticity">
                        ✦
                    </span>
                )}
            </div>

            {/* Location */}
            <p className="stream-card-location">{stream.location}</p>

            {/* Tags */}
            <div className="stream-card-tags">
                <span className="badge badge-gold">{stream.language}</span>
                <span className={`badge ${tierClass}`}>{tierLabel}</span>
                <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                    {riteShort}
                </span>
            </div>

            {/* Live Info */}
            {stream.isLive && stream.viewerCount > 0 && (
                <div className="stream-card-viewers">
                    <span className="live-dot" />
                    <span>{stream.viewerCount.toLocaleString()} watching now</span>
                </div>
            )}

            {/* Actions */}
            <div className="stream-card-actions">
                <button className="btn btn-gold btn-sm" onClick={() => onWatch?.(stream)}>
                    📺 Watch
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => onListen?.(stream)}>
                    🎧 Listen
                </button>
            </div>

            <style jsx>{`
        .stream-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeInUp 0.5s var(--ease-out) both;
        }
        .stream-card--live {
          border-color: rgba(198, 40, 40, 0.25);
        }
        .stream-card--live::before {
          content: '';
          position: absolute;
          top: -1px;
          left: 20px;
          right: 20px;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--color-crimson-glow), transparent);
        }
        .stream-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }
        .stream-card-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .stream-card-location {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .stream-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .stream-card-viewers {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-xs);
          color: var(--color-olive);
        }
        .stream-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 4px;
        }
        .seal-icon {
          color: var(--color-gold);
          font-size: 18px;
          animation: iconGlow 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
