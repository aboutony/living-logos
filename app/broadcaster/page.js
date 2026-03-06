"use client";

import { useState, useEffect } from "react";

/**
 * Broadcaster Portal — Directive 010 + 019
 * Live audit log, treasury stats, zero-fee transparency,
 * and Diaspora Distribution analytics.
 */

function formatCurrency(n) {
    return `$${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    const now = new Date();
    const diffM = Math.floor((now - d) / 60000);
    if (diffM < 1) return "Just now";
    if (diffM < 60) return `${diffM}m ago`;
    const diffH = Math.floor(diffM / 60);
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function BroadcasterPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [diasporaData, setDiasporaData] = useState(null);

    // Fetch treasury data
    useEffect(() => {
        async function load() {
            try {
                const res = await fetch("/api/stewardship/broadcaster");
                const json = await res.json();
                if (json.success) setData(json);
            } catch { /* silent */ }
            finally { setLoading(false); }
        }
        load();
        const interval = setInterval(load, 15000);
        return () => clearInterval(interval);
    }, []);

    // ── Directive 019: Fetch Diaspora Distribution ──
    useEffect(() => {
        async function loadDiaspora() {
            try {
                const res = await fetch("/api/analytics/selection");
                const json = await res.json();
                if (json.success) setDiasporaData(json);
            } catch { /* silent */ }
        }
        loadDiaspora();
        const interval = setInterval(loadDiaspora, 20000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="broadcaster-page">
                <div className="newsroom-loading">
                    <div className="newsroom-loading-spinner" />
                    <span>Loading Broadcaster Portal…</span>
                </div>
            </div>
        );
    }

    const treasury = data?.treasury || {};
    const network = data?.network || {};
    const auditEntries = data?.auditLog?.entries || [];
    const policy = data?.auditLog?.sovereignPolicy || {};

    // Diaspora data
    const totalEvents = diasporaData?.totalEvents || 0;
    const topLanguages = (diasporaData?.distribution?.languages || []).slice(0, 5);
    const topCountries = (diasporaData?.distribution?.countries || []).slice(0, 5);
    const maxLangCount = topLanguages[0]?.count || 1;
    const maxCountryCount = topCountries[0]?.count || 1;

    return (
        <div className="broadcaster-page">
            {/* Header */}
            <div className="broadcaster-hero">
                <h1 className="broadcaster-title">
                    <span className="broadcaster-title-icon">📊</span>
                    Broadcaster Portal
                </h1>
                <p className="broadcaster-subtitle">
                    Complete financial transparency. Zero platform fees. Every candle accounted for.
                </p>
                <div className="broadcaster-mode-badge">
                    <span className="broadcaster-mode-dot" />
                    <span>Production Mainnet</span>
                </div>
            </div>

            {/* Treasury Stats Bar */}
            <section className="broadcaster-stats" aria-label="Treasury Statistics">
                <div className="broadcaster-stat-card broadcaster-stat-card--gold">
                    <span className="broadcaster-stat-label">Total Candles</span>
                    <span className="broadcaster-stat-value">{treasury.totalCandles || 0}</span>
                </div>
                <div className="broadcaster-stat-card">
                    <span className="broadcaster-stat-label">Total Given</span>
                    <span className="broadcaster-stat-value">{formatCurrency(treasury.totalAmount)}</span>
                </div>
                <div className="broadcaster-stat-card">
                    <span className="broadcaster-stat-label">To Parishes (80%)</span>
                    <span className="broadcaster-stat-value broadcaster-stat-value--green">{formatCurrency(treasury.totalToParishes)}</span>
                </div>
                <div className="broadcaster-stat-card">
                    <span className="broadcaster-stat-label">To Network (20%)</span>
                    <span className="broadcaster-stat-value">{formatCurrency(treasury.totalToNetwork)}</span>
                </div>
                <div className="broadcaster-stat-card broadcaster-stat-card--zero">
                    <span className="broadcaster-stat-label">Platform Fees</span>
                    <span className="broadcaster-stat-value">{formatCurrency(0)}</span>
                    <span className="broadcaster-stat-badge">ZERO ✓</span>
                </div>
            </section>

            {/* Network Overview */}
            <div className="broadcaster-network-bar">
                <span>🌍 <strong>{network.totalParishes}</strong> parishes registered</span>
                <span>🔴 <strong>{network.liveNow}</strong> live now</span>
                <span>🔐 <strong>{network.sealed}</strong> sealed</span>
            </div>

            {/* ══════════════════════════════════════════
                DIRECTIVE 019: DIASPORA DISTRIBUTION
                Onboarding analytics — language & country bar charts
               ══════════════════════════════════════════ */}
            <section className="diaspora-section" aria-label="Diaspora Distribution" id="diaspora-distribution">
                <div className="diaspora-header">
                    <h2 className="diaspora-title">
                        <span className="diaspora-title-icon">🌐</span>
                        Diaspora Distribution
                    </h2>
                    <span className="diaspora-total">
                        {totalEvents} onboarded
                    </span>
                </div>

                {totalEvents === 0 ? (
                    <div className="diaspora-empty">
                        <span className="diaspora-empty-icon">🗺️</span>
                        <p>No selection events yet. The first faithful to enter the sanctuary will appear here.</p>
                    </div>
                ) : (
                    <div className="diaspora-charts">
                        {/* Top Languages */}
                        <div className="diaspora-chart">
                            <div className="diaspora-chart-title">Top Languages</div>
                            {topLanguages.map((lang) => (
                                <div className="diaspora-bar-row" key={lang.code}>
                                    <span className="diaspora-bar-label">{lang.name}</span>
                                    <div className="diaspora-bar-track">
                                        <div
                                            className="diaspora-bar-fill"
                                            style={{ width: `${Math.max((lang.count / maxLangCount) * 100, 8)}%` }}
                                        >
                                            <span className="diaspora-bar-count">{lang.count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Top Countries */}
                        <div className="diaspora-chart">
                            <div className="diaspora-chart-title">Top Countries</div>
                            {topCountries.map((country) => (
                                <div className="diaspora-bar-row" key={country.code}>
                                    <span className="diaspora-bar-label">{country.name}</span>
                                    <div className="diaspora-bar-track">
                                        <div
                                            className="diaspora-bar-fill"
                                            style={{ width: `${Math.max((country.count / maxCountryCount) * 100, 8)}%` }}
                                        >
                                            <span className="diaspora-bar-count">{country.count}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {/* Sovereign Policy */}
            <div className="broadcaster-policy">
                <span className="broadcaster-policy-title">⚖️ Sovereign Split Policy</span>
                <div className="broadcaster-policy-pills">
                    <span className="broadcaster-pill broadcaster-pill--parish">{policy.parishShare} → Parish</span>
                    <span className="broadcaster-pill broadcaster-pill--network">{policy.networkShare} → Network</span>
                    <span className="broadcaster-pill broadcaster-pill--fee">{policy.platformFee}</span>
                </div>
            </div>

            {/* Live Audit Log */}
            <section className="broadcaster-audit" aria-label="Live Audit Log">
                <h2 className="broadcaster-section-title">Live Audit Log</h2>
                {auditEntries.length === 0 ? (
                    <div className="broadcaster-empty">
                        <span className="newsroom-empty-icon">🕯️</span>
                        <p>No transactions yet. Light the first candle.</p>
                    </div>
                ) : (
                    <div className="broadcaster-table-wrap">
                        <table className="broadcaster-table">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Parish</th>
                                    <th>Total</th>
                                    <th>Parish Share</th>
                                    <th>Seal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditEntries.map((tx) => (
                                    <tr key={tx.id}>
                                        <td className="broadcaster-cell-time">{formatTime(tx.timestamp)}</td>
                                        <td className="broadcaster-cell-parish">
                                            <span className="broadcaster-parish-name">{tx.parishName}</span>
                                            <span className="broadcaster-parish-loc">{tx.parishLocation}</span>
                                        </td>
                                        <td className="broadcaster-cell-amount">{formatCurrency(tx.amount?.total)}</td>
                                        <td className="broadcaster-cell-share">{formatCurrency(tx.amount?.parishShare)}</td>
                                        <td>
                                            <span className={`broadcaster-seal-badge ${tx.seal === "verified" ? "verified" : ""}`}>
                                                {tx.seal === "verified" ? "🔐" : "⏳"} {tx.seal}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Sovereign Footer */}
            <div className="newsroom-sovereign-badge">
                <span>🛡️</span>
                <span>All transactions immutable and verifiable — Zero secular platform fees</span>
            </div>
        </div>
    );
}
