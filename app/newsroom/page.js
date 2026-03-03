"use client";

import { useState, useEffect } from "react";
import HubCard from "../components/HubCard";

/**
 * Newsroom — Regional Production Hub Selector & Content Feed
 *
 * Hub selector ribbon (horizontal scroll on mobile) + content feed grid.
 * Filter by content type (News, Feature, Youth Pulse, Editorial).
 */

const CONTENT_FILTERS = [
    { value: "all", label: "All", icon: "📰" },
    { value: "news", label: "News", icon: "🗞️" },
    { value: "feature", label: "Features", icon: "🎬" },
    { value: "youth", label: "Youth Pulse", icon: "⚡" },
    { value: "editorial", label: "Editorial", icon: "✍️" },
];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = Math.floor((now - d) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getTypeIcon(type) {
    switch (type) {
        case "news": return "🗞️";
        case "feature": return "🎬";
        case "youth": return "⚡";
        case "editorial": return "✍️";
        default: return "📰";
    }
}

function getTypeBadgeClass(type) {
    switch (type) {
        case "news": return "content-type-badge--news";
        case "feature": return "content-type-badge--feature";
        case "youth": return "content-type-badge--youth";
        case "editorial": return "content-type-badge--editorial";
        default: return "";
    }
}

export default function NewsroomPage() {
    const [hubs, setHubs] = useState([]);
    const [selectedHub, setSelectedHub] = useState(null);
    const [feed, setFeed] = useState([]);
    const [typeFilter, setTypeFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    // Fetch hubs on mount
    useEffect(() => {
        async function loadHubs() {
            try {
                const res = await fetch("/api/hubs");
                const data = await res.json();
                if (data.success) {
                    setHubs(data.hubs);
                    if (data.hubs.length > 0) {
                        setSelectedHub(data.hubs[0].id);
                    }
                }
            } catch {
                // Silent fail
            }
        }
        loadHubs();
    }, []);

    // Fetch feed when hub or filter changes
    useEffect(() => {
        if (!selectedHub) return;
        async function loadFeed() {
            setLoading(true);
            try {
                const typeParam = typeFilter !== "all" ? `?type=${typeFilter}` : "";
                const res = await fetch(`/api/hubs/${selectedHub}/feed${typeParam}`);
                const data = await res.json();
                if (data.success) {
                    setFeed(data.items);
                }
            } catch {
                setFeed([]);
            } finally {
                setLoading(false);
            }
        }
        loadFeed();
    }, [selectedHub, typeFilter]);

    const activeHub = hubs.find((h) => h.id === selectedHub);

    return (
        <div className="newsroom-page">
            {/* Page Header */}
            <div className="newsroom-hero">
                <div className="newsroom-hero-content">
                    <h1 className="newsroom-title">
                        <span className="newsroom-title-icon">🎙️</span>
                        The Global Newsroom
                    </h1>
                    <p className="newsroom-subtitle">
                        Five regional production hubs delivering Orthodox news, features, and
                        theological content to the global diaspora — 24/7.
                    </p>
                </div>
            </div>

            {/* Hub Selector Ribbon */}
            <section className="newsroom-hub-ribbon" aria-label="Regional Hubs">
                <div className="newsroom-hub-scroll">
                    {hubs.map((hub) => (
                        <HubCard
                            key={hub.id}
                            hub={hub}
                            onSelect={setSelectedHub}
                            isActive={selectedHub === hub.id}
                        />
                    ))}
                </div>
            </section>

            {/* Active Hub Live Banner */}
            {activeHub?.isLive && (
                <div className="newsroom-live-banner">
                    <span className="newsroom-live-dot" />
                    <span>Live from <strong>{activeHub.city}</strong></span>
                    <span className="newsroom-live-flag">{activeHub.flag}</span>
                </div>
            )}

            {/* Content Type Filter */}
            <div className="newsroom-filters">
                {CONTENT_FILTERS.map((f) => (
                    <button
                        key={f.value}
                        className={`newsroom-filter-btn ${typeFilter === f.value ? "newsroom-filter-btn--active" : ""}`}
                        onClick={() => setTypeFilter(f.value)}
                    >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Feed Grid */}
            <section className="newsroom-feed" aria-label="Content Feed">
                {loading ? (
                    <div className="newsroom-loading">
                        <div className="newsroom-loading-spinner" />
                        <span>Loading feed…</span>
                    </div>
                ) : feed.length === 0 ? (
                    <div className="newsroom-empty">
                        <span className="newsroom-empty-icon">📭</span>
                        <p>No content available for this filter.</p>
                    </div>
                ) : (
                    <div className="newsroom-feed-grid">
                        {feed.map((item) => (
                            <article key={item.id} className="content-card">
                                <div className="content-card-header">
                                    <span className={`content-type-badge ${getTypeBadgeClass(item.type)}`}>
                                        {getTypeIcon(item.type)} {item.type}
                                    </span>
                                    <span className="content-card-time">{formatDate(item.publishedAt)}</span>
                                </div>
                                <h3 className="content-card-title">{item.title}</h3>
                                <p className="content-card-summary">{item.summary}</p>
                                <div className="content-card-footer">
                                    <span className="content-card-author">{item.author}</span>
                                    <span className="content-card-duration">⏱ {item.duration}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Sovereign Footer Badge */}
            <div className="newsroom-sovereign-badge">
                <span>🛡️</span>
                <span>All content verified through the Canonical API — Zero secular editorial influence</span>
            </div>
        </div>
    );
}
