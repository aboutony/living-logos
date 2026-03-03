"use client";

/**
 * DigitalSeal — Visual seal of authenticity for verified canonical streams
 * Gold/Byzantine motif with tier-based styling.
 */
export default function DigitalSeal({ stream, size = "md" }) {
    if (!stream) return null;

    const isSealed = stream.digitalSeal;
    const tier = stream.authority?.level || 3;

    const tierConfig = {
        1: {
            label: "Patriarchal Authority",
            color: "#F0C75E",
            gradient: "linear-gradient(135deg, #F0C75E 0%, #D4A853 50%, #A68632 100%)",
            glow: "rgba(240, 199, 94, 0.30)",
        },
        2: {
            label: "Archdiocesan Authority",
            color: "#C0C0C0",
            gradient: "linear-gradient(135deg, #E0E0E0 0%, #C0C0C0 50%, #9E9E9E 100%)",
            glow: "rgba(192, 192, 192, 0.20)",
        },
        3: {
            label: "Parish Authority",
            color: "#CD7F32",
            gradient: "linear-gradient(135deg, #DAA06D 0%, #CD7F32 50%, #A0522D 100%)",
            glow: "rgba(205, 127, 50, 0.20)",
        },
    };

    const config = tierConfig[tier] || tierConfig[3];
    const sizeMap = { sm: 48, md: 72, lg: 96 };
    const px = sizeMap[size] || 72;

    return (
        <div className="digital-seal-container tooltip" data-tooltip={isSealed ? `Verified — ${config.label}` : "Pending Verification"}>
            <div className={`digital-seal ${isSealed ? "sealed" : "unsealed"}`}>
                <div className="seal-ring" />
                <div className="seal-icon">
                    {isSealed ? "✦" : "○"}
                </div>
            </div>
            {isSealed && (
                <span className="seal-label">{config.label}</span>
            )}
            {!isSealed && (
                <span className="seal-label unsealed-label">Pending</span>
            )}

            <style jsx>{`
        .digital-seal-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .digital-seal {
          width: ${px}px;
          height: ${px}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .digital-seal.sealed {
          background: ${config.gradient};
          box-shadow: 0 0 20px ${config.glow}, inset 0 0 15px rgba(255,255,255,0.10);
          animation: iconGlow 3s ease-in-out infinite;
        }
        .digital-seal.unsealed {
          background: rgba(94, 94, 138, 0.20);
          border: 2px dashed var(--text-muted);
        }
        .seal-ring {
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.20);
        }
        .seal-icon {
          font-size: ${px * 0.4}px;
          color: ${isSealed ? "var(--text-on-gold)" : "var(--text-muted)"};
          z-index: 1;
          font-weight: 700;
        }
        .seal-label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: ${config.color};
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .unsealed-label {
          color: var(--text-muted);
        }
      `}</style>
        </div>
    );
}
