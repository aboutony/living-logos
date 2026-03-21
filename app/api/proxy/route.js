import { NextResponse } from "next/server";

/**
 * GET /api/proxy
 *
 * Atomic 06: Sovereign Stream Proxy — Same-Origin Unlock
 *
 * Transparently fetches a remote media stream and pipes it back
 * to the client with the original Content-Type preserved.
 * This makes external HLS/MP4/audio streams appear as Same-Origin,
 * eliminating the CORS "security taint" on the HTMLMediaElement,
 * which in turn allows the Web Audio API ScriptProcessorNode
 * to tap the audio without browser security blocks.
 *
 * Query params:
 *   url — the remote media URL to proxy (HLS .m3u8, .ts, .mp4, .mp3, etc.)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Allowed media MIME type prefixes
const ALLOWED_TYPES = [
    "video/",
    "audio/",
    "application/x-mpegurl",
    "application/vnd.apple.mpegurl",
    "application/octet-stream",
    "application/dash+xml",
    "text/plain", // some CDNs serve .m3u8 as text/plain
];

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
        return NextResponse.json(
            { error: "Missing 'url' parameter" },
            { status: 400 }
        );
    }

    try {
        // Fetch the remote resource
        const upstream = await fetch(targetUrl, {
            headers: {
                "User-Agent": "TheLivingLogos/1.0 (Sovereign Proxy)",
                "Accept": "*/*",
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Upstream ${upstream.status}: ${upstream.statusText}` },
                { status: upstream.status }
            );
        }

        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        const contentLength = upstream.headers.get("content-length");

        // Build response headers — preserve original Content-Type
        const headers = new Headers();
        headers.set("Content-Type", contentType);
        headers.set("Access-Control-Allow-Origin", "*");
        headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.set("Cache-Control", "public, max-age=30");
        headers.set("X-Sovereign-Proxy", "active");
        if (contentLength) headers.set("Content-Length", contentLength);

        // For HLS: rewrite segment URLs in .m3u8 playlists to go through proxy
        if (contentType.includes("mpegurl") || contentType.includes("x-mpegurl") ||
            targetUrl.endsWith(".m3u8") || contentType.includes("text/plain") && targetUrl.endsWith(".m3u8")) {
            const text = await upstream.text();
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

            // Rewrite relative URLs in the playlist to go through our proxy
            const rewritten = text.replace(/^(?!#)(.+)$/gm, (line) => {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith("#")) return line;
                // If the line is a relative URL, make it absolute and proxy it
                const absoluteUrl = trimmed.startsWith("http")
                    ? trimmed
                    : baseUrl + trimmed;
                return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            });

            headers.set("Content-Type", "application/vnd.apple.mpegurl");
            return new Response(rewritten, { headers });
        }

        // For all other media: pipe the raw stream through
        return new Response(upstream.body, { headers });
    } catch (err) {
        return NextResponse.json(
            { error: `Proxy error: ${err.message}` },
            { status: 502 }
        );
    }
}

// Handle CORS preflight
export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "86400",
        },
    });
}
