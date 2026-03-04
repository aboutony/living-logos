"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useUserInteraction — Directive 012: Zero-Click Audio Activation
 *
 * Detects the FIRST user interaction (touch, click, scroll, keypress)
 * anywhere on the Living Logos interface. Once triggered, it sets
 * `hasInteracted` to true and removes all listeners.
 *
 * This is required because browsers block AudioContext.resume() and
 * autoplay until the user performs a gesture. This hook detects that
 * gesture globally so the audio pipeline can auto-activate.
 */
export default function useUserInteraction() {
    const [hasInteracted, setHasInteracted] = useState(false);
    const callbacksRef = useRef([]);

    // Register a callback to fire on first interaction
    const onFirstInteraction = useCallback((cb) => {
        if (typeof cb === "function") {
            callbacksRef.current.push(cb);
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Check if there's already been an interaction (e.g., navigating via click)
        // Some browsers allow audio after navigation from a user-initiated click

        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
                // Fire all registered callbacks
                callbacksRef.current.forEach((cb) => {
                    try { cb(); } catch { /* silent */ }
                });
                callbacksRef.current = [];
                // Cleanup all listeners
                cleanup();
            }
        };

        const events = ["click", "touchstart", "scroll", "keydown", "mousedown", "pointerdown"];
        events.forEach((evt) => {
            document.addEventListener(evt, handleInteraction, { once: true, passive: true, capture: true });
        });

        const cleanup = () => {
            events.forEach((evt) => {
                document.removeEventListener(evt, handleInteraction, { capture: true });
            });
        };

        return cleanup;
    }, [hasInteracted]);

    return {
        /** Whether the user has interacted with the page at least once */
        hasInteracted,
        /** Register a callback for the first interaction event */
        onFirstInteraction,
    };
}
