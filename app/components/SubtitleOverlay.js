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

function renderSubtitleText(text) {
    if (!text) return null;
    const parts = text.split("⸬");
    return parts.map((part, idx) => {
        if (idx % 2 === 1) {
            return <span key={idx} className="sacred-term">{part}</span>;
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

    // Refs for stable callbacks (avoid stale closure bugs)
    const listeningRef = useRef(false);
    const recognitionRef = useRef(null);
    const translateTimeout = useRef(null);
    const sourceLangRef = useRef(sourceLang);
    const targetLangRef = useRef(targetLang);

    // Keep refs in sync with state
    useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
    useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);

    const isSpeechSupported = typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

    // Translate via Patristic AI
    const translateSpeech = useCallback(async (text) => {
        if (!text || text.length < 2) return;
        try {
            const res = await fetch("/api/ai/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    sourceLang: sourceLangRef.current,
                    targetLang: targetLangRef.current,
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
            // Silent fail
        }
    }, [streamId]);

    // Create and start a new recognition instance
    const startRecognition = useCallback(() => {
        if (!isSpeechSupported) {
            setMicError("Speech recognition not supported in this browser. Use Chrome or Edge.");
            return;
        }

        // Stop any existing instance
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { }
            recognitionRef.current = null;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        const langObj = LANGUAGES.find((l) => l.code === sourceLangRef.current);
        recognition.lang = langObj?.speechCode || "el-GR";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setMicError(null);
            setStatusText("🔴 Listening — speak or play audio…");
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

            const displayText = finalTranscript || interimTranscript;
            if (displayText) {
                setTranscript(displayText);
                clearTimeout(translateTimeout.current);
                const delay = finalTranscript ? 100 : 1200;
                translateTimeout.current = setTimeout(() => {
                    translateSpeech(displayText);
                }, delay);
            }
        };

        recognition.onerror = (event) => {
            if (event.error === "no-speech") {
                setStatusText("🔇 No speech detected — make sure audio is playing");
                // Don't stop, it will auto-restart via onend
            } else if (event.error === "not-allowed") {
                setMicError("🎙️ Microphone access denied — please allow in browser settings");
                listeningRef.current = false;
                setIsListening(false);
            } else if (event.error === "aborted") {
                // Intentional stop, ignore
            } else {
                setStatusText(`⚠ ${event.error} — retrying…`);
            }
        };

        recognition.onend = () => {
            // Auto-restart if we're still supposed to be listening
            // Using ref instead of state to avoid stale closure
            if (listeningRef.current) {
                setTimeout(() => {
                    if (listeningRef.current) {
                        try {
                            startRecognition();
                        } catch {
                            listeningRef.current = false;
                            setIsListening(false);
                            setStatusText("Tap 🎙️ to restart");
                        }
                    }
                }, 200);
            }
        };

        try {
            recognition.start();
            recognitionRef.current = recognition;
        } catch (err) {
            setMicError("Could not start speech recognition: " + err.message);
        }
    }, [isSpeechSupported, translateSpeech]);

    // Toggle listening on/off
    const toggleListening = useCallback(() => {
        if (listeningRef.current) {
            // Stop
            listeningRef.current = false;
            setIsListening(false);
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
                recognitionRef.current = null;
            }
            setStatusText("Paused — tap 🎙️ to resume");
        } else {
            // Start
            listeningRef.current = true;
            setIsListening(true);
            startRecognition();
        }
    }, [startRecognition]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            listeningRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
            }
            clearTimeout(translateTimeout.current);
        };
    }, []);

    // Stop when overlay is disabled
    useEffect(() => {
        if (!enabled) {
            listeningRef.current = false;
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
                recognitionRef.current = null;
            }
            setIsListening(false);
        }
    }, [enabled]);

    // Restart recognition when source language changes while listening
    useEffect(() => {
        if (listeningRef.current) {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { }
            }
            setTimeout(() => {
                if (listeningRef.current) startRecognition();
            }, 300);
        }
    }, [sourceLang, startRecognition]);

    // Re-translate when target language changes
    useEffect(() => {
        if (transcript) {
            translateSpeech(transcript);
        }
    }, [targetLang]);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    <button
                        className={`subtitle-mic-btn ${isListening ? "active" : ""}`}
                        onClick={toggleListening}
                        title={isListening ? "Stop listening" : "Start live translation"}
                    >
                        {isListening ? "⏹" : "🎙️"}
                    </button>

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

                    {vetted && (
                        <div className="vetting-badge">
                            <span className="vetting-badge-icon">🛡️</span>
                            <span className="vetting-badge-text">Vetted ✓</span>
                        </div>
                    )}

                    <div className="glossary-lock-badge">
                        <span>🔒</span>
                    </div>

                    {streamTier && (
                        <div className={`subtitle-tier-badge tier-${streamTier}`}>
                            T{streamTier}
                        </div>
                    )}

                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">✕</button>
                </div>

                {/* Live Subtitle Display */}
                <div className="subtitle-cue-container">
                    {micError ? (
                        <div className="subtitle-error">{micError}</div>
                    ) : translatedText ? (
                        <>
                            <div className="subtitle-original">{transcript}</div>
                            <div className="subtitle-translated">{renderSubtitleText(translatedText)}</div>
                            {sacredTermCount > 0 && (
                                <div className="subtitle-sacred-note">
                                    🔒 {sacredTermCount} sacred term{sacredTermCount > 1 ? "s" : ""} locked
                                </div>
                            )}
                        </>
                    ) : transcript ? (
                        <>
                            <div className="subtitle-original">{transcript}</div>
                            <div className="subtitle-translated subtitle-translating">Translating…</div>
                        </>
                    ) : (
                        <div className="subtitle-status">{statusText}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
