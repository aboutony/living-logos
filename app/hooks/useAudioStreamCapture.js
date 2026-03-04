"use client";

import { useRef, useState, useEffect, useCallback } from "react";

/**
 * useAudioStreamCapture — Directive 011: Internal Audio Sovereignty
 *
 * Intercepts the internal audio buffer of a <video> or <audio> element
 * using the Web Audio API. Returns a MediaStream that represents the
 * decoded PCM audio — NO microphone needed.
 *
 * This works regardless of:
 * - Microphone permission (DENIED or never requested)
 * - Device speaker mute state
 * - OS volume settings
 *
 * The audio data flows:
 *   <video> element → MediaElementSourceNode → [split]
 *     → AudioContext.destination (speakers, so user still hears)
 *     → MediaStreamDestinationNode (capture stream for transcription)
 */
export default function useAudioStreamCapture(mediaElementRef) {
    const [captureStream, setCaptureStream] = useState(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [error, setError] = useState(null);

    const audioCtxRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const destinationRef = useRef(null);
    const connectedRef = useRef(false);

    const startCapture = useCallback(() => {
        const el = mediaElementRef?.current;
        if (!el) {
            setError("No media element available");
            return;
        }

        // Prevent double-creation of MediaElementSource
        if (connectedRef.current && captureStream) {
            setIsCapturing(true);
            return;
        }

        try {
            // Create or reuse AudioContext
            if (!audioCtxRef.current) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                audioCtxRef.current = new AudioCtx();
            }
            const ctx = audioCtxRef.current;

            // Resume context if suspended (autoplay policy)
            if (ctx.state === "suspended") {
                ctx.resume();
            }

            // Create MediaElementSource (can only be called ONCE per element)
            if (!sourceNodeRef.current) {
                // IMPORTANT: crossOrigin must be set on the element before creating source
                // The element's audio will now be routed through Web Audio API
                sourceNodeRef.current = ctx.createMediaElementSource(el);
                connectedRef.current = true;
            }

            // Create capture destination (provides a MediaStream)
            if (!destinationRef.current) {
                destinationRef.current = ctx.createMediaStreamDestination();
            }

            const source = sourceNodeRef.current;
            const destination = destinationRef.current;

            // Connect: source → speakers (so user still hears audio)
            source.connect(ctx.destination);
            // Connect: source → capture stream (for transcription)
            source.connect(destination);

            setCaptureStream(destination.stream);
            setIsCapturing(true);
            setError(null);
        } catch (err) {
            console.error("[AudioStreamCapture] Failed:", err);
            setError(err.message);
            setIsCapturing(false);
        }
    }, [mediaElementRef, captureStream]);

    const stopCapture = useCallback(() => {
        setIsCapturing(false);
        // Don't destroy the nodes — they can be reused
        // (createMediaElementSource can only be called once)
    }, []);

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
        /** The captured internal MediaStream (feed this to transcription) */
        captureStream,
        /** Whether capture is actively running */
        isCapturing,
        /** Any error that occurred during capture setup */
        error,
        /** Start capturing internal audio */
        startCapture,
        /** Stop capturing (does not destroy nodes for reuse) */
        stopCapture,
    };
}
