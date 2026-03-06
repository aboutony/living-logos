"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * SubtitleOverlay — Directives 011, 012, 013, 016 & 018
 *
 * 011: Internal digital audio stream processing, no microphone
 * 012: Zero-click activation on first user interaction
 * 013: Real-Time Sync with timestamped cues + RTL auto-detection
 * 016: Sacred Glossary Enforcement, 50% font increase, anti-loop real-time sync
 * 018: Hardware-locked — 0% functional without live audio feed.
 *      Tied to HTMLMediaElement.currentTime. Pause → idle + clear.
 *
 * RTL Languages: Arabic (ar), Persian (fa), Hebrew (he), Urdu (ur)
 * Automatically applies `direction: rtl` and `text-align: right` for these.
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
    mediaStream,
    captureError,
    onStartCapture,
    isYouTubeMode,
    hasInteracted,
    isPlaying = false, // Directive 018: hardware-lock to video state
}) {
    const [sourceLang, setSourceLang] = useState("el");
    const [targetLang, setTargetLang] = useState("en");
    const [isProcessing, setIsProcessing] = useState(false);
    // Directive 013: Timestamped cue state
    const [currentCue, setCurrentCue] = useState(null);
    const [translatedText, setTranslatedText] = useState("");
    const [sacredTermCount, setSacredTermCount] = useState(0);
    const [vetted, setVetted] = useState(false);
    const [statusText, setStatusText] = useState("📡 Waiting for first interaction…");
    const [cueVisible, setCueVisible] = useState(false);
    const [sceneDesc, setSceneDesc] = useState("");

    const processingRef = useRef(false);
    const recorderRef = useRef(null);
    const translateTimeout = useRef(null);
    const periodicTimerRef = useRef(null);
    const sourceLangRef = useRef(sourceLang);
    const targetLangRef = useRef(targetLang);
    const cueTimerRef = useRef(null);
    const lastCueIdRef = useRef(null);
    const tabStreamRef = useRef(null);
    const [hasTabStream, setHasTabStream] = useState(false);

    useEffect(() => { sourceLangRef.current = sourceLang; }, [sourceLang]);
    useEffect(() => { targetLangRef.current = targetLang; }, [targetLang]);

    // Directive 013: RTL detection
    const isTargetRTL = RTL_CODES.has(targetLang);
    const isSourceRTL = RTL_CODES.has(sourceLang);

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
            // Silent fail — will retry on next cue
        }
    }, [streamId]);

    // ─── Directive 013: Process timestamped transcription cue ───
    const processTranscriptionCue = useCallback((transcript, cue) => {
        // Deduplicate: skip if same cue
        if (cue && cue.id === lastCueIdRef.current) return;
        if (cue) lastCueIdRef.current = cue.id;

        // Fade in the new cue
        setCueVisible(false);
        setTimeout(() => {
            setCurrentCue({ text: transcript, ...(cue || {}) });
            if (cue?.scene) setSceneDesc(cue.scene);
            setCueVisible(true);

            // Directive 016: Auto-clear after cue duration — no looping
            // When cue expires, clear the display completely
            clearTimeout(cueTimerRef.current);
            const displayDuration = (cue?.duration || 5) * 1000;
            cueTimerRef.current = setTimeout(() => {
                setCueVisible(false);
                // Directive 016: Clear stale content after fade
                setTimeout(() => {
                    setCurrentCue(null);
                    setTranslatedText("");
                }, 400);
            }, displayDuration - 500); // fade slightly before next cue
        }, 150); // brief gap for fade transition

        // Trigger translation
        clearTimeout(translateTimeout.current);
        translateTimeout.current = setTimeout(() => {
            translateSpeech(transcript);
        }, 100);
    }, [translateSpeech]);

    // ─── Directive 018: Transcribe ONLY with real audio data ───
    const transcribeAndTranslate = useCallback(async (audioBlob) => {
        // D018: Hard requirement — no audio blob = no transcription
        if (!audioBlob || audioBlob.size === 0) return;
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
                processTranscriptionCue(data.transcript, data.cue || null);
            }
        } catch {
            // Silent — will retry on next real chunk
        }
    }, [streamId, processTranscriptionCue]);

    // ─── Start MediaRecorder (ONLY path — real audio or nothing) ───
    const startRecorderProcessing = useCallback(() => {
        if (!mediaStream || processingRef.current) return;
        try {
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(mediaStream, { mimeType, audioBitsPerSecond: 16000 });
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) transcribeAndTranslate(event.data);
            };
            recorder.start(3000); // 3-second chunks sent to Whisper
            recorderRef.current = recorder;
            processingRef.current = true;
            setIsProcessing(true);
            setStatusText("📡 Live — Whisper STT processing audio");
        } catch (err) {
            console.error("[SubtitleOverlay] MediaRecorder error:", err);
        }
    }, [mediaStream, transcribeAndTranslate]);

    // D018: PURGED — startPeriodicProcessing DELETED (was the simulation loop)

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

    // ─── YouTube Tab Audio Capture (cross-origin workaround) ───
    const startTabRecorderProcessing = useCallback(() => {
        if (!tabStreamRef.current || processingRef.current) return;
        try {
            const audioTracks = tabStreamRef.current.getAudioTracks();
            if (audioTracks.length === 0) {
                setStatusText("⚠ No audio track — ensure 'Share audio' is checked");
                return;
            }
            const audioStream = new MediaStream(audioTracks);
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                ? "audio/webm;codecs=opus" : "audio/webm";
            const recorder = new MediaRecorder(audioStream, { mimeType, audioBitsPerSecond: 16000 });
            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) transcribeAndTranslate(event.data);
            };
            recorder.start(3000);
            recorderRef.current = recorder;
            processingRef.current = true;
            setIsProcessing(true);
            setStatusText("📡 Live — Whisper STT processing YouTube audio");
        } catch (err) {
            console.error("[SubtitleOverlay] Tab recorder error:", err);
            setStatusText("⚠ Failed to process tab audio");
        }
    }, [transcribeAndTranslate]);

    const handleYouTubeCapture = useCallback(async () => {
        try {
            setStatusText("📡 Requesting tab audio access…");
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
                preferCurrentTab: true,
            });
            tabStreamRef.current = stream;
            setHasTabStream(true);
            // Listen for track end (user revokes sharing)
            stream.getAudioTracks().forEach(track => {
                track.onended = () => {
                    tabStreamRef.current = null;
                    setHasTabStream(false);
                    stopProcessing();
                    setStatusText("🔊 Tab sharing ended — tap to re-enable");
                };
            });
            setTimeout(() => startTabRecorderProcessing(), 300);
        } catch (err) {
            console.error("[SubtitleOverlay] Tab capture denied:", err);
            setStatusText("⚠ Permission denied — tap to retry");
        }
    }, [startTabRecorderProcessing, stopProcessing]);

    // ─── Directive 018: Hardware-lock to video play state ───
    // When paused: stop recorder, clear display instantly
    // When playing: restart recorder from current audio point
    useEffect(() => {
        if (!enabled) return;

        if (!isPlaying) {
            // VIDEO PAUSED → instant idle + clear
            stopProcessing();
            setCueVisible(false);
            setCurrentCue(null);
            setTranslatedText("");
            setSceneDesc("");
            setStatusText("⏸ Paused — Subtitle engine idle");
            return;
        }

        // VIDEO PLAYING → attempt to start recorder
        if (!hasInteracted) return;

        if (isYouTubeMode) {
            // YouTube cross-origin: use tab audio capture via getDisplayMedia
            if (tabStreamRef.current) {
                const timer = setTimeout(() => startTabRecorderProcessing(), 300);
                return () => clearTimeout(timer);
            }
            setStatusText("🔊 Tap below to enable live YouTube subtitles");
            return;
        }

        if (mediaStream) {
            const timer = setTimeout(() => startRecorderProcessing(), 300);
            return () => clearTimeout(timer);
        } else {
            onStartCapture?.();
            setStatusText("📡 Connecting to internal audio buffer…");
        }
    }, [enabled, isPlaying, hasInteracted, mediaStream, isYouTubeMode, startRecorderProcessing, startTabRecorderProcessing, onStartCapture, stopProcessing]);

    // ─── Stop when disabled ───
    useEffect(() => { if (!enabled) stopProcessing(); }, [enabled, stopProcessing]);

    // ─── Cleanup ───
    useEffect(() => {
        return () => {
            processingRef.current = false;
            if (recorderRef.current && recorderRef.current.state !== "inactive") {
                try { recorderRef.current.stop(); } catch { }
            }
            clearTimeout(translateTimeout.current);
            clearTimeout(cueTimerRef.current);
            if (periodicTimerRef.current) clearInterval(periodicTimerRef.current);
            if (tabStreamRef.current) {
                tabStreamRef.current.getTracks().forEach(t => t.stop());
                tabStreamRef.current = null;
            }
        };
    }, []);

    // ─── Re-translate on target language change ───
    useEffect(() => {
        if (currentCue?.text) translateSpeech(currentCue.text);
    }, [targetLang]);

    // ─── Restart processing on source language change ───
    useEffect(() => {
        if (processingRef.current) stopProcessing();
    }, [sourceLang, stopProcessing]);

    if (!enabled) return null;

    return (
        <div className="subtitle-overlay">
            <div className="subtitle-overlay-inner">
                {/* Controls Bar */}
                <div className="subtitle-header">
                    <div
                        className={`subtitle-stream-indicator ${isProcessing ? "active" : ""}`}
                        title={isProcessing ? "Internal stream active" : "Waiting for interaction"}
                    >
                        <span className="subtitle-stream-icon">{isProcessing ? "📡" : "⏳"}</span>
                        <span className="subtitle-stream-label">{isProcessing ? "LIVE" : "READY"}</span>
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
                    <div className="subtitle-no-mic-badge" title="No microphone — internal stream">🚫🎙️</div>
                    <button className="subtitle-close" onClick={onClose} aria-label="Close subtitles">✕</button>
                </div>

                {/* Directive 013: Live Subtitle Display — Timestamped Cues + RTL */}
                <div className={`subtitle-cue-container ${cueVisible ? "cue-visible" : "cue-hidden"}`}>
                    {captureError ? (
                        <div className="subtitle-error">{captureError}</div>
                    ) : currentCue ? (
                        <>
                            {/* Original text (source language direction) */}
                            <div
                                className="subtitle-original"
                                style={{
                                    direction: isSourceRTL ? "rtl" : "ltr",
                                    textAlign: isSourceRTL ? "right" : "left",
                                }}
                            >
                                {currentCue.text}
                            </div>

                            {/* Translated text (target language direction) */}
                            {translatedText ? (
                                <div
                                    className="subtitle-translated"
                                    style={{
                                        direction: isTargetRTL ? "rtl" : "ltr",
                                        textAlign: isTargetRTL ? "right" : "left",
                                    }}
                                >
                                    {renderSubtitleText(translatedText)}
                                </div>
                            ) : (
                                <div className="subtitle-translated subtitle-translating">Translating…</div>
                            )}

                            {/* Directive 013: Scene description + sacred term count */}
                            <div className="subtitle-meta-row">
                                {sceneDesc && (
                                    <span className="subtitle-scene">🎬 {sceneDesc}</span>
                                )}
                                {sacredTermCount > 0 && (
                                    <span className="subtitle-sacred-note">
                                        🔒 {sacredTermCount} sacred term{sacredTermCount > 1 ? "s" : ""} locked
                                    </span>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="subtitle-status">
                            {statusText}
                            {isYouTubeMode && !hasTabStream && !isProcessing && (
                                <button className="yt-capture-btn" onClick={handleYouTubeCapture}>
                                    🔊 Enable Live Subtitles
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sovereignty Badge */}
                <div className="subtitle-sovereignty-badge">
                    <span>🛡️ Internal Audio — No Microphone Required</span>
                    {currentCue?.startTime != null && (
                        <span className="subtitle-timestamp">
                            ⏱ {formatTimestamp(currentCue.startTime)}–{formatTimestamp(currentCue.endTime)}
                        </span>
                    )}
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

                /* ── Directive 013+016: Cue Container with Fade Transitions ── */
                .subtitle-cue-container {
                    padding: 6px 0;
                    min-height: 52px;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                }
                .subtitle-cue-container.cue-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
                .subtitle-cue-container.cue-hidden {
                    opacity: 0.3;
                    transform: translateY(2px);
                }
                .subtitle-original {
                    font-size: 18px;
                    color: rgba(255, 255, 255, 0.5);
                    font-style: italic;
                    margin-bottom: 3px;
                    line-height: 1.4;
                    transition: direction 0.3s;
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
                .subtitle-translating {
                    opacity: 0.4;
                    font-style: italic;
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
                .yt-capture-btn {
                    display: block;
                    margin: 10px auto 0;
                    padding: 10px 24px;
                    background: linear-gradient(135deg, rgba(212, 168, 83, 0.2), rgba(212, 168, 83, 0.1));
                    border: 1px solid rgba(212, 168, 83, 0.4);
                    border-radius: 8px;
                    color: var(--color-gold, #d4a853);
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    min-height: 44px;
                }
                .yt-capture-btn:hover {
                    background: linear-gradient(135deg, rgba(212, 168, 83, 0.3), rgba(212, 168, 83, 0.15));
                    border-color: rgba(212, 168, 83, 0.6);
                    transform: scale(1.02);
                }
                .yt-capture-btn:active {
                    transform: scale(0.98);
                }

                /* ── Directive 013: Scene Description & Meta Row ── */
                .subtitle-meta-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 4px;
                    flex-wrap: wrap;
                }
                .subtitle-scene {
                    font-size: 10px;
                    color: rgba(212, 168, 83, 0.5);
                    font-style: italic;
                }
                .subtitle-sacred-note {
                    font-size: 10px;
                    color: rgba(34, 197, 94, 0.6);
                }

                /* ── Sovereignty Badge with Timestamp ── */
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
                .subtitle-timestamp {
                    font-variant-numeric: tabular-nums;
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 9px;
                }

                @keyframes streamPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
                    50% { box-shadow: 0 0 8px 2px rgba(220, 38, 38, 0.3); }
                }
                @media (max-width: 768px) {
                    .subtitle-overlay { bottom: 48px; }
                    .subtitle-overlay-inner { margin: 0 4px; padding: 6px 8px; }
                    .subtitle-original { font-size: 15px; }
                    .subtitle-translated { font-size: 21px; }
                    .subtitle-scene { display: none; }
                }
            `}</style>
        </div>
    );
}

// Directive 013: Format seconds → MM:SS
function formatTimestamp(seconds) {
    if (seconds == null || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
