/**
 * Directive 022: ICY Metadata Proxy
 * GET /api/streams/radio-meta?url=<icecast-url>
 *
 * Fetches the first chunk of an Icecast/Shoutcast stream,
 * extracts ICY metadata (StreamTitle), and returns it as JSON.
 *
 * Why server-side? Browsers cannot read ICY headers from <audio> elements
 * due to CORS restrictions on raw TCP Icecast framing.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Parse ICY metadata from a binary buffer.
 * ICY frame: [metaint bytes of audio] [1 byte length * 16] [metadata string]
 */
function parseIcyMeta(buffer, metaint) {
    if (!metaint || metaint <= 0) return null;

    // Find the metadata block after the first metaint-sized audio block
    const offset = metaint;
    if (offset >= buffer.length) return null;

    const metaLength = buffer[offset] * 16;
    if (metaLength === 0 || offset + 1 + metaLength > buffer.length) return null;

    const metaStr = new TextDecoder("utf-8").decode(
        buffer.slice(offset + 1, offset + 1 + metaLength)
    );

    // Parse StreamTitle='...' from the metadata string
    const match = metaStr.match(/StreamTitle='([^']*)'/i);
    if (!match) return { raw: metaStr, title: null, artist: null };

    const full = match[1].trim();
    // Common format: "Artist - Title"  or just "Title"
    const parts = full.split(" - ");
    if (parts.length >= 2) {
        return {
            title: parts.slice(1).join(" - ").trim(),
            artist: parts[0].trim(),
            raw: full,
        };
    }
    return { title: full, artist: null, raw: full };
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const streamUrl = searchParams.get("url");

    if (!streamUrl) {
        return NextResponse.json(
            { success: false, error: "Missing 'url' parameter" },
            { status: 400 }
        );
    }

    try {
        // Request the stream with ICY metadata enabled
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(streamUrl, {
            headers: {
                "Icy-MetaData": "1",
                "User-Agent": "LivingLogos/1.0",
                Range: "bytes=0-",
            },
            signal: controller.signal,
        });
        clearTimeout(timeout);

        // Get the metaint interval from ICY headers
        const metaint = parseInt(res.headers.get("icy-metaint") || "0", 10);
        const icyName = res.headers.get("icy-name") || null;
        const icyGenre = res.headers.get("icy-genre") || null;
        const icyBr = res.headers.get("icy-br") || null;
        const contentType = res.headers.get("content-type") || "unknown";

        if (metaint <= 0) {
            // No ICY metadata available — return station info from headers only
            return NextResponse.json({
                success: true,
                metadata: {
                    title: icyName || "Unknown",
                    artist: null,
                    stationName: icyName,
                    genre: icyGenre,
                    bitrate: icyBr,
                    contentType,
                    raw: null,
                },
            });
        }

        // Read enough bytes to get the first metadata block
        const reader = res.body.getReader();
        const chunks = [];
        let totalBytes = 0;
        const targetBytes = metaint + 4096; // metaint + room for metadata

        while (totalBytes < targetBytes) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalBytes += value.length;
        }

        // Cancel the stream — we only needed the first metadata block
        reader.cancel().catch(() => { });

        // Concatenate chunks
        const fullBuffer = new Uint8Array(totalBytes);
        let pos = 0;
        for (const chunk of chunks) {
            fullBuffer.set(chunk, pos);
            pos += chunk.length;
        }

        // Parse ICY metadata
        const parsed = parseIcyMeta(fullBuffer, metaint);

        return NextResponse.json({
            success: true,
            metadata: {
                title: parsed?.title || icyName || "Unknown",
                artist: parsed?.artist || null,
                stationName: icyName,
                genre: icyGenre,
                bitrate: icyBr,
                contentType,
                raw: parsed?.raw || null,
            },
        });
    } catch (err) {
        // If stream doesn't support ICY, return a graceful fallback
        return NextResponse.json({
            success: true,
            metadata: {
                title: "Sovereign Radio",
                artist: "The Living Logos",
                stationName: null,
                genre: null,
                bitrate: null,
                contentType: null,
                raw: null,
                fallback: true,
                error: err.message,
            },
        });
    }
}
