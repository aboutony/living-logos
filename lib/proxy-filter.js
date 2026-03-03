/**
 * THE LIVING LOGOS — Sovereign Proxy Filter
 * Strips secular metadata, ad markers, and tracking parameters
 * from third-party "feeder" signals before client-side rendering.
 */

// Known tracking / ad parameters to strip from URLs
const TRACKING_PARAMS = [
    // Google / YouTube
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "gclid", "gclsrc", "dclid", "gbraid", "wbraid",
    // Facebook / Meta
    "fbclid", "fb_action_ids", "fb_action_types", "fb_ref", "fb_source",
    // General analytics
    "mc_cid", "mc_eid", "_ga", "_gl", "_hsenc", "_hsmi",
    "hsCtaTracking", "ref", "trackingId",
    // Ad networks
    "ad_id", "adset_id", "campaign_id", "ad_name", "adset_name",
    "placement", "site_source_name",
];

// Known tracking cookie prefixes
const TRACKING_COOKIE_PREFIXES = [
    "_ga", "_gid", "_gat", "_fbp", "_fbc",
    "__utm", "IDE", "DSID", "FLC", "AID",
    "TAID", "exchange_uid", "personalization_id",
];

// Headers that leak user/platform info
const STRIP_HEADERS = [
    "x-google-analytics",
    "x-fb-trace-id",
    "x-fb-rev",
    "x-ad-server",
    "x-served-by-ad",
    "set-cookie",
];

/**
 * Strip tracking parameters from a URL string
 * @param {string} url — The full URL to sanitize
 * @returns {string} — The cleaned URL
 */
export function stripSecularMetadata(url) {
    try {
        const parsed = new URL(url);
        const paramsToDelete = [];

        for (const key of parsed.searchParams.keys()) {
            const lower = key.toLowerCase();
            if (
                TRACKING_PARAMS.includes(lower) ||
                lower.startsWith("utm_") ||
                lower.startsWith("fb_") ||
                lower.startsWith("ad_") ||
                lower.startsWith("_ga")
            ) {
                paramsToDelete.push(key);
            }
        }

        paramsToDelete.forEach((p) => parsed.searchParams.delete(p));
        return parsed.toString();
    } catch {
        return url;
    }
}

/**
 * Sanitize response headers — remove tracking, ad,
 * and third-party cookie headers
 * @param {Headers|Object} headers — The headers object
 * @returns {Object} — Cleaned header entries
 */
export function sanitizeHeaders(headers) {
    const cleaned = {};
    const entries =
        headers instanceof Headers ? headers.entries() : Object.entries(headers);

    for (const [key, value] of entries) {
        if (STRIP_HEADERS.includes(key.toLowerCase())) continue;
        cleaned[key] = value;
    }

    // Strip tracking cookies from any remaining cookie header
    if (cleaned["cookie"]) {
        cleaned["cookie"] = stripTrackingCookies(cleaned["cookie"]);
    }

    return cleaned;
}

/**
 * Strip known tracking cookies from a cookie string
 */
function stripTrackingCookies(cookieString) {
    return cookieString
        .split(";")
        .map((c) => c.trim())
        .filter((c) => {
            const name = c.split("=")[0]?.toLowerCase() || "";
            return !TRACKING_COOKIE_PREFIXES.some((prefix) =>
                name.startsWith(prefix.toLowerCase())
            );
        })
        .join("; ");
}

/**
 * Validate a URL is not an ad or tracker redirect
 * @param {string} url
 * @returns {boolean}
 */
export function isSafeOrigin(url) {
    const BLOCKED_DOMAINS = [
        "doubleclick.net",
        "googlesyndication.com",
        "googleadservices.com",
        "facebook.com/tr",
        "connect.facebook.net",
        "analytics.google.com",
        "adservice.google.com",
        "ads.yahoo.com",
    ];

    try {
        const parsed = new URL(url);
        return !BLOCKED_DOMAINS.some(
            (domain) =>
                parsed.hostname.includes(domain) || parsed.pathname.includes(domain)
        );
    } catch {
        return false;
    }
}
