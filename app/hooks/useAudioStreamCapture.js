"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useAudioStreamCapture — Directives 011 & 012
 *
 * Atomic 04.5: ScriptProcessorNode PCM Tap
 *
 * Intercepts the internal audio buffer of a <video> or <audio> element
 * using the Web Audio API. Instead of MediaRecorder (which triggers
 * browser security popups), uses ScriptProcessorNode to directly
 * collect raw PCM float values.
 *
 * Returns flushAudioBuffer() which provides accumulated PCM as
 * Float32Array for the caller to encode and POST.
 *
 * NO MediaRecorder. NO captureStream. NO browser popups.
 */
export default function useAudioStreamCapture(mediaElementRef, hasInteracted = false) {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);
    const [needsInteraction, setNeedsInteraction] = useState(false);

    const audioCtxRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const scriptNodeRef = useRef(null);
    const connectedRef = useRef(false);
    const pendingStartRef = useRef(false);

    // Atomic 04.5: PCM accumulator — raw Float32 samples collected in onaudioprocess
    const pcmChunksRef = useRef([]);
    const pcmSampleCountRef = useRef(0);

    /**
     * flushAudioBuffer — Returns all accumulated PCM samples as a single
     * Float32Array and clears the buffer. Called every 3s by SubtitleOverlay.
     * Returns null if no data accumulated.
     */
    const flushAudioBuffer = useCallback(() => {
        const chunks = pcmChunksRef.current;
        const totalSamples = pcmSampleCountRef.current;

        if (chunks.length === 0 || totalSamples === 0) return null;

        // Merge all chunks into a single Float32Array
        const merged = new Float32Array(totalSamples);
        let offset = 0;
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        // Clear the buffer
        pcmChunksRef.current = [];
        pcmSampleCountRef.current = 0;

        return { samples: merged, sampleRate: audioCtxRef.current?.sampleRate || 44100 };
    }, []);

    /**
     * _asyncCaptureWork — Deferred async portion.
     * Creates MediaElementSource + ScriptProcessorNode after context is running.
     */
    const _asyncCaptureWork = useCallback(async (ctx) => {
        const el = mediaElementRef?.current;
        if (!el) {
            pendingStartRef.current = true;
            return;
        }

        try {
            // Guard — context must be running
            if (ctx.state !== "running") {
                setNeedsInteraction(true);
                setError("Ready \u2014 Tap to Start");
                pendingStartRef.current = true;
                return;
            }

            // Create MediaElementSource (only once)
            if (!sourceNodeRef.current) {
                sourceNodeRef.current = ctx.createMediaElementSource(el);
                connectedRef.current = true;
            }

            // Atomic 04.5: Create ScriptProcessorNode(4096, 1, 1)
            if (!scriptNodeRef.current) {
                const scriptNode = ctx.createScriptProcessor(4096, 1, 1);
                scriptNode.onaudioprocess = (e) => {
                    // Collect raw PCM float values from input buffer
                    const inputData = e.inputBuffer.getChannelData(0);
                    // Copy the data (inputData is recycled by the browser)
                    const chunk = new Float32Array(inputData.length);
                    chunk.set(inputData);
                    pcmChunksRef.current.push(chunk);
                    pcmSampleCountRef.current += chunk.length;
                };
                scriptNodeRef.current = scriptNode;
            }

            const source = sourceNodeRef.current;
            const scriptNode = scriptNodeRef.current;

            try { source.disconnect(); } catch { /* not connected yet */ }

            // Connect: source → scriptProcessor → ctx.destination
            // Audio still plays through speakers AND we tap the PCM data
            source.connect(scriptNode);
            scriptNode.connect(ctx.destination);

            setIsCapturing(true);
            setNeedsInteraction(false);
            setError(null);
            pendingStartRef.current = false;

            // Clear any stale PCM data
            pcmChunksRef.current = [];
            pcmSampleCountRef.current = 0;

            console.log("[AudioStreamCapture] 04.5 — ScriptProcessorNode PCM tap active");
        } catch (err) {
            console.error("[AudioStreamCapture] Failed:", err);
            setError("Ready \u2014 Tap to Start");
            setIsCapturing(false);
        }
    }, [mediaElementRef]);

    /**
     * startCapture — Atomic 04.3+04.5: Synchronous "Gesture-First" Handler
     *
     * Step 1 (Immediate): audioCtx.resume()
     * Step 2 (Immediate): Play 0.1s silent buffer to prime browser
     * Step 3 (Deferred):  Async capture work (ScriptProcessorNode setup)
     */
    const startCapture = useCallback(() => {
        const el = mediaElementRef?.current;
        if (!el) {
            pendingStartRef.current = true;
            return;
        }

        // Already capturing — no-op
        if (connectedRef.current && isCapturing) {
            return;
        }

        // Step 0: Ensure AudioContext exists
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;

        // Step 1 (IMMEDIATE): Resume
        const resumePromise = ctx.resume();
        console.log("[AudioStreamCapture] 04.5 — audioCtx.resume() fired");

        // Step 2 (IMMEDIATE): Play 0.1s silent buffer to prime
        try {
            const silentBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.1), ctx.sampleRate);
            const silentSource = ctx.createBufferSource();
            silentSource.buffer = silentBuffer;
            silentSource.connect(ctx.destination);
            silentSource.start(0);
            silentSource.onended = () => { try { silentSource.disconnect(); } catch {} };
        } catch (primeErr) {
            console.warn("[AudioStreamCapture] 04.5 — Silent buffer prime failed:", primeErr);
        }

        // Step 3 (DEFERRED): ScriptProcessorNode setup
        resumePromise
            .then(() => {
                console.log("[AudioStreamCapture] 04.5 — Context running, creating ScriptProcessor tap");
                return _asyncCaptureWork(ctx);
            })
            .catch(() => {
                setNeedsInteraction(true);
                setError("Ready \u2014 Tap to Start");
                pendingStartRef.current = true;
            });
    }, [mediaElementRef, isCapturing, _asyncCaptureWork]);

    /**
     * cleanupAudio — Disconnect ScriptProcessorNode, clear PCM buffer.
     */
    const cleanupAudio = useCallback(() => {
        try {
            if (scriptNodeRef.current) {
                try { scriptNodeRef.current.disconnect(); } catch {}
                scriptNodeRef.current.onaudioprocess = null;
                scriptNodeRef.current = null;
            }
            // Reconnect source directly to destination so audio keeps playing
            if (sourceNodeRef.current && audioCtxRef.current) {
                try {
                    sourceNodeRef.current.disconnect();
                    sourceNodeRef.current.connect(audioCtxRef.current.destination);
                } catch {}
            }
        } catch (err) {
            console.error("[AudioStreamCapture] cleanupAudio error:", err);
        }
        // Clear PCM buffer
        pcmChunksRef.current = [];
        pcmSampleCountRef.current = 0;
        setIsCapturing(false);
        console.log("[AudioStreamCapture] cleanupAudio — ScriptProcessor disconnected, PCM buffer cleared");
    }, []);

    const stopCapture = useCallback(() => {
        cleanupAudio();
    }, [cleanupAudio]);

    // Directive 012: Auto-resume when user interacts
    useEffect(() => {
        if (hasInteracted) {
            setNeedsInteraction(false);
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume().catch(() => {});
            }
            if (pendingStartRef.current) {
                startCapture();
            }
        }
    }, [hasInteracted, startCapture]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try {
                if (scriptNodeRef.current) {
                    scriptNodeRef.current.onaudioprocess = null;
                    scriptNodeRef.current.disconnect();
                }
                if (sourceNodeRef.current) {
                    sourceNodeRef.current.disconnect();
                }
                if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
                    audioCtxRef.current.close();
                }
            } catch {
                // Silent cleanup
            }
            connectedRef.current = false;
            pcmChunksRef.current = [];
            pcmSampleCountRef.current = 0;
        };
    }, []);

    return {
        /** Whether ScriptProcessor is actively tapping audio */
        isCapturing,
        error,
        /** Whether AudioContext is blocked waiting for user gesture */
        needsInteraction,
        /** Atomic 04.3+04.5: Synchronous gesture-first start */
        startCapture,
        stopCapture,
        /** Atomic 04.5: Flush accumulated PCM → Float32Array */
        flushAudioBuffer,
        /** Cleanup for pause/unmount */
        cleanupAudio,
        /** Atomic 04.4: Direct audioCtx ref for parent synchronous resume */
        audioCtxRef,
    };
}
