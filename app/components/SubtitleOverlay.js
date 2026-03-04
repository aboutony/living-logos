"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SubtitleOverlay — Directive 011: Internal Audio Sovereignty
 *
 * The "Ears of the Church" — Patristic AI Real-Time Auto-Translation
 *
 * Processes INTERNAL digital audio streams from the Sovereign Player's
 * audio buffer. NO microphone required. Works even when:
 * - Microphone permission is DENIED
 * - Device speakers are physically muted
 * - User switches between Video/Audio-Only (Liquid Toggle)
 *
 * Audio flow:
 *   <video> element → Web Audio API → MediaRecorder → /api/ai/transcribe
 *   → transcript → /api/ai/translate → Patristic AI vetted subtitle
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
    mediaStream,       // Internal audio MediaStream from useAudioStreamCapture
    captureError,      // Error from audio capture hook
    onStartCapture,    // Callback to start audio capture
    isYouTubeMode,     // Whether the player is in YouTube iframe mode
}) {
    const [sourceLang, setSourceLang] = useState("el");
    const [targetLang, setTargetLang] = useState("en");
    const [isProcessing, setIsProcessing] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [translatedText, setTranslatedText] = useState("");
    const [sacredTermCount, setSacredTermCount] = useState(0);
    const [vetted, setVetted] = useState(false);
    const [statusText, setStatusText] = useState("📡 Initializing internal stream…");
    const [streamError, setStreamError] = useState(null);

    const processingRef = useRef(false);
    const recorderRef = useRef(null);
    const translateTimeout = useRef(null);
    const captureIntervalRef = useRef(null);
    const sourceLangRef = useRef(sourceLang);
    const targetLangRef = useRef(targetLang);

    // Keep refs in sync with state
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
                setStatusText("📡 Live — Internal stream active");
            }
        } catch {
            // Silent fail
        }
    }, [streamId]);

    // ─── Transcribe audio chunk via server ───
    const transcribeChunk = useCallback(async (audioBlob) => {
        try {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result.split(",")[1]);
                reader.readAsDataURL(audioBlob);
            });
            const audioData = await base64Promise;

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

                // Trigger translation with debounce
                clearTimeout(translateTimeout.current);
                translateTimeout.current = setTimeout(() => {
                    translateSpeech(data.transcript);
                }, 200);
            }
        } catch {
            // Silent fail — will retry on next chunk
        }
    }, [streamId, translateSpeech]);

    // ─── Start/Stop Internal Stream Processing ───
    const startProcessing = useCallback(() => {
        if (processingRef.current) return;

        // If no mediaStream yet, request capture from parent
        if (!mediaStream) {
            onStartCapture?.();
            setStatusText("📡 Connecting to internal audio buffer…");
            return;
        }

        try {
            // Create MediaRecorder on the internal capture stream
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus"
                : "audio/webm";

            const recorder = new MediaRecorder(mediaStream, {
                mimeType,
                audioBitsPerSecond: 16000,
            });

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    transcribeChunk(event.data);
                }
            };

            recorder.onerror = () => {
                setStreamError("Internal stream recording error");
            };

            // Record in 3-second chunks for real-time processing
            recorder.start(3000);
            recorderRef.current = recorder;
            processingRef.current = true;
            setIsProcessing(true);
            setStreamError(null);
            setStatusText("📡 Live — Processing internal audio stream");
        } catch (err) {
            setStreamError("Failed to start stream processing: " + err.message);
        }
    }, [mediaStream, onStartCapture, transcribeChunk]);

    const stopProcessing = useCallback(() => {
        processingRef.current = false;
        setIsProcessing(false);
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            try { recorderRef.current.stop(); } catch { }
        }
        recorderRef.current = null;
        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }
        setStatusText("📡 Stream paused");
    }, []);

    // ─── Auto-start when enabled and mediaStream is available ───
    useEffect(() => {
        if (enabled && mediaStream && !processingRef.current) {
            // Small delay to let audio context initialize
            const timer = setTimeout(() => startProcessing(), 500);
            return () => clearTimeout(timer);
        }
    }, [enabled, mediaStream, startProcessing]);

    // ─── Auto-request capture when enabled ───
    useEffect(() => {
        if (enabled && !mediaStream && !isYouTubeMode) {
            onStartCapture?.();
        }
    }, [enabled, mediaStream, isYouTubeMode, onStartCapture]);

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
            if (captureIntervalRef.current) {
                clearInterval(captureIntervalRef.current);
            }
        };
    }, []);

    // ─── Re-translate when target language changes ───
    useEffect(() => {
        if (transcript) {
            translateSpeech(transcript);
        }
    }, [targetLang]);

    // ─── Restart processing when source language changes ───
    useEffect(() => {
        if (processingRef.current && mediaStream) {
            stopProcessing();
            setTimeout(() => startProcessing(), 300);
        }
    }, [sourceLang]);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    {/* Stream Status Indicator — replaces old mic button */}
                    <div
                        className={`subtitle-stream-indicator ${isProcessing ? "active" : ""}`}
                        title={isProcessing ? "Internal stream active" : "Stream inactive"}
                    >
                        <span className="subtitle-stream-icon">
                            {isProcessing ? "📡" : "⏸"}
                        </span>
                        <span className="subtitle-stream-label">
                            {isProcessing ? "LIVE" : "PAUSED"}
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

                    {/* No-Mic Badge — Directive 011 sovereignty indicator */}
                    <div className="subtitle-no-mic-badge" title="No microphone needed — internal stream">
                        🚫🎙️
                    </div>

                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">✕</button>
                </div>

                {/* Live Subtitle Display — 2-Line Overlay */}
                <div className="subtitle-cue-container">
                    {isYouTubeMode && !mediaStream ? (
                        <div className="subtitle-youtube-notice">
                            <span className="subtitle-youtube-icon">⚠️</span>
                            <span>YouTube cross-origin audio — subtitles via Sovereign Proxy (coming soon)</span>
                        </div>
                    ) : streamError || captureError ? (
                        <div className="subtitle-error">{streamError || captureError}</div>
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
                .subtitle-youtube-notice {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: rgba(255, 200, 50, 0.9);
                    padding: 8px 12px;
                    background: rgba(255, 200, 50, 0.08);
                    border-radius: 8px;
                }
                .subtitle-youtube-icon {
                    font-size: 18px;
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
