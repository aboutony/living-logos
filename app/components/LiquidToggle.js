"use client";

import { useState } from "react";

/**
 * LiquidToggle — Directive 022: Tri-State Mode Selector
 * Smooth crossfade between Video · Audio · Radio modes.
 *
 * Props:
 *   mode: "video" | "audio" | "radio"
 *   onToggle(mode): callback with new mode string
 */

const MODES = [
  { key: "video", icon: "📺", label: "Video" },
  { key: "audio", icon: "🎧", label: "Audio" },
  { key: "radio", icon: "📻", label: "Radio" },
];

export default function LiquidToggle({ mode = "video", onToggle }) {
  const [animating, setAnimating] = useState(false);

  const activeIndex = MODES.findIndex((m) => m.key === mode);

  function handleSelect(newMode) {
    if (newMode === mode) return;
    setAnimating(true);
    onToggle?.(newMode);
    setTimeout(() => setAnimating(false), 500);
  }

  return (
    <div className={`liquid-toggle ${animating ? "animating" : ""}`}>
      {MODES.map((m, i) => (
        <button
          key={m.key}
          className={`liquid-option ${mode === m.key ? "active" : ""}`}
          onClick={() => handleSelect(m.key)}
        >
          <span className="liquid-icon">{m.icon}</span>
          <span className="liquid-label">{m.label}</span>
        </button>
      ))}

      <div
        className="liquid-indicator"
        style={{
          transform: `translateX(${activeIndex * 100}%)`,
          width: `calc(${100 / MODES.length}% - 4px)`,
        }}
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
          padding: 8px 16px;
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
        .liquid-indicator {
          position: absolute;
          top: 3px;
          left: 3px;
          height: calc(100% - 6px);
          background: linear-gradient(
            135deg,
            var(--color-gold) 0%,
            var(--color-gold-dim) 100%
          );
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
          box-shadow: 0 0 20px rgba(212, 168, 83, 0.2);
        }
        @media (max-width: 480px) {
          .liquid-label {
            display: none;
          }
          .liquid-option {
            padding: 8px 12px;
          }
        }
      `}</style>
    </div>
  );
}
