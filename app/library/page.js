"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

/**
 * /library — VOD Content Library
 * Atomic Command 16: Library Expansion
 *
 * Gallery view with category tabs: All / Sermons / Documentaries / Movies
 * Each item links to /watch?id={item.id} for playback with subtitles.
 */

const CATEGORY_TABS = [
    { key: "all", label: "All", icon: "📚" },
    { key: "sermons", label: "Sermons", icon: "🎙️" },
    { key: "documentaries", label: "Documentaries", icon: "🎬" },
    { key: "movies", label: "Movies", icon: "🎞️" },
];

function LibraryContent() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "all";

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const url =
            activeCategory === "all"
                ? "/api/library"
                : `/api/library?category=${activeCategory}`;
        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                setItems(data.items || []);
                setLoading(false);
            })
            .catch(() => {
                setItems([]);
                setLoading(false);
            });
    }, [activeCategory]);

    return (
        <div className="library-page">
            {/* ── Page Header ── */}
            <div className="library-header">
                <h1 className="library-title">
                    <span>📚</span> Content Library
                </h1>
                <p className="library-subtitle">
                    Sermons, documentaries, and films — with Patristic AI translation
                </p>
            </div>

            {/* ── Category Tabs ── */}
            <div className="library-tabs">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        className={`library-tab ${activeCategory === tab.key ? "active" : ""}`}
                        onClick={() => setActiveCategory(tab.key)}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* ── Content Grid ── */}
            {loading ? (
                <div className="library-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="library-card-skeleton">
                            <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
                            <div style={{ padding: 12 }}>
                                <div className="skeleton" style={{ height: 16, width: "80%", marginBottom: 8 }} />
                                <div className="skeleton" style={{ height: 12, width: "50%" }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="library-empty">
                    <p>No content found in this category.</p>
                </div>
            ) : (
                <div className="library-grid">
                    {items.map((item) => (
                        <a
                            key={item.id}
                            href={`/watch?id=${item.id}`}
                            className="library-card"
                            id={`library-item-${item.id}`}
                        >
                            <div className="library-card-thumb">
                                <img
                                    src={item.thumbnail}
                                    alt={item.titleEn || item.title}
                                    loading="lazy"
                                />
                                <div className="library-card-badge">
                                    {item.category === "sermons" && "🎙️ Sermon"}
                                    {item.category === "documentaries" && "🎬 Documentary"}
                                    {item.category === "movies" && "🎞️ Movie"}
                                </div>
                            </div>
                            <div className="library-card-info">
                                <h3 className="library-card-title">
                                    {item.titleEn || item.title}
                                </h3>
                                <p className="library-card-meta">
                                    {item.authority} · {item.date}
                                </p>
                                {item.description && (
                                    <p className="library-card-desc">{item.description}</p>
                                )}
                                <div className="library-card-footer">
                                    <span className="badge badge-gold">{item.language?.toUpperCase()}</span>
                                    <span className="library-card-relay">📡 VOD RELAY</span>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}

            <style jsx>{`
                .library-page {
                    padding: var(--space-md);
                    max-width: 1200px;
                    margin: 0 auto;
                }
                .library-header {
                    text-align: center;
                    margin-bottom: var(--space-lg);
                }
                .library-title {
                    font-family: var(--font-serif);
                    font-size: var(--text-2xl);
                    font-weight: 700;
                    color: var(--text-primary);
                }
                .library-subtitle {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .library-tabs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: var(--space-lg);
                    overflow-x: auto;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: 4px;
                }
                .library-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: var(--text-secondary);
                    background: var(--surface-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all var(--duration-fast) var(--ease-out);
                    -webkit-tap-highlight-color: transparent;
                }
                .library-tab:hover {
                    border-color: var(--color-gold);
                    color: var(--text-primary);
                }
                .library-tab.active {
                    background: rgba(212, 168, 83, 0.12);
                    border-color: var(--color-gold);
                    color: var(--color-gold);
                }
                .library-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-md);
                }
                @media (min-width: 640px) {
                    .library-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (min-width: 1024px) {
                    .library-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                .library-card {
                    display: block;
                    background: var(--surface-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    text-decoration: none;
                    color: inherit;
                    transition: all var(--duration-fast) var(--ease-out);
                }
                .library-card:hover {
                    border-color: var(--color-gold);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                }
                .library-card-skeleton {
                    background: var(--surface-card);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                }
                .library-card-thumb {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 16 / 9;
                    overflow: hidden;
                    background: #000;
                }
                .library-card-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .library-card-badge {
                    position: absolute;
                    top: 8px;
                    left: 8px;
                    padding: 4px 10px;
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--color-gold);
                    background: rgba(0, 0, 0, 0.75);
                    border-radius: var(--radius-md);
                    backdrop-filter: blur(4px);
                }
                .library-card-info {
                    padding: 12px;
                }
                .library-card-title {
                    font-family: var(--font-serif);
                    font-size: var(--text-base);
                    font-weight: 600;
                    color: var(--text-primary);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .library-card-meta {
                    font-size: 11px;
                    color: var(--text-muted);
                    margin-top: 4px;
                }
                .library-card-desc {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                    margin-top: 6px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                    line-height: 1.4;
                }
                .library-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 10px;
                    gap: 8px;
                }
                .library-card-relay {
                    font-size: 11px;
                    font-weight: 700;
                    color: var(--color-gold);
                    opacity: 0.8;
                }
                .library-empty {
                    text-align: center;
                    padding: var(--space-xl);
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    );
}

export default function LibraryPage() {
    return (
        <Suspense
            fallback={
                <div style={{ padding: "var(--space-md)", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)" }}>Loading library…</p>
                </div>
            }
        >
            <LibraryContent />
        </Suspense>
    );
}
