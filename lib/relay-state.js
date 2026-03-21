/**
 * THE LIVING LOGOS — Relay State Store
 * Atomic Command 05: Radio Metadata Bridge
 *
 * In-memory store tracking what the Direct Pipe is currently processing.
 * Shared across API routes for real-time metadata broadcast.
 *
 * This is a singleton module — Node.js caches module exports,
 * so all importers share the same state object.
 */

// ═══════════════════════════════════════════════════════
// Current relay state — updated by the transcription SSE
// and read by the radio-meta endpoint
// ═══════════════════════════════════════════════════════

const relayState = {
    /** Currently active stream/VOD being processed */
    active: null,

    /** Timestamp of last update */
    lastUpdated: 0,

    /** History of recent items (for smooth transitions) */
    history: [],
};

/**
 * Update the relay state when a new stream/VOD starts processing.
 * Called by the transcription SSE route when audio pipe connects.
 *
 * @param {Object} params
 * @param {string} params.streamId    - Stream or VOD ID (e.g., "stream-morphou-001" or "vod-sermon-001")
 * @param {string} params.title       - Display title of the content
 * @param {string} params.artist      - Artist/authority (e.g., "Metropolitan Neophytos")
 * @param {string} params.streamUrl   - The source URL being processed
 * @param {string} params.type        - "live" or "vod"
 * @param {string} params.category    - Category if VOD (sermons, documentaries, movies)
 * @param {string} params.language    - Source language code
 */
export function setActiveRelay({
    streamId,
    title,
    artist,
    streamUrl,
    type = "live",
    category = null,
    language = "el",
}) {
    const entry = {
        streamId,
        title: title || "Unknown Stream",
        artist: artist || "The Living Logos",
        streamUrl: streamUrl || null,
        type,
        category,
        language,
        startedAt: Date.now(),
    };

    // Push previous active to history (keep last 10)
    if (relayState.active) {
        relayState.history.unshift({
            ...relayState.active,
            endedAt: Date.now(),
        });
        if (relayState.history.length > 10) {
            relayState.history = relayState.history.slice(0, 10);
        }
    }

    relayState.active = entry;
    relayState.lastUpdated = Date.now();

    console.log(
        `[relay-state] Active relay set: ${type.toUpperCase()} — "${title}" (${streamId})`
    );
}

/**
 * Clear the active relay (stream ended or was stopped).
 */
export function clearActiveRelay() {
    if (relayState.active) {
        relayState.history.unshift({
            ...relayState.active,
            endedAt: Date.now(),
        });
        if (relayState.history.length > 10) {
            relayState.history = relayState.history.slice(0, 10);
        }
    }
    relayState.active = null;
    relayState.lastUpdated = Date.now();
    console.log("[relay-state] Active relay cleared");
}

/**
 * Get the current relay state.
 * @returns {Object} Current relay state with active item and history
 */
export function getRelayState() {
    return {
        active: relayState.active,
        lastUpdated: relayState.lastUpdated,
        isActive: relayState.active !== null,
        uptimeMs: relayState.active
            ? Date.now() - relayState.active.startedAt
            : 0,
        history: relayState.history.slice(0, 5), // Last 5 items
    };
}

/**
 * Get metadata formatted for the radio-meta endpoint.
 * Returns ICY-compatible metadata structure.
 * @returns {Object|null}
 */
export function getRelayMetadata() {
    if (!relayState.active) return null;

    const { title, artist, type, category, streamId, language, startedAt } =
        relayState.active;
    const uptimeSeconds = Math.floor((Date.now() - startedAt) / 1000);

    return {
        title,
        artist,
        stationName: "The Living Logos — Sovereign Radio",
        genre: "Orthodox Christian",
        bitrate: "128",
        contentType: "audio/mpeg",
        raw: `StreamTitle='${artist} - ${title}'`,
        source: "direct-pipe",
        streamId,
        type,
        category,
        language,
        uptimeSeconds,
    };
}
