/**
 * THE LIVING LOGOS — Utility Helpers
 */

/**
 * Simple UUID v4 stub (not crypto-secure — Phase One only)
 */
export function v4Stub() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Format viewer count for display (e.g., 12480 → "12.5K")
 */
export function formatViewers(count) {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
}

/**
 * Get the current UTC hour to determine liturgical sunrise position
 */
export function getLiturgicalSunriseCoords() {
    const hour = new Date().getUTCHours();
    // Sunrise sweeps from east (UTC+12) to west (UTC-12)
    // At UTC 0, sunrise is at ~30°E (Eastern Mediterranean)
    // We map: hour 0 = 30°E, hour 6 = 90°W, hour 12 = 150°E, hour 18 = 30°W
    const lng = 30 - hour * 15; // 15° per hour
    return {
        lat: 25 + Math.sin((hour / 24) * Math.PI * 2) * 10,
        lng: lng > 180 ? lng - 360 : lng,
        hour,
    };
}

/**
 * Calculate the solar terminator longitude for "Follow the Sun"
 */
export function getSolarTerminator() {
    const now = new Date();
    const dayOfYear = Math.floor(
        (now - new Date(now.getFullYear(), 0, 0)) / 86400000
    );
    const decl = -23.44 * Math.cos((360 / 365) * (dayOfYear + 10) * (Math.PI / 180));
    const utcHour = now.getUTCHours() + now.getUTCMinutes() / 60;
    const sunLng = -(utcHour - 12) * 15;
    return { declination: decl, sunLongitude: sunLng };
}
