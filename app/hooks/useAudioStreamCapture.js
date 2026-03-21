"use client";

import { useRef, useCallback, useState } from "react";

/**
 * useAudioStreamCapture — Atomic 06: Same-Origin ScriptProcessor Tap
 *
 * Now that streams are proxied through /api/proxy (Same-Origin),
 * the browser allows Web Audio API access to the media element.
 *
 * Creates a ScriptProcessorNode that taps raw Float32 PCM samples
 * from the video/audio element. flushAudioBuffer() returns the
 * accumulated samples for SubtitleOverlay to send to Whisper.
 *
 * ZERO MediaRecorder. ZERO getDisplayMedia. ZERO browser popups.
 */
export default function useAudioStreamCapture() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const audioCtxRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const processorRef = useRef(null);
    const bufferRef = useRef([]);
    const sampleRateRef = useRef(44100);

    /**
     * Start capturing audio from the given HTMLMediaElement.
     * Creates AudioContext → MediaElementSource → ScriptProcessor → destination.
     */
    const startCapture = useCallback((mediaElement) => {
        if (!mediaElement) {
            setError("No media element provided");
            return;
        }

        // Prevent double-init
        if (audioCtxRef.current && isCapturing) return;

        try {
            // Create or resume AudioContext
            const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;
            sampleRateRef.current = ctx.sampleRate;

            if (ctx.state === "suspended") {
                ctx.resume();
            }

            // Create source from the media element (only once per element)
            if (!sourceNodeRef.current) {
                const source = ctx.createMediaElementSource(mediaElement);
                sourceNodeRef.current = source;
            }

            // Create ScriptProcessor for PCM tapping (4096 buffer, mono)
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            // Tap: accumulate Float32 samples
            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                bufferRef.current.push(new Float32Array(inputData));
            };

            // Wire: source → processor → destination (speakers)
            sourceNodeRef.current.connect(processor);
            processor.connect(ctx.destination);

            setIsCapturing(true);
            setError(null);
            console.log("[useAudioStreamCapture] 06 — ScriptProcessor tap active (same-origin)");
        } catch (err) {
            console.error("[useAudioStreamCapture] Failed:", err);
            setError(err.message);
        }
    }, [isCapturing]);

    /**
     * Stop capturing — disconnect processor but keep AudioContext alive
     * so the media element continues to play through speakers.
     */
    const stopCapture = useCallback(() => {
        if (processorRef.current) {
            try {
                processorRef.current.disconnect();
            } catch {}
            processorRef.current = null;
        }
        setIsCapturing(false);
        bufferRef.current = [];
    }, []);

    /**
     * Flush accumulated PCM buffer — returns all samples since last flush.
     * SubtitleOverlay polls this every 3 seconds to feed Whisper.
     */
    const flushAudioBuffer = useCallback(() => {
        if (bufferRef.current.length === 0) return null;

        // Concatenate all Float32Arrays
        const chunks = bufferRef.current;
        bufferRef.current = [];

        let totalLength = 0;
        for (const chunk of chunks) totalLength += chunk.length;

        const merged = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
            merged.set(chunk, offset);
            offset += chunk.length;
        }

        return {
            samples: merged,
            sampleRate: sampleRateRef.current,
        };
    }, []);

    /**
     * Full cleanup — close AudioContext entirely.
     */
    const cleanupAudio = useCallback(() => {
        stopCapture();
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.disconnect(); } catch {}
            sourceNodeRef.current = null;
        }
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch {}
            audioCtxRef.current = null;
        }
    }, [stopCapture]);

    return {
        isCapturing,
        error,
        startCapture,
        stopCapture,
        flushAudioBuffer,
        cleanupAudio,
    };
}
