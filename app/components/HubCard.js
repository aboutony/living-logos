"use client";

/**
 * HubCard — Regional Production Hub Visual Card
 *
 * Glassmorphic card displaying a regional production bureau.
 * Shows city name, live status, language badges, capability list, and content count.
 *
 * Props:
 *   hub       — Hub object from regional-hubs.js
 *   onSelect  — Callback when card is clicked (hubId)
 *   isActive  — Whether this hub is currently selected
 */

export default function HubCard({ hub, onSelect, isActive }) {
    return (
        <div
            className={`hub-card ${isActive ? "hub-card--active" : ""} ${hub.isLive ? "hub-card--live" : ""}`}
            onClick={() => onSelect?.(hub.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect?.(hub.id); }}
            aria-label={`Select ${hub.name}`}
        >
            {/* Gradient Header */}
            <div className="hub-card-header">
                <span className="hub-card-flag">{hub.flag}</span>
                <div className="hub-card-title-group">
                    <h3 className="hub-card-title">{hub.name}</h3>
                    <span className="hub-card-city">{hub.city}, {hub.country}</span>
                </div>
                {hub.isLive && (
                    <div className="hub-card-live-badge">
                        <span className="hub-card-live-dot" />
                        LIVE
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="hub-card-description">{hub.description}</p>

            {/* Language Badges */}
            <div className="hub-card-languages">
                {hub.languages.map((lang) => (
                    <span key={lang} className="hub-card-lang-badge">
                        {lang.toUpperCase()}
                    </span>
                ))}
            </div>

            {/* Capabilities */}
            <div className="hub-card-capabilities">
                {hub.capabilities.map((cap, idx) => (
                    <span key={idx} className="hub-card-cap-tag">
                        {cap}
                    </span>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="hub-card-footer">
                <span className="hub-card-stat">
                    📰 {hub.contentCount || 0} item{(hub.contentCount || 0) !== 1 ? "s" : ""}
                </span>
                <span className="hub-card-stat">
                    🌐 {hub.timezone}
                </span>
            </div>
        </div>
    );
}
