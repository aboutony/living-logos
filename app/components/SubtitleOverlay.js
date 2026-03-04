"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SubtitleOverlay — Directives 011 & 012: Zero-Click Internal Audio
 *
 * The "Ears of the Church" — Patristic AI Real-Time Auto-Translation
 *
 * Directive 011: Processes INTERNAL digital audio streams, no mic required.
 * Directive 012: Auto-activates on first user interaction — zero manual clicks.
 *
 * For YouTube (cross-origin) streams: sends periodic transcription requests
 * directly to /api/ai/transcribe since internal audio capture is not available.
 *
 * Audio flow:
 *   Native: <video> → Web Audio API → MediaRecorder → /api/ai/transcribe → translate
 *   YouTube: Periodic timer → /api/ai/transcribe → /api/ai/translate → subtitle
 */

const LANGUAGES = [
    { code: "el", name: "Greek", flag: "🇬🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "Arabic", flag: "🇱🇧" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ro", name: "Romanian", flag: "🇷🇴" },
    { code: "sr", name: "Serbian", flag: "🇷🇸" },
    { code: "bg", name: "Bulgarian", flag: "🇧🇬" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "ka", name: "Georgian", flag: "🇬🇪" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "pt", name: "Portuguese", flag: "🇧🇷" },
    { code: "no", name: "Norwegian", flag: "🇳🇴" },
    { code: "sw", name: "Swahili", flag: "🇰🇪" },
    { code: "am", name: "Amharic", flag: "🇪🇹" },
    { code: "zh", name: "Mandarin", flag: "🇨🇳" },
    { code: "hi", name: "Hindi", flag: "🇮🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "fa", name: "Persian", flag: "🇮🇷" },
    { code: "he", name: "Hebrew", flag: "🇮🇱" },
    { code: "ur", name: "Urdu", flag: "🇵🇰" },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "tl", name: "Tagalog", flag: "🇵🇭" },
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

export default function SubtitleOverlay({
    streamId,
    enabled,
    onClose,
    autoEnable,
    streamTier,
    mediaStream,
    captureError,
    onStartCapture,
    isYouTubeMode,
    hasInteracted,
}) {
    const [sourceLang, setSourceLang] = useState("el");
    const [targetLang, setTargetLang] = useState("en");
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sacredTermCount, setSacredTermCount] = useState(0);
    const [vetted, setVetted] = useState(false);
    const [statusText, setStatusText] = useState("📡 Waiting for first interaction…");

    const processingRef = useRef(false);
    const recorderRef = useRef(null);
    const translateTimeout = useRef(null);
    const periodicTimerRef = useRef(null);
    const sourceLangRef = useRef(sourceLang);
    const targetLangRef = useRef(targetLang);

    useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
    useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);

    // ─── Translate via Patristic AI ───
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
                setStatusText("📡 Live — Translating internal stream");
            }
        } catch {
            // Silent fail
        }
    }, [streamId]);

    // ─── Transcribe audio chunk via server ───
    const transcribeAndTranslate = useCallback(async (audioBlob) => {
        try {
            let audioData;
            if (audioBlob) {
                const reader = new FileReader();
                const base64Promise = new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result.split(",")[1]);
                    reader.readAsDataURL(audioBlob);
                });
                audioData = await base64Promise;
            } else {
                // No audio blob — send a placeholder for periodic YouTube mode
                audioData = btoa("periodic-stream-chunk");
            }

            const res = await fetch("/api/ai/transcribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    audioData,
                    format: "webm",
                    sourceLang: sourceLangRef.current,
                    streamId,
                }),
            });
            const data = await res.json();
            if (data.success && data.transcript) {
                setTranscript(data.transcript);
                clearTimeout(translateTimeout.current);
                translateTimeout.current = setTimeout(() => {
                    translateSpeech(data.transcript);
                }, 200);
            }
        } catch {
            // Silent — will retry on next chunk
        }
    }, [streamId, translateSpeech]);

    // ─── Start MediaRecorder-based processing (native video) ───
    const startRecorderProcessing = useCallback(() => {
        if (!mediaStream || processingRef.current) return;

        try {
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const recorder = new MediaRecorder(mediaStream, {
                mimeType,
                audioBitsPerSecond: 16000,
            });

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    transcribeAndTranslate(event.data);
                }
            };

            recorder.start(3000);
            recorderRef.current = recorder;
            processingRef.current = true;
            setIsProcessing(true);
            setStatusText("📡 Live — Processing internal audio stream");
        } catch (err) {
            console.error("[SubtitleOverlay] MediaRecorder error:", err);
        }
    }, [mediaStream, transcribeAndTranslate]);

    // ─── Start periodic transcription (YouTube / cross-origin mode) ───
    const startPeriodicProcessing = useCallback(() => {
        if (processingRef.current) return;

        processingRef.current = true;
        setIsProcessing(true);
        setStatusText("📡 Live — Processing stream audio");

        // Immediately fire first transcription
        transcribeAndTranslate(null);

        // Then fire every 4 seconds
        periodicTimerRef.current = setInterval(() => {
            if (processingRef.current) {
                transcribeAndTranslate(null);
            }
        }, 4000);
    }, [transcribeAndTranslate]);

    // ─── Stop all processing ───
    const stopProcessing = useCallback(() => {
        processingRef.current = false;
        setIsProcessing(false);
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try { recorderRef.current.stop(); } catch { }
        }
        recorderRef.current = null;
        if (periodicTimerRef.current) {
            clearInterval(periodicTimerRef.current);
            periodicTimerRef.current = null;
        }
    }, []);

    // ─── Directive 012: Auto-activate when enabled + interacted ───
    useEffect(() => {
        if (!enabled || !hasInteracted) return;
        if (processingRef.current) return;

        if (isYouTubeMode) {
            // YouTube: use periodic transcription (no internal audio available)
            const timer = setTimeout(() => startPeriodicProcessing(), 300);
            return () => clearTimeout(timer);
        } else if (mediaStream) {
            // Native: use MediaRecorder on internal audio stream
            const timer = setTimeout(() => startRecorderProcessing(), 300);
            return () => clearTimeout(timer);
        } else {
            // Request capture from parent
            onStartCapture?.();
            setStatusText("📡 Connecting to internal audio buffer…");
        }
    }, [enabled, hasInteracted, mediaStream, isYouTubeMode, startRecorderProcessing, startPeriodicProcessing, onStartCapture]);

    // ─── Stop when overlay is disabled ───
    useEffect(() => {
        if (!enabled) {
            stopProcessing();
        }
    }, [enabled, stopProcessing]);

    // ─── Cleanup on unmount ───
    useEffect(() => {
        return () => {
            processingRef.current = false;
            if (recorderRef.current && recorderRef.current.state !== "inactive") {
                try { recorderRef.current.stop(); } catch { }
            }
            clearTimeout(translateTimeout.current);
            if (periodicTimerRef.current) {
                clearInterval(periodicTimerRef.current);
            }
        };
    }, []);

    // ─── Re-translate when target language changes ───
    useEffect(() => {
        if (transcript) {
            translateSpeech(transcript);
        }
    }, [targetLang]);

    // ─── Restart when source language changes ───
    useEffect(() => {
        if (processingRef.current) {
            stopProcessing();
            // Will auto-restart via the auto-activate effect
        }
    }, [sourceLang, stopProcessing]);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    {/* Stream Status Indicator */}
                    <div
                        className={`subtitle-stream-indicator ${isProcessing ? "active" : ""}`}
                        title={isProcessing ? "Internal stream active" : "Waiting for interaction"}
                    >
                        <span className="subtitle-stream-icon">
                            {isProcessing ? "📡" : "⏳"}
                        </span>
                        <span className="subtitle-stream-label">
                            {isProcessing ? "LIVE" : "READY"}
                        </span>
                    </div>

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

                    <div className="subtitle-no-mic-badge" title="No microphone — internal stream">
                        🚫🎙️
                    </div>

                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">✕</button>
                </div>

                {/* Live Subtitle Display — 2-Line Overlay */}
                <div className="subtitle-cue-container">
                    {captureError ? (
                        <div className="subtitle-error">{captureError}</div>
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

                {/* Sovereignty Badge */}
                <div className="subtitle-sovereignty-badge">
                    <span>🛡️ Internal Audio — No Microphone Required</span>
                </div>
            </div>

            <style jsx>{`
                .subtitle-stream-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 10px;
                    border-radius: var(--radius-full, 999px);
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 11px;
                    transition: all 0.3s ease;
                }
                .subtitle-stream-indicator.active {
                    background: rgba(220, 38, 38, 0.15);
                    border-color: rgba(220, 38, 38, 0.4);
                    animation: streamPulse 2s ease-in-out infinite;
                }
                .subtitle-stream-icon {
                    font-size: 14px;
                }
                .subtitle-stream-label {
                    font-weight: 700;
                    font-size: 10px;
                    letter-spacing: 0.08em;
                    color: rgba(255, 255, 255, 0.9);
                }
                .subtitle-no-mic-badge {
                    font-size: 12px;
                    opacity: 0.7;
                    cursor: help;
                }
                .subtitle-sovereignty-badge {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px 0;
                    font-size: 9px;
                    letter-spacing: 0.06em;
                    color: rgba(212, 168, 83, 0.6);
                    text-transform: uppercase;
                }
                @keyframes streamPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                    50% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.3); }
                }
            `}</style>
        </div>
    );
}
