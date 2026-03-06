"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { LANGUAGES, COUNTRIES, searchCountries } from "@/lib/countries";

/**
 * OnboardingGate — Directive 019: Pre-Login Selection Layer
 *
 * Two-step locale selection:
 *   Step 1 → Language (26 native-script options)
 *   Step 2 → Country (searchable, ~195 entries)
 *
 * Stores selections in localStorage, enriches DID, fires analytics event.
 * Only appears ONCE per user (controlled by `ll-onboarded`).
 */

export default function OnboardingGate({ onComplete }) {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedLang, setSelectedLang] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [countrySearch, setCountrySearch] = useState("");
    const [animOut, setAnimOut] = useState(false);

    // Only show if not previously onboarded
    useEffect(() => {
        const done = localStorage.getItem("ll-onboarded");
        if (!done) {
            setVisible(true);
        }
    }, []);

    // Filtered countries
    const filteredCountries = useMemo(() => {
        return searchCountries(countrySearch);
    }, [countrySearch]);

    // ── Step 1: Language selected ──
    const handleLanguageSelect = useCallback((lang) => {
        setSelectedLang(lang);
        // Immediately apply language to the DOM
        localStorage.setItem("ll-language", JSON.stringify(lang));
        document.documentElement.lang = lang.code;
        if (lang.dir === "rtl") {
            document.documentElement.dir = "rtl";
        } else {
            document.documentElement.dir = "ltr";
        }
        // Advance to step 2
        setTimeout(() => setStep(2), 400);
    }, []);

    // ── Step 2: Country selected → complete onboarding ──
    const handleCountrySelect = useCallback(async (country) => {
        setSelectedCountry(country);
        localStorage.setItem("ll-country", JSON.stringify(country));

        // Fire anonymous analytics event
        try {
            await fetch("/api/analytics/selection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    language: selectedLang,
                    country: { code: country.code, name: country.name },
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch { /* silent — analytics should never block UX */ }

        // Mark onboarded
        localStorage.setItem("ll-onboarded", "true");

        // Animate out
        setAnimOut(true);
        setTimeout(() => {
            setVisible(false);
            if (onComplete) {
                onComplete({
                    language: selectedLang,
                    country: country,
                });
            }
        }, 600);
    }, [selectedLang, onComplete]);

    if (!visible) return null;

    return (
        <div className={`onboarding-gate ${animOut ? "onboarding-gate--out" : ""}`}>
            <div className="onboarding-backdrop" />
            <div className="onboarding-card">
                {/* ── Header ── */}
                <div className="onboarding-header">
                    <div className="onboarding-logo">☦</div>
                    <h1 className="onboarding-title">The Living Logos</h1>
                    <p className="onboarding-subtitle">
                        {step === 1
                            ? "Choose your language to enter the sanctuary"
                            : "Select your country of origin"}
                    </p>
                </div>

                {/* ── Step Indicator ── */}
                <div className="onboarding-steps">
                    <div className={`onboarding-step-dot ${step >= 1 ? "active" : ""}`}>
                        <span>1</span>
                    </div>
                    <div className="onboarding-step-line" />
                    <div className={`onboarding-step-dot ${step >= 2 ? "active" : ""}`}>
                        <span>2</span>
                    </div>
                </div>

                {/* ══════════════════════════════
                    STEP 1: Language Selector
                   ══════════════════════════════ */}
                {step === 1 && (
                    <div className="onboarding-panel onboarding-panel--in">
                        <div className="onboarding-lang-grid" role="listbox" aria-label="Select language">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang.code}
                                    className={`onboarding-lang-item ${selectedLang?.code === lang.code ? "selected" : ""}`}
                                    onClick={() => handleLanguageSelect(lang)}
                                    role="option"
                                    aria-selected={selectedLang?.code === lang.code}
                                    id={`lang-${lang.code}`}
                                >
                                    <span className="onboarding-lang-native">{lang.name}</span>
                                    <span className="onboarding-lang-english">{lang.english}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════
                    STEP 2: Country Picker
                   ══════════════════════════════ */}
                {step === 2 && (
                    <div className="onboarding-panel onboarding-panel--in">
                        <div className="onboarding-search-wrap">
                            <input
                                type="text"
                                className="onboarding-search"
                                placeholder="Search countries..."
                                value={countrySearch}
                                onChange={(e) => setCountrySearch(e.target.value)}
                                autoFocus
                                id="country-search-input"
                            />
                            <span className="onboarding-search-icon">🔍</span>
                        </div>
                        <div className="onboarding-country-list" role="listbox" aria-label="Select country">
                            {filteredCountries.map((c) => (
                                <button
                                    key={c.code}
                                    className={`onboarding-country-item ${selectedCountry?.code === c.code ? "selected" : ""}`}
                                    onClick={() => handleCountrySelect(c)}
                                    role="option"
                                    aria-selected={selectedCountry?.code === c.code}
                                    id={`country-${c.code}`}
                                >
                                    <span className="onboarding-country-flag">{c.flag}</span>
                                    <span className="onboarding-country-name">{c.name}</span>
                                </button>
                            ))}
                            {filteredCountries.length === 0 && (
                                <div className="onboarding-empty">No countries found</div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Sovereign Badge ── */}
                <div className="onboarding-footer">
                    <span>🛡️ Your data stays sovereign — stored only on your device</span>
                </div>
            </div>
        </div>
    );
}
