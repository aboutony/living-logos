"use client";

import { useState, useEffect } from "react";
import SpiritualWallet from "../components/SpiritualWallet";

/**
 * Spiritual Wallet — Self-Sovereign Identity + Stewardship History
 * Directive 010: DID persistence via localStorage
 */
export default function WalletPage() {
    const [history, setHistory] = useState(null);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [didPersisted, setDidPersisted] = useState(false);

    // Directive 010: DID persistence
    useEffect(() => {
        const storedDid = localStorage.getItem("ll-did");
        if (storedDid) {
            setDidPersisted(true);
        }
    }, []);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch("/api/stewardship/history?did=anonymous");
                const data = await res.json();
                setHistory(data);
            } catch (err) {
                console.error("Failed to fetch stewardship history:", err);
            } finally {
                setLoadingHistory(false);
            }
        }
        fetchHistory();
    }, []);

    return (
        <div className="wallet-page">
            <div className="container">
                {/* Header */}
                <div className="wallet-header animate-fade-in">
                    <span className="label" style={{ color: "var(--color-gold)" }}>
                        SELF-SOVEREIGN IDENTITY
                    </span>
                    <h1 className="heading-hero" style={{ fontSize: "var(--text-3xl)" }}>
                        Spiritual Wallet
                    </h1>
                    {didPersisted && (
                        <div className="did-persisted-badge">
                            <span>🔐</span>
                            <span>DID Persisted</span>
                        </div>
                    )}
                    <p className="text-secondary" style={{ maxWidth: 600, margin: "12px auto 0", textAlign: "center", fontSize: "var(--text-sm)" }}>
                        Your identity is sovereign. Protected by Decentralized Identifiers (DID) and
                        Verifiable Credentials — providing Confessional-level privacy.
                    </p>
                </div>

                {/* Wallet Component */}
                <SpiritualWallet />

                {/* ═══════════════════════════════════════
            STEWARDSHIP HISTORY — Phase Two
            ═══════════════════════════════════════ */}
                <div className="stewardship-section">
                    <div className="section-header">
                        <span className="label" style={{ color: "var(--color-gold)" }}>
                            STEWARDSHIP RECORD
                        </span>
                        <h2 className="heading-section">🕯️ Candles Lit</h2>
                    </div>

                    {/* Stats */}
                    {history && history.candlesLit > 0 && (
                        <div className="stewardship-stats">
                            <div className="stewardship-stat">
                                <span className="stewardship-stat-value">
                                    ${history.totalGiven?.toFixed(2) || "0.00"}
                                </span>
                                <span className="stewardship-stat-label">Total Given</span>
                            </div>
                            <div className="stewardship-stat">
                                <span className="stewardship-stat-value">{history.candlesLit || 0}</span>
                                <span className="stewardship-stat-label">Candles Lit</span>
                            </div>
                            <div className="stewardship-stat">
                                <span className="stewardship-stat-value">{history.parishesSupported || 0}</span>
                                <span className="stewardship-stat-label">Parishes</span>
                            </div>
                        </div>
                    )}

                    {/* Transaction List */}
                    {loadingHistory ? (
                        <div className="card-flat" style={{ padding: "24px", textAlign: "center" }}>
                            <p className="text-muted">Loading stewardship history...</p>
                        </div>
                    ) : !history || history.candlesLit === 0 ? (
                        <div className="card-flat stewardship-empty">
                            <div style={{ fontSize: 48, marginBottom: 12 }}>🕯️</div>
                            <h3 className="heading-card">No Candles Yet</h3>
                            <p className="text-secondary" style={{ fontSize: "var(--text-sm)", marginTop: 8 }}>
                                Light your first candle during a live stream to support a parish directly.
                                80% goes to the parish — zero platform fees.
                            </p>
                            <a href="/watch" className="btn btn-gold" style={{ marginTop: 16 }}>
                                Watch a Stream
                            </a>
                        </div>
                    ) : (
                        <div className="stewardship-list">
                            {history.transactions.map((tx, i) => (
                                <div key={tx.id || i} className="stewardship-tx">
                                    <div className="stewardship-tx-icon">🕯️</div>
                                    <div className="stewardship-tx-info">
                                        <strong>{tx.parishName}</strong>
                                        <span className="text-muted" style={{ fontSize: 11 }}>
                                            {tx.parishLocation}
                                        </span>
                                    </div>
                                    <div className="stewardship-tx-amount">
                                        <strong>${tx.amount.toFixed(2)}</strong>
                                        <span className="text-muted" style={{ fontSize: 10 }}>
                                            {new Date(tx.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SSI Explainer */}
                <div className="ssi-explainer page-section">
                    <div className="section-header">
                        <span className="label">HOW IT WORKS</span>
                        <h2 className="heading-section">Your Data, Your Sovereignty</h2>
                    </div>
                    <div className="grid grid-3">
                        {[
                            {
                                icon: "🔑",
                                title: "Decentralized Identifier",
                                desc: "Your DID is generated locally — no central authority controls your identity.",
                            },
                            {
                                icon: "📜",
                                title: "Verifiable Credentials",
                                desc: "Baptism and Parish Membership sealed as cryptographic credentials only you share.",
                            },
                            {
                                icon: "🛡️",
                                title: "Zero Data Harvesting",
                                desc: "No algorithms profile your behavior. Your sanctuary is inviolable.",
                            },
                        ].map((item, i) => (
                            <div key={i} className={`card animate-fade-in-up animate-delay-${i + 1}`}>
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                                <h3 className="heading-card">{item.title}</h3>
                                <p className="text-secondary" style={{ marginTop: 8, fontSize: "var(--text-sm)" }}>
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .wallet-page {
          padding: var(--space-xl) 0 var(--space-3xl);
        }
        .wallet-header {
          text-align: center;
          margin-bottom: var(--space-xl);
        }

        /* ── STEWARDSHIP SECTION ── */
        .stewardship-section {
          margin-top: var(--space-xl);
        }
        .stewardship-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }
        .stewardship-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-md);
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
        }
        .stewardship-stat-value {
          font-size: var(--text-xl);
          font-weight: 800;
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }
        .stewardship-stat-label {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* ── TRANSACTION LIST ── */
        .stewardship-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
          background: var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .stewardship-tx {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: 14px var(--space-md);
          background: var(--surface-card);
        }
        .stewardship-tx-icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        .stewardship-tx-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .stewardship-tx-info strong {
          font-size: var(--text-sm);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .stewardship-tx-amount {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          flex-shrink: 0;
        }
        .stewardship-tx-amount strong {
          color: var(--color-gold);
          font-variant-numeric: tabular-nums;
        }
        .stewardship-empty {
          text-align: center;
          padding: var(--space-2xl) var(--space-md);
        }

        .ssi-explainer {
          margin-top: var(--space-2xl);
        }
      `}</style>
        </div>
    );
}
