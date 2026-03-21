"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SubtitleOverlay — Directives 011, 012, 013, 016 & 018 + Atomic 07
 *
 * 011: Internal digital audio stream processing, no microphone
 * 012: Zero-click activation on first user interaction
 * 013: Real-Time Sync with timestamped cues + RTL auto-detection
 * 016: Sacred Glossary Enforcement, 50% font increase, anti-loop real-time sync
 * 018: Hardware-locked — 0% functional without live audio feed.
 *      Tied to HTMLMediaElement.currentTime. Pause → idle + clear.
 *
 * Atomic 07: Shadow Player — server-side headless audio extraction.
 *            ffmpeg runs on the server, decodes the stream audio,
 *            pipes to Whisper → GPT translation → SSE events.
 *            Client is PURE RENDERER. No AudioContext. No ScriptProcessor.
 *            Synchronous connectRelay() called from SovereignPlayer.handleStart().
 *            Status: "📡 SOVEREIGN" instantly on click.
 *
 * RTL Languages: Arabic (ar), Persian (fa), Hebrew (he), Urdu (ur)
 */

const LANGUAGES = [
    { code: "el", name: "Greek", flag: "🇬🇷" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "ar", name: "Arabic", flag: "🇱🇧", rtl: true },
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
    { code: "fa", name: "Persian", flag: "🇮🇷", rtl: true },
    { code: "he", name: "Hebrew", flag: "🇮🇱", rtl: true },
    { code: "ur", name: "Urdu", flag: "🇵🇰", rtl: true },
    { code: "id", name: "Indonesian", flag: "🇮🇩" },
    { code: "tl", name: "Tagalog", flag: "🇵🇭" },
];

const RTL_CODES = new Set(["ar", "fa", "he", "ur"]);

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
    streamUrl,        // Atomic 07: The original media URL — server uses this for ffmpeg extraction
    captureError,
    isYouTubeMode,
    hasInteracted,
    isPlaying = false, // Directive 018: hardware-lock to video state
    connectRef,        // Atomic 07: Ref for synchronous SSE activation from parent
}) {
    const [sourceLang, setSourceLang] = useState("el");
    const [targetLang, setTargetLang] = useState("en");
    const [isProcessing, setIsProcessing] = useState(false);
    const [cueQueue, setCueQueue] = useState([]);
    const [sacredTermCount, setSacredTermCount] = useState(0);
    const [vetted, setVetted] = useState(false);
    const [statusText, setStatusText] = useState("📡 Shadow Player ready");

    const eventSourceRef = useRef(null);
    const sourceLangRef = useRef(sourceLang);
    const targetLangRef = useRef(targetLang);

    useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
    useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);

    const isTargetRTL = RTL_CODES.has(targetLang);
    const isSourceRTL = RTL_CODES.has(sourceLang);

    // ─── Atomic 07: connectRelay — called synchronously from handleStart() ───
    // Server-side ffmpeg extracts audio from streamUrl, pipes to Whisper, streams SSE back.
    // No AudioContext. No ScriptProcessor. Pure server-side shadow rendering.
    const connectRelay = useCallback(() => {
        if (!streamUrl) return;

        // Close existing connection
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (window.livingLogosSSE) {
            window.livingLogosSSE.close();
        }

        const params = new URLSearchParams({
            streamUrl,
            sourceLang: sourceLangRef.current,
            targetLang: targetLangRef.current,
            streamId: streamId || "",
        });
        const sseUrl = `/api/ai/transcribe/stream?${params.toString()}`;
        console.log("[SubtitleOverlay] 07 — Shadow Player SSE connect:", sseUrl);

        // SYNCHRONOUS: EventSource opens immediately on the click event
        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;
        window.livingLogosSSE = es;

        // Immediately set SOVEREIGN — no "Connecting..." state possible
        setIsProcessing(true);
        setStatusText("📡 SOVEREIGN — Shadow rendering active");

        es.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "status":
                        setStatusText(data.message || "📡 SOVEREIGN");
                        setIsProcessing(true);
                        break;

                    case "transcription": {
                        if (!data.success || !data.translatedText) break;

                        const cueId = data.cue?.id || Date.now();
                        const newCue = {
                            id: cueId,
                            text: data.transcript,
                            translated: data.translatedText,
                            timestamp: Date.now(),
                        };

                        setCueQueue(prev => [...prev.slice(-2), newCue]);
                        setStatusText("📡 SOVEREIGN — Live transcription");

                        if (data.sacredTerms?.length > 0) {
                            setSacredTermCount(data.sacredTerms.length);
                            setVetted(true);
                        }

                        // Auto-expire after 10s
                        setTimeout(() => {
                            setCueQueue(prev => prev.filter(c => c.id !== cueId));
                        }, 10000);
                        break;
                    }

                    case "vad":
                        break;

                    case "error":
                        console.error("[SubtitleOverlay] SSE error:", data.message);
                        setStatusText("⚠ " + (data.message || "Shadow error"));
                        break;

                    default:
                        break;
                }
            } catch (err) {
                console.error("[SubtitleOverlay] SSE parse error:", err);
            }
        };

        es.onerror = () => {
            console.warn("[SubtitleOverlay] Shadow SSE error/closed");
            setIsProcessing(false);
            setStatusText("📡 Reconnecting to Shadow Player…");
        };
    }, [streamUrl, streamId]);

    // ─── Disconnect ───
    const disconnectRelay = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (window.livingLogosSSE) {
            window.livingLogosSSE.close();
            window.livingLogosSSE = null;
        }
        setIsProcessing(false);
    }, []);

    // ─── Register connect/disconnect on parent ref ───
    useEffect(() => {
        if (connectRef) {
            connectRef.current = { connect: connectRelay, disconnect: disconnectRelay };
        }
    }, [connectRef, connectRelay, disconnectRelay]);

    // ─── Disconnect on pause or disable ───
    useEffect(() => {
        if (!isPlaying) {
            disconnectRelay();
            if (enabled) {
                setCueQueue([]);
                setStatusText("⏸ Paused — Shadow Player idle");
            }
        }
    }, [isPlaying, enabled, disconnectRelay]);

    useEffect(() => {
        if (!enabled) disconnectRelay();
    }, [enabled, disconnectRelay]);

    // ─── Reconnect on language change if connected ───
    useEffect(() => {
        if (isProcessing && eventSourceRef.current && streamUrl) {
            connectRelay();
        }
    }, [sourceLang, targetLang]); // eslint-disable-line react-hooks/exhaustive-deps

    // ─── Cleanup on unmount ───
    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
            if (window.livingLogosSSE) {
                window.livingLogosSSE.close();
                window.livingLogosSSE = null;
            }
        };
    }, []);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    <div
                        className={`subtitle-stream-indicator ${isProcessing ? "active" : ""}`}
                        title={isProcessing ? "Shadow Player active" : "Waiting for interaction"}
                    >
                        <span className="subtitle-stream-icon">{isProcessing ? "📡" : "⏳"}</span>
                        <span className="subtitle-stream-label">{isProcessing ? "SOVEREIGN" : "READY"}</span>
                    </div>

                    <div className="subtitle-lang-selector">
                        <label className="subtitle-lang-label">From</label>
                        <select
                            value={sourceLang}
                            onChange={(e) => setSourceLang(e.target.value)}
                            className="subtitle-lang-dropdown"
                        >
                            {LANGUAGES.map((l) => (
                                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
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
                                <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
                            ))}
                        </select>
                    </div>

                    {vetted && (
                        <div className="vetting-badge">
                            <span className="vetting-badge-icon">🛡️</span>
                            <span className="vetting-badge-text">Vetted ✓</span>
                        </div>
                    )}
                    <div className="glossary-lock-badge"><span>🔒</span></div>
                    {streamTier && <div className={`subtitle-tier-badge tier-${streamTier}`}>T{streamTier}</div>}
                    <div className="subtitle-no-mic-badge" title="Shadow Player — server-side audio extraction">🚫🎙️</div>
                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">✕</button>
                </div>

                {/* Directive 013: Live Subtitle Display */}
                <div className="subtitle-cue-container cue-visible">
                    {captureError ? (
                        <div className="subtitle-error">{captureError}</div>
                    ) : cueQueue.length > 0 ? (
                        <div className="subtitle-queue">
                            {cueQueue.map((cue, idx) => (
                                <div key={cue.id} className={`subtitle-queue-item ${idx === cueQueue.length - 1 ? 'latest' : 'older'}`}>
                                    <div
                                        className="subtitle-translated"
                                        style={{
                                            direction: (cue.translated ? isTargetRTL : isSourceRTL) ? "rtl" : "ltr",
                                            textAlign: (cue.translated ? isTargetRTL : isSourceRTL) ? "right" : "left",
                                        }}
                                    >
                                        {cue.translated ? renderSubtitleText(cue.translated) : cue.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="subtitle-status">
                            {statusText}
                        </div>
                    )}
                </div>

                {/* Sovereignty Badge */}
                <div className="subtitle-sovereignty-badge">
                    <span>🛡️ Shadow Player — Server-Side Audio Extraction</span>
                </div>
            </div>

            <style jsx>{`
                .subtitle-overlay {
                    position: absolute;
                    bottom: 52px;
                    left: 0;
                    right: 0;
                    z-index: 80;
                    pointer-events: auto;
                }
                .subtitle-overlay-inner {
                    margin: 0 8px;
                    padding: 8px 12px;
                    background: rgba(10, 22, 40, 0.92);
                    border: 1px solid rgba(212, 168, 83, 0.15);
                    border-radius: var(--radius-lg, 12px);
                    backdrop-filter: blur(12px);
                }
                .subtitle-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 6px;
                }
                .subtitle-stream-indicator {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px;
                    border-radius: 999px;
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
                .subtitle-stream-icon { font-size: 14px; }
                .subtitle-stream-label {
                    font-weight: 700;
                    font-size: 10px;
                    letter-spacing: 0.08em;
                    color: rgba(255, 255, 255, 0.9);
                }
                .subtitle-lang-selector { display: flex; align-items: center; gap: 4px; }
                .subtitle-lang-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                }
                .subtitle-lang-dropdown {
                    background: rgba(255, 255, 255, 0.08);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 12px;
                    cursor: pointer;
                    outline: none;
                }
                .subtitle-lang-dropdown:focus {
                    border-color: var(--color-gold, #d4a853);
                }
                .subtitle-arrow {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 14px;
                }
                .vetting-badge {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    padding: 2px 8px;
                    background: rgba(34, 197, 94, 0.12);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 999px;
                    font-size: 10px;
                    color: rgba(34, 197, 94, 0.9);
                }
                .vetting-badge-icon { font-size: 11px; }
                .vetting-badge-text { font-weight: 600; letter-spacing: 0.05em; }
                .glossary-lock-badge {
                    font-size: 12px;
                    opacity: 0.5;
                }
                .subtitle-tier-badge {
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    background: rgba(212, 168, 83, 0.2);
                    color: var(--color-gold, #d4a853);
                    border: 1px solid rgba(212, 168, 83, 0.3);
                }
                .subtitle-no-mic-badge {
                    font-size: 12px;
                    opacity: 0.7;
                    cursor: help;
                    margin-left: auto;
                }
                .subtitle-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 16px;
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }
                .subtitle-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                .subtitle-cue-container {
                    padding: 6px 0;
                    min-height: 52px;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                .subtitle-cue-container.cue-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .subtitle-queue {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .subtitle-queue-item {
                    padding: 4px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    animation: cueSlideIn 0.3s ease-out;
                    transition: opacity 0.4s ease;
                }
                .subtitle-queue-item.older { opacity: 0.45; }
                .subtitle-queue-item.latest { opacity: 1; }
                .subtitle-queue-item:last-child { border-bottom: none; }
                @keyframes cueSlideIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .subtitle-translated {
                    font-size: 24px;
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 500;
                    line-height: 1.4;
                    max-height: 3.0em;
                    overflow: hidden;
                    transition: direction 0.3s;
                }
                .subtitle-translated :global(.sacred-term) {
                    color: var(--color-gold, #d4a853);
                    font-weight: 700;
                }
                .subtitle-error {
                    color: rgba(239, 68, 68, 0.8);
                    font-size: 12px;
                }
                .subtitle-status {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 13px;
                    text-align: center;
                }
                .subtitle-sovereignty-badge {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 3px 0 0;
                    font-size: 9px;
                    letter-spacing: 0.06em;
                    color: rgba(212, 168, 83, 0.5);
                    text-transform: uppercase;
                }
                @keyframes streamPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                    50% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.3); }
                }
                @media (max-width: 768px) {
                    .subtitle-overlay { bottom: 48px; }
                    .subtitle-overlay-inner { margin: 0 4px; padding: 6px 8px; }
                    .subtitle-translated { font-size: 21px; }
                }
            `}</style>
        </div>
    );
}
