"use client";

import { useState } from "react";

/**
 * LiquidToggle — Persistent switch between Video and Audio-Only modes
 * Smooth crossfade with visual feedback.
 */
export default function LiquidToggle({ isAudioOnly, onToggle }) {
  const [animating, setAnimating] = useState(false);

  function handleToggle() {
    setAnimating(true);
    onToggle?.(!isAudioOnly);
    setTimeout(() => setAnimating(false), 500);
  }

  return (
    <div className={`liquid-toggle ${animating ? "animating" : ""}`}>
      <button
        className={`liquid-option ${!isAudioOnly ? "active" : ""}`}
        onClick={() => !isAudioOnly || handleToggle()}
      >
        <span className="liquid-icon">📺</span>
        <span className="liquid-label">Video</span>
      </button>

      <div className="liquid-divider" />

      <button
        className={`liquid-option ${isAudioOnly ? "active" : ""}`}
        onClick={() => isAudioOnly || handleToggle()}
      >
        <span className="liquid-icon">🎧</span>
        <span className="liquid-label">Audio</span>
      </button>

      <div
        className="liquid-indicator"
        style={{ transform: isAudioOnly ? "translateX(100%)" : "translateX(0)" }}
      />

      <style jsx>{`
        .liquid-toggle {
          display: flex;
          align-items: center;
          background: var(--surface-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          padding: 3px;
          position: relative;
          overflow: hidden;
          width: fit-content;
        }
        .liquid-option {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 20px;
          min-height: 48px;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--duration-normal) var(--ease-out);
          position: relative;
          z-index: 2;
          background: none;
          border: none;
        }
        .liquid-option.active {
          color: var(--text-on-gold);
        }
        .liquid-divider {
          width: 1px;
          height: 20px;
          background: var(--border-subtle);
        }
        .liquid-indicator {
          position: absolute;
          top: 3px;
          left: 3px;
          width: calc(50% - 3px);
          height: calc(100% - 6px);
          background: linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dim) 100%);
          border-radius: var(--radius-full);
          transition: transform var(--duration-normal) var(--ease-spring);
          z-index: 1;
        }
        .liquid-icon {
          font-size: 16px;
        }
        .liquid-label {
          font-size: var(--text-sm);
        }
        .liquid-toggle.animating {
          box-shadow: 0 0 20px rgba(212, 168, 83, 0.20);
        }
        @media (max-width: 480px) {
          .liquid-label { display: none; }
          .liquid-option { padding: 8px 14px; }
        }
      `}</style>
    </div>
  );
}
