"use client";

import { useState } from "react";

/**
 * FilterBar — Dropdown filters for Language, Rite, and Authority Tier
 */
const LANGUAGES = [
    "All Languages",
    "Greek",
    "English",
    "Arabic",
    "Swahili",
    "Portuguese",
    "Russian",
    "Spanish",
];

const RITES = [
    "All Rites",
    "Divine Liturgy of St. John Chrysostom",
    "Divine Liturgy of St. Basil the Great",
    "Liturgy of the Presanctified Gifts",
    "Great Vespers",
    "Orthros (Matins)",
    "Paraklesis",
];

const TIERS = [
    { value: "", label: "All Tiers" },
    { value: "1", label: "Tier 1 — Patriarchal" },
    { value: "2", label: "Tier 2 — Archdiocesan" },
    { value: "3", label: "Tier 3 — Parish" },
];

export default function FilterBar({ onFilterChange, activeFilters = {} }) {
    const [language, setLanguage] = useState(activeFilters.language || "");
    const [rite, setRite] = useState(activeFilters.rite || "");
    const [tier, setTier] = useState(activeFilters.tier || "");
    const [liveOnly, setLiveOnly] = useState(activeFilters.liveOnly || false);

    function handleChange(key, value) {
        const updated = { language, rite, tier, liveOnly };
        updated[key] = value;

        if (key === "language") setLanguage(value);
        if (key === "rite") setRite(value);
        if (key === "tier") setTier(value);
        if (key === "liveOnly") setLiveOnly(value);

        onFilterChange?.(updated);
    }

    const activeCount = [language, rite, tier].filter(Boolean).length + (liveOnly ? 1 : 0);

    return (
        <div className="filter-bar">
            <div className="filter-bar-inner">
                {/* Live Only Toggle */}
                <button
                    className={`filter-live-btn ${liveOnly ? "active" : ""}`}
                    onClick={() => handleChange("liveOnly", !liveOnly)}
                >
                    <span className="live-dot" />
                    Live Only
                </button>

                {/* Language */}
                <select
                    value={language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    className="filter-select"
                >
                    {LANGUAGES.map((l) => (
                        <option key={l} value={l === "All Languages" ? "" : l}>
                            {l}
                        </option>
                    ))}
                </select>

                {/* Rite */}
                <select
                    value={rite}
                    onChange={(e) => handleChange("rite", e.target.value)}
                    className="filter-select"
                >
                    {RITES.map((r) => (
                        <option key={r} value={r === "All Rites" ? "" : r}>
                            {r === "All Rites" ? r : r.replace("Divine Liturgy of ", "").replace("Liturgy of the ", "")}
                        </option>
                    ))}
                </select>

                {/* Authority Tier */}
                <select
                    value={tier}
                    onChange={(e) => handleChange("tier", e.target.value)}
                    className="filter-select"
                >
                    {TIERS.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                {activeCount > 0 && (
                    <button
                        className="filter-clear"
                        onClick={() => {
                            setLanguage("");
                            setRite("");
                            setTier("");
                            setLiveOnly(false);
                            onFilterChange?.({ language: "", rite: "", tier: "", liveOnly: false });
                        }}
                    >
                        Clear ({activeCount})
                    </button>
                )}
            </div>

            <style jsx>{`
        .filter-bar {
          padding: 16px 0;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .filter-bar::-webkit-scrollbar {
          display: none;
        }
        .filter-bar-inner {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: max-content;
        }
        .filter-select {
          background: var(--surface-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          padding: 10px 14px;
          font-size: var(--text-sm);
          cursor: pointer;
          transition: border-color var(--duration-fast) var(--ease-out);
          min-width: 140px;
          min-height: 44px;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A9ABF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }
        .filter-select:focus {
          border-color: var(--border-active);
        }
        .filter-select option {
          background: var(--color-deep-navy);
          color: var(--text-primary);
        }
        .filter-live-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: var(--radius-full);
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--text-secondary);
          background: var(--surface-input);
          border: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          min-height: 44px;
          white-space: nowrap;
        }
        .filter-live-btn.active {
          background: rgba(198, 40, 40, 0.15);
          border-color: rgba(198, 40, 40, 0.40);
          color: var(--color-crimson-glow);
        }
        .filter-clear {
          padding: 10px 16px;
          font-size: var(--text-sm);
          font-weight: 600;
          color: var(--color-gold);
          background: rgba(212, 168, 83, 0.08);
          border: 1px solid var(--border-gold);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
          min-height: 44px;
          white-space: nowrap;
        }
        .filter-clear:hover {
          background: rgba(212, 168, 83, 0.15);
        }
        @media (max-width: 768px) {
          .filter-bar-inner {
            gap: 8px;
          }
          .filter-select {
            min-width: 120px;
            font-size: var(--text-sm);
          }
        }
      `}</style>
        </div>
    );
}
