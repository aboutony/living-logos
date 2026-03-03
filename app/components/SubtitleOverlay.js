"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SubtitleOverlay — Patristic AI Real-Time Auto-Translation
 *
 * Uses the browser's Web Speech API to listen to audio via microphone,
 * transcribe speech in real-time, and translate it through the Patristic AI
 * engine with Sacred Glossary enforcement.
 *
 * Works with ANY audio source: YouTube, Facebook, live streams, audio files, etc.
 * The microphone picks up the audio playing on the device.
 *
 * Props:
 *   streamId   — Active stream ID for subtitle context
 *   enabled    — Whether subtitles are visible
 *   onClose    — Callback to toggle off
 *   autoEnable — Directive 010: Auto-enable for Tier 1/2 streams
 *   streamTier — Authority tier level (1, 2, or 3)
 */

const LANGUAGES = [
    { code: "el", name: "Greek", flag: "🇬🇷", speechCode: "el-GR" },
    { code: "en", name: "English", flag: "🇬🇧", speechCode: "en-US" },
    { code: "ar", name: "Arabic", flag: "🇱🇧", speechCode: "ar-SA" },
    { code: "ru", name: "Russian", flag: "🇷🇺", speechCode: "ru-RU" },
    { code: "ro", name: "Romanian", flag: "🇷🇴", speechCode: "ro-RO" },
    { code: "sr", name: "Serbian", flag: "🇷🇸", speechCode: "sr-RS" },
    { code: "bg", name: "Bulgarian", flag: "🇧🇬", speechCode: "bg-BG" },
    { code: "tr", name: "Turkish", flag: "🇹🇷", speechCode: "tr-TR" },
    { code: "ka", name: "Georgian", flag: "🇬🇪", speechCode: "ka-GE" },
    { code: "fr", name: "French", flag: "🇫🇷", speechCode: "fr-FR" },
    { code: "de", name: "German", flag: "🇩🇪", speechCode: "de-DE" },
    { code: "it", name: "Italian", flag: "🇮🇹", speechCode: "it-IT" },
    { code: "es", name: "Spanish", flag: "🇪🇸", speechCode: "es-ES" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷", speechCode: "pt-BR" },
    { code: "no", name: "Norwegian", flag: "🇳🇴", speechCode: "nb-NO" },
    { code: "sw", name: "Swahili", flag: "🇰🇪", speechCode: "sw-KE" },
    { code: "am", name: "Amharic", flag: "🇪🇹", speechCode: "am-ET" },
    { code: "zh", name: "Mandarin", flag: "🇨🇳", speechCode: "zh-CN" },
    { code: "hi", name: "Hindi", flag: "🇮🇳", speechCode: "hi-IN" },
    { code: "ja", name: "Japanese", flag: "🇯🇵", speechCode: "ja-JP" },
    { code: "ko", name: "Korean", flag: "🇰🇷", speechCode: "ko-KR" },
    { code: "fa", name: "Persian", flag: "🇮🇷", speechCode: "fa-IR" },
    { code: "he", name: "Hebrew", flag: "🇮🇱", speechCode: "he-IL" },
    { code: "ur", name: "Urdu", flag: "🇵🇰", speechCode: "ur-PK" },
    { code: "id", name: "Indonesian", flag: "🇮🇩", speechCode: "id-ID" },
    { code: "tl", name: "Tagalog", flag: "🇵🇭", speechCode: "fil-PH" },
];

// Sacred term marker renderer
function renderSubtitleText(text) {
    if (!text) return null;
    const parts = text.split("⸬");
    return parts.map((part, idx) => {
        if (idx % 2 === 1) {
            return (
                <span key={idx} className="sacred-term">
                    {part}
                </span>
            );
        }
        return <span key={idx}>{part}</span>;
    });
}

export default function SubtitleOverlay({ streamId, enabled, onClose, autoEnable, streamTier }) {
    const [sourceLang, setSourceLang] = useState("el");
    const [targetLang, setTargetLang] = useState("en");
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sacredTermCount, setSacredTermCount] = useState(0);
    const [vetted, setVetted] = useState(false);
    const [micError, setMicError] = useState(null);
    const [statusText, setStatusText] = useState("Tap 🎙️ to start live translation");

    const recognitionRef = useRef(null);
    const translateTimeout = useRef(null);

    // Check for Web Speech API support
    const isSpeechSupported = typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    // Start/stop speech recognition
    const toggleListening = useCallback(() => {
        if (!isSpeechSupported) {
            setMicError("Speech recognition not supported in this browser");
            return;
        }

        if (isListening) {
            // Stop
            recognitionRef.current?.stop();
            setIsListening(false);
            setStatusText("Paused — tap 🎙️ to resume");
            return;
        }

        // Start
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        const sourceLangObj = LANGUAGES.find((l) => l.code === sourceLang);
        recognition.lang = sourceLangObj?.speechCode || "el-GR";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setMicError(null);
            setStatusText("🔴 Listening…");
        };

        recognition.onresult = (event) => {
            let interimTranscript = "";
            let finalTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += t;
                } else {
                    interimTranscript += t;
                }
            }

            // Show interim results immediately
            const displayText = finalTranscript || interimTranscript;
            if (displayText) {
                setTranscript(displayText);

                // Debounce translation call (only translate final results or after 1.5s pause)
                clearTimeout(translateTimeout.current);
                const delay = finalTranscript ? 200 : 1500;
                translateTimeout.current = setTimeout(() => {
                    translateSpeech(displayText);
                }, delay);
            }
        };

        recognition.onerror = (event) => {
            if (event.error === "no-speech") {
                setStatusText("🔇 No speech detected — ensure audio is audible");
            } else if (event.error === "not-allowed") {
                setMicError("Microphone access denied — please allow in browser settings");
                setIsListening(false);
            } else if (event.error === "aborted") {
                // User stopped, ignore
            } else {
                setMicError(`Speech error: ${event.error}`);
            }
        };

        recognition.onend = () => {
            // Auto-restart if still in listening mode (continuous recognition)
            if (isListening) {
                try {
                    recognition.start();
                } catch {
                    setIsListening(false);
                    setStatusText("Tap 🎙️ to restart");
                }
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (err) {
            setMicError("Could not start speech recognition");
        }
    }, [isListening, sourceLang, isSpeechSupported]);

    // Translate recognized speech via Patristic AI
    const translateSpeech = async (text) => {
        if (!text || text.length < 2) return;
        try {
            const res = await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    sourceLang,
                    targetLang,
                    streamId,
                }),
            });
            const data = await res.json();
            if (data.success && data.translation) {
                setTranslatedText(data.translation.translatedText || text);
                setSacredTermCount(data.translation.sacredTerms?.length || 0);
                setVetted(data.translation.sacredTerms?.length > 0);
                setStatusText("🔴 Live translating…");
            }
        } catch {
            // Silent fail — subtitle is non-critical
        }
    };

    // Stop recognition when disabled or unmounted
    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
            clearTimeout(translateTimeout.current);
        };
    }, []);

    // Stop when toggled off
    useEffect(() => {
        if (!enabled && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [enabled]);

    // Restart recognition when source language changes
    useEffect(() => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            // Small delay then restart with new language
            setTimeout(() => toggleListening(), 300);
        }
    }, [sourceLang]);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    {/* Mic Button */}
                    <button
                        className={`subtitle-mic-btn ${isListening ? "active" : ""}`}
                        onClick={toggleListening}
                        title={isListening ? "Stop listening" : "Start live translation"}
                    >
                        {isListening ? "⏹" : "🎙️"}
                    </button>

                    {/* Source Language */}
                    <div className="subtitle-lang-selector">
                        <label className="subtitle-lang-label">From</label>
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="subtitle-lang-dropdown"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.flag} {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <span className="subtitle-arrow">→</span>

                    {/* Target Language */}
                    <div className="subtitle-lang-selector">
                        <label className="subtitle-lang-label">To</label>
                        <select
                            value={targetLang}
                            onChange={(e) => { setTargetLang(e.target.value); setVetted(false); }}
                            className="subtitle-lang-dropdown"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.flag} {l.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Badges */}
                    {vetted && (
                        <div className="vetting-badge">
                            <span className="vetting-badge-icon">🛡️</span>
                            <span className="vetting-badge-text">Dogma-Vetted ✓</span>
                        </div>
                    )}

                    <div className="glossary-lock-badge">
                        <span>🔒</span>
                        <span>Glossary</span>
                    </div>

                    {streamTier && (
                        <div className={`subtitle-tier-badge tier-${streamTier}`}>
                            {streamTier === 1 ? "Tier 1" : streamTier === 2 ? "Tier 2" : "Tier 3"}
                        </div>
                    )}

                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">
                        ✕
                    </button>
                </div>

                {/* Live Subtitle Display */}
                <div className="subtitle-cue-container">
                    {micError ? (
                        <div className="subtitle-error">{micError}</div>
                    ) : transcript || translatedText ? (
                        <>
                            <div className="subtitle-original">
                                {transcript}
                            </div>
                            <div className="subtitle-translated">
                                {renderSubtitleText(translatedText)}
                            </div>
                            {sacredTermCount > 0 && (
                                <div className="subtitle-sacred-note">
                                    🔒 {sacredTermCount} sacred term{sacredTermCount > 1 ? "s" : ""} locked by glossary
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="subtitle-status">{statusText}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
