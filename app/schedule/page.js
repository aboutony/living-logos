"use client";

import { useState, useEffect } from "react";

/**
 * 24/7 Linear Grid — The Global Broadcast Schedule
 * Displays the sample Tuesday broadcast schedule with time-zone awareness.
 */

const SCHEDULE = [
    {
        utc: "05:00",
        title: "Orthros (Matins)",
        format: "Live Video",
        source: "Mt. Athos / St. Catherine's Sinai",
        icon: "🌅",
        isLive: false,
        tier: 1,
    },
    {
        utc: "07:00",
        title: "The Daily Lectionary",
        format: "Podcast",
        source: "Global Production Hub",
        icon: "🎧",
        isLive: false,
        tier: 2,
    },
    {
        utc: "09:00",
        title: "Voices from the Phanar",
        format: "VOD / Archive",
        source: "Constantinople Archive",
        icon: "📼",
        isLive: false,
        tier: 1,
    },
    {
        utc: "12:00",
        title: "Midday Panikhida / Prayer",
        format: "Live Video",
        source: "Rotating Parish (London / Paris)",
        icon: "🕯️",
        isLive: false,
        tier: 3,
    },
    {
        utc: "14:00",
        title: "Orthodox Life: Live Call-In",
        format: "Live Audio",
        source: "New York / Sydney Studio",
        icon: "📞",
        isLive: false,
        tier: 2,
    },
    {
        utc: "17:00",
        title: "Byzantine Chant Masterclass",
        format: "Video Series",
        source: "Athens Conservatory",
        icon: "🎵",
        isLive: false,
        tier: 2,
    },
    {
        utc: "20:00",
        title: "Vespers (Evening Prayer)",
        format: "Live Video",
        source: "US / Canada Parishes",
        icon: "🌆",
        isLive: false,
        tier: 3,
    },
    {
        utc: "22:00",
        title: "The Compline (Night Prayer)",
        format: "Live Video",
        source: "St. Anthony's Monastery, AZ",
        icon: "🌙",
        isLive: false,
        tier: 3,
    },
];

function getLocalTime(utcStr) {
    const [h, m] = utcStr.split(":").map(Number);
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h, m));
    return utcDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getCurrentSlotIndex() {
    const now = new Date();
    const currentUTC = now.getUTCHours() * 60 + now.getUTCMinutes();
    for (let i = SCHEDULE.length - 1; i >= 0; i--) {
        const [h, m] = SCHEDULE[i].utc.split(":").map(Number);
        if (currentUTC >= h * 60 + m) return i;
    }
    return SCHEDULE.length - 1;
}

export default function SchedulePage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [tzLabel, setTzLabel] = useState("UTC");

    useEffect(() => {
        setCurrentIndex(getCurrentSlotIndex());
        setTzLabel(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }, []);

    return (
        <div className="schedule-page">
            <div className="container">
                {/* Header */}
                <div className="schedule-header animate-fade-in">
                    <span className="label" style={{ color: "var(--color-gold)" }}>
                        24/7 LINEAR BROADCAST
                    </span>
                    <h1 className="heading-hero" style={{ fontSize: "var(--text-4xl)" }}>
                        Global Broadcast Grid
                    </h1>
                    <p className="text-secondary" style={{ maxWidth: 600, margin: "12px auto 0", textAlign: "center" }}>
                        A sovereign 24/7 channel — blending live services, on-demand archives, and podcasts
                        into one continuous stream. Showing times in your timezone ({tzLabel}).
                    </p>
                    <div className="divider" />
                </div>

                {/* Day Label */}
                <div className="schedule-day">
                    <span className="cross-ornament">☦</span>
                    <span> Sample Tuesday — The Living Logos Channel</span>
                    <span className="cross-ornament">☦</span>
                </div>

                {/* Schedule Grid */}
                <div className="schedule-grid">
                    {SCHEDULE.map((slot, i) => {
                        const isCurrent = i === currentIndex;
                        const isPast = i < currentIndex;
                        return (
                            <div
                                key={i}
                                className={`schedule-row card-flat animate-fade-in-up animate-delay-${(i % 5) + 1} ${isCurrent ? "current" : ""} ${isPast ? "past" : ""}`}
                            >
                                {/* Time */}
                                <div className="schedule-time">
                                    <span className="schedule-local-time">{getLocalTime(slot.utc)}</span>
                                    <span className="schedule-utc">{slot.utc} UTC</span>
                                </div>

                                {/* Now indicator */}
                                {isCurrent && (
                                    <div className="schedule-now">
                                        <span className="live-dot" />
                                        <span>NOW</span>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="schedule-content">
                                    <div className="schedule-title">
                                        <span className="schedule-icon">{slot.icon}</span>
                                        <h3 className="heading-card">{slot.title}</h3>
                                    </div>
                                    <div className="schedule-meta">
                                        <span className={`badge badge-tier${slot.tier}`}>
                                            Tier {slot.tier}
                                        </span>
                                        <span className="badge" style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                                            {slot.format}
                                        </span>
                                    </div>
                                    <p className="schedule-source">{slot.source}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style jsx>{`
        .schedule-page {
          padding: var(--space-3xl) 0;
        }
        .schedule-header {
          text-align: center;
          margin-bottom: var(--space-2xl);
        }
        .schedule-day {
          text-align: center;
          font-family: var(--font-serif);
          font-size: var(--text-lg);
          color: var(--text-secondary);
          margin-bottom: var(--space-xl);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-md);
        }
        .schedule-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
          max-width: 900px;
          margin: 0 auto;
        }
        .schedule-row {
          display: grid;
          grid-template-columns: 100px auto 1fr;
          gap: var(--space-lg);
          align-items: center;
          padding: var(--space-lg) var(--space-xl);
          border-left: 3px solid var(--border-subtle);
          transition: all var(--duration-normal) var(--ease-out);
        }
        .schedule-row.current {
          border-left-color: var(--color-crimson-glow);
          background: rgba(198, 40, 40, 0.05);
          box-shadow: inset 4px 0 20px rgba(198, 40, 40, 0.08);
        }
        .schedule-row.past {
          opacity: 0.5;
        }
        .schedule-time {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .schedule-local-time {
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }
        .schedule-utc {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .schedule-now {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--color-crimson-glow);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .schedule-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .schedule-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .schedule-icon {
          font-size: 24px;
        }
        .schedule-meta {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .schedule-source {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .schedule-row {
            grid-template-columns: 80px 1fr;
            gap: var(--space-md);
          }
          .schedule-now {
            position: absolute;
            top: 8px;
            right: 8px;
          }
          .schedule-row { position: relative; }
        }
      `}</style>
        </div>
    );
}
