"use client";

/**
 * useAudioStreamCapture — Atomic 07: Shadow Player
 *
 * GUTTED. All audio extraction happens server-side via ffmpeg + SSE.
 * The "Shadow Player" architecture means the server is the headless
 * renderer that taps audio — the client never touches AudioContext.
 *
 * This hook is a no-op stub so SovereignPlayer compiles.
 */
export default function useAudioStreamCapture() {
    return {
        isCapturing: false,
        error: null,
        needsInteraction: false,
        startCapture: () => {},
        stopCapture: () => {},
        cleanupAudio: () => {},
    };
}
