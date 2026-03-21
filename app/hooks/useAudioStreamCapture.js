"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useAudioStreamCapture — Directives 011 & 012
 *
 * Intercepts the internal audio buffer of a <video> or <audio> element
 * using the Web Audio API. Returns a MediaStream that represents the
 * decoded PCM audio — NO microphone needed.
 *
 * Atomic 04.1: Gesture-Locked Initialization
 * - AudioContext created in suspended state
 * - ctx.resume() is AWAITED inside the user gesture callstack
 * - createMediaElementSource only runs after context is confirmed "running"
 * - On failure: error = "Ready — Tap to Start" (no hang)
 */
export default function useAudioStreamCapture(mediaElementRef, hasInteracted = false) {
    const [captureStream, setCaptureStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);
    const [needsInteraction, setNeedsInteraction] = useState(false);

    const audioCtxRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const destinationRef = useRef(null);
    const connectedRef = useRef(false);
    const pendingStartRef = useRef(false);

    // ─── Atomic 04.3: Synchronous Gesture-First Handler ───
    // NON-ASYNC wrapper ensures audioCtx.resume() is called as the
    // VERY FIRST synchronous operation inside the user gesture callstack.
    // A 0.1s silent buffer "primes" the browser before async capture begins.

    /**
     * _asyncCaptureWork — The deferred async portion.
     * Only called AFTER resume() + silent buffer have already run synchronously.
     */
    const _asyncCaptureWork = useCallback(async (ctx) => {
        const el = mediaElementRef?.current;
        if (!el) {
            pendingStartRef.current = true;
            return;
        }

        try {
            // Guard — context must be running after the synchronous prime
            if (ctx.state !== "running") {
                setNeedsInteraction(true);
                setError("Ready \u2014 Tap to Start");
                pendingStartRef.current = true;
                return;
            }

            // The Internal Tap — only after context is confirmed running
            if (!sourceNodeRef.current) {
                sourceNodeRef.current = ctx.createMediaElementSource(el);
                connectedRef.current = true;
            }

            if (!destinationRef.current) {
                destinationRef.current = ctx.createMediaStreamDestination();
            }

            const source = sourceNodeRef.current;
            const destination = destinationRef.current;

            try { source.disconnect(); } catch { /* not connected yet */ }

            // Connect: source → speakers (so user still hears audio)
            source.connect(ctx.destination);
            // Connect: source → capture stream (for transcription)
            source.connect(destination);

            setCaptureStream(destination.stream);
            setIsCapturing(true);
            setNeedsInteraction(false);
            setError(null);
            pendingStartRef.current = false;
            console.log("[AudioStreamCapture] Internal tap active \u2014 capture stream ready");
        } catch (err) {
            console.error("[AudioStreamCapture] Failed:", err);
            setError("Ready \u2014 Tap to Start");
            setIsCapturing(false);
        }
    }, [mediaElementRef]);

    /**
     * startCapture — Atomic 04.3: Synchronous "Gesture-First" Handler
     *
     * Step 1 (Immediate): audioCtx.resume() — MUST be the first line.
     * Step 2 (Immediate): Play a 0.1s silent buffer to prime the browser.
     * Step 3 (Deferred):  Only then kick off async _asyncCaptureWork().
     */
    const startCapture = useCallback(() => {
        const el = mediaElementRef?.current;
        if (!el) {
            pendingStartRef.current = true;
            return;
        }

        // Prevent double-creation of MediaElementSource
        if (connectedRef.current && captureStream) {
            setIsCapturing(true);
            return;
        }

        // ── Step 0: Ensure AudioContext exists ──
        if (!audioCtxRef.current) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;

        // ── Step 1 (IMMEDIATE): Resume — MUST be synchronous, first call ──
        const resumePromise = ctx.resume();
        console.log("[AudioStreamCapture] 04.3 — audioCtx.resume() fired (synchronous gesture callstack)");

        // ── Step 2 (IMMEDIATE): Play 0.1s silent buffer to "prime" the browser ──
        try {
            const silentBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.1), ctx.sampleRate);
            const silentSource = ctx.createBufferSource();
            silentSource.buffer = silentBuffer;
            silentSource.connect(ctx.destination);
            silentSource.start(0);
            silentSource.onended = () => { try { silentSource.disconnect(); } catch {} };
            console.log("[AudioStreamCapture] 04.3 — Silent buffer primed (0.1s)");
        } catch (primeErr) {
            console.warn("[AudioStreamCapture] 04.3 — Silent buffer prime failed:", primeErr);
        }

        // ── Step 3 (DEFERRED): Async capture ONLY after resume resolves ──
        resumePromise
            .then(() => {
                console.log("[AudioStreamCapture] 04.3 — AudioContext confirmed running, starting capture");
                return _asyncCaptureWork(ctx);
            })
            .catch(() => {
                setNeedsInteraction(true);
                setError("Ready \u2014 Tap to Start");
                pendingStartRef.current = true;
                console.warn("[AudioStreamCapture] 04.3 — resume() rejected \u2014 needs gesture");
            });
    }, [mediaElementRef, captureStream, _asyncCaptureWork]);

    // ─── Atomic 01.1: Explicit stream disposal ───
    const cleanupAudio = useCallback(() => {
        try {
            // Disconnect source from capture destination (keep speaker connection alive)
            if (sourceNodeRef.current && destinationRef.current) {
                try { sourceNodeRef.current.disconnect(destinationRef.current); } catch { /* already disconnected */ }
            }
            // Stop all tracks on the capture stream to fully destroy it
            if (destinationRef.current?.stream) {
                destinationRef.current.stream.getTracks().forEach(t => t.stop());
            }
            // Null the destination so startCapture creates a fresh one
            destinationRef.current = null;
        } catch (err) {
            console.error("[AudioStreamCapture] cleanupAudio error:", err);
        }
        // State reset — prevents "Cannot call write on destroyed stream"
        setCaptureStream(null);
        setIsCapturing(false);
        console.log("[AudioStreamCapture] cleanupAudio \u2014 stream disposed & nulled");
    }, []);

    const stopCapture = useCallback(() => {
        cleanupAudio();
    }, [cleanupAudio]);

    // Directive 012: Auto-resume when user interacts
    useEffect(() => {
        if (hasInteracted) {
            setNeedsInteraction(false);

            // Resume suspended AudioContext
            if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
                audioCtxRef.current.resume().catch(() => { });
            }

            // If we had a pending start, try now
            if (pendingStartRef.current) {
                startCapture();
            }
        }
    }, [hasInteracted, startCapture]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try {
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
        };
    }, []);

    return {
        captureStream,
        isCapturing,
        error,
        /** Whether AudioContext is blocked waiting for user gesture */
        needsInteraction,
        startCapture,
        stopCapture,
        /** Atomic 01.1: Explicit disposal for pause/unmount */
        cleanupAudio,
        /** Atomic 04.4: Exposed ref so parent can call resume() synchronously */
        audioCtxRef,
    };
}
