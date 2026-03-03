"use client";

import { useState, useEffect } from "react";

/**
 * SpiritualWallet — Self-Sovereign Identity profile panel
 * Displays DID, Verifiable Credentials, and privacy controls.
 */
export default function SpiritualWallet() {
    const [wallet, setWallet] = useState(null);
    const [credentials, setCredentials] = useState([]);

    useEffect(() => {
        // Generate SSI profile on mount (client-side only)
        import("@/lib/ssi").then(({ generateDID, createVerifiableCredential }) => {
            const did = generateDID("Faithful Servant");
            setWallet(did);

            // Create sample Verifiable Credentials
            const creds = [
                createVerifiableCredential("Baptism", {
                    did: did.id,
                    name: "Faithful Servant",
                    parish: "Holy Trinity Cathedral, NYC",
                    authority: "Tier 2 — Archdiocesan",
                }),
                createVerifiableCredential("Chrismation", {
                    did: did.id,
                    name: "Faithful Servant",
                    parish: "Holy Trinity Cathedral, NYC",
                    authority: "Tier 2 — Archdiocesan",
                }),
                createVerifiableCredential("ParishMembership", {
                    did: did.id,
                    name: "Faithful Servant",
                    parish: "Holy Trinity Cathedral, NYC",
                    authority: "Tier 3 — Local Parish",
                }),
            ];
            setCredentials(creds);
        });
    }, []);

    if (!wallet) {
        return (
            <div className="wallet-loading">
                <div className="skeleton" style={{ width: "100%", height: 200 }} />
            </div>
        );
    }

    return (
        <div className="spiritual-wallet">
            {/* DID Profile */}
            <div className="wallet-profile card-glass">
                <div className="wallet-avatar">
                    <span>☦</span>
                </div>
                <div className="wallet-info">
                    <h2 className="heading-card">{wallet.displayName}</h2>
                    <p className="wallet-did">{wallet.id}</p>
                    <div className="wallet-badges">
                        <span className="badge badge-verified">🔐 Sovereign Identity</span>
                        <span className="badge badge-gold">Confessional Privacy</span>
                    </div>
                </div>
            </div>

            {/* Privacy Status */}
            <div className="wallet-privacy card-flat">
                <h3 className="heading-card">🛡️ Data Sovereignty</h3>
                <div className="privacy-grid">
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>Decentralized Identifier (DID)</span>
                    </div>
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>Zero third-party data sharing</span>
                    </div>
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>No secular analytics or tracking</span>
                    </div>
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>Confessional-level encryption</span>
                    </div>
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>Self-sovereign data ownership</span>
                    </div>
                    <div className="privacy-item">
                        <span className="privacy-icon">✓</span>
                        <span>No algorithm-driven profiling</span>
                    </div>
                </div>
            </div>

            {/* Verifiable Credentials */}
            <div className="wallet-credentials">
                <h3 className="heading-card" style={{ marginBottom: "var(--space-md)" }}>
                    📜 Verifiable Credentials
                </h3>
                <div className="credentials-grid">
                    {credentials.map((vc, i) => (
                        <div key={i} className={`credential-card card animate-fade-in-up animate-delay-${i + 1}`}>
                            <div className="credential-type">
                                {vc.type[1].replace("Credential", "")}
                            </div>
                            <div className="credential-detail">
                                <span className="label">Issued By</span>
                                <span>{vc.issuer.name}</span>
                            </div>
                            <div className="credential-detail">
                                <span className="label">Subject</span>
                                <span>{vc.credentialSubject.name}</span>
                            </div>
                            <div className="credential-detail">
                                <span className="label">Parish</span>
                                <span>{vc.credentialSubject.parish || "—"}</span>
                            </div>
                            <div className="credential-detail">
                                <span className="label">Authority</span>
                                <span>{vc.credentialSubject.authority}</span>
                            </div>
                            <div className="credential-seal">
                                <span>✦</span> Verified Credential
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
        .spiritual-wallet {
          display: flex;
          flex-direction: column;
          gap: var(--space-xl);
        }
        .wallet-profile {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
        }
        .wallet-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-gold), var(--color-gold-dim));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          flex-shrink: 0;
          box-shadow: 0 0 30px rgba(212, 168, 83, 0.25);
        }
        .wallet-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
        }
        .wallet-did {
          font-size: var(--text-xs);
          color: var(--text-muted);
          font-family: monospace;
          word-break: break-all;
        }
        .wallet-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .wallet-privacy {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }
        .privacy-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .privacy-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .privacy-icon {
          color: var(--color-olive);
          font-weight: 700;
        }
        .credentials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-md);
        }
        .credential-card {
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
        }
        .credential-type {
          font-family: var(--font-serif);
          font-size: var(--text-xl);
          font-weight: 700;
          color: var(--color-gold);
        }
        .credential-detail {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .credential-detail span:last-child {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .credential-seal {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-gold);
        }
        @media (max-width: 640px) {
          .wallet-profile { flex-direction: column; text-align: center; }
          .wallet-badges { justify-content: center; }
          .privacy-grid { grid-template-columns: 1fr; }
        }
      `}</style>
        </div>
    );
}
