"use client";

/**
 * useAudioStreamCapture — Atomic 04.6: Server-Side Relay
 *
 * GUTTED. All audio extraction now happens server-side via ffmpeg + SSE.
 * This hook is a stub that returns minimal state so SovereignPlayer
 * continues to compile. SubtitleOverlay manages the EventSource directly.
 *
 * Previous implementations (deprecated):
 *  - 04.1-04.4: AudioContext + MediaElementSource + MediaStreamDestination
 *  - 04.5: ScriptProcessorNode PCM tap
 *  - 04.6: Server-side ffmpeg relay (CURRENT)
 */
export default function useAudioStreamCapture() {
    // Atomic 04.6: All audio processing moved to server-side.
    // This is a no-op stub for backward compatibility.
    return {
        isCapturing: false,
        error: null,
        needsInteraction: false,
        startCapture: () => {},
        stopCapture: () => {},
        cleanupAudio: () => {},
    };
}
