/**
 * Directive 022 + Atomic 05: Radio Metadata Bridge
 * GET /api/streams/radio-meta
 *
 * Dual-source metadata endpoint:
 *   1. source=pipe → Returns metadata from the Direct Pipe relay state
 *                     (what yt-dlp is currently processing)
 *   2. url=<icecast-url> → Original ICY metadata extraction from Icecast/Shoutcast
 *
 * The Direct Pipe metadata is the bridge between the server-side
 * yt-dlp audio extraction and the client-side radio player.
 */

import { NextResponse } from "next/server";
import { getRelayMetadata, getRelayState } from "@/lib/relay-state";

export const dynamic = "force-dynamic";

/**
 * Parse ICY metadata from a binary buffer.
 * ICY frame: [metaint bytes of audio] [1 byte length * 16] [metadata string]
 */
function parseIcyMeta(buffer, metaint) {
    if (!metaint || metaint <= 0) return null;

    const offset = metaint;
    if (offset >= buffer.length) return null;

    const metaLength = buffer[offset] * 16;
    if (metaLength === 0 || offset + 1 + metaLength > buffer.length) return null;

    const metaStr = new TextDecoder("utf-8").decode(
        buffer.slice(offset + 1, offset + 1 + metaLength)
    );

    const match = metaStr.match(/StreamTitle='([^']*)'/i);
    if (!match) return { raw: metaStr, title: null, artist: null };

    const full = match[1].trim();
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
    const source = searchParams.get("source");
    const streamUrl = searchParams.get("url");

    // ═══════════════════════════════════════════════════════
    // SOURCE: Direct Pipe — return relay state metadata
    // ═══════════════════════════════════════════════════════
    if (source === "pipe") {
        const metadata = getRelayMetadata();
        const state = getRelayState();

        if (!metadata) {
            return NextResponse.json({
                success: true,
                metadata: {
                    title: "Sovereign Radio — Standby",
                    artist: "The Living Logos",
                    stationName: "The Living Logos — Sovereign Radio",
                    genre: "Orthodox Christian",
                    bitrate: null,
                    contentType: null,
                    raw: null,
                    source: "direct-pipe",
                    status: "idle",
                },
                relay: {
                    isActive: false,
                    uptimeMs: 0,
                    history: state.history,
                },
            });
        }

        return NextResponse.json({
            success: true,
            metadata,
            relay: {
                isActive: state.isActive,
                uptimeMs: state.uptimeMs,
                history: state.history,
            },
        });
    }

    // ═══════════════════════════════════════════════════════
    // SOURCE: ICY — original Icecast/Shoutcast metadata
    // ═══════════════════════════════════════════════════════
    if (!streamUrl) {
        // No source specified — return pipe metadata by default
        const metadata = getRelayMetadata();
        if (metadata) {
            return NextResponse.json({ success: true, metadata });
        }
        return NextResponse.json(
            { success: false, error: "Missing 'url' or 'source' parameter" },
            { status: 400 }
        );
    }

    try {
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

        const metaint = parseInt(res.headers.get("icy-metaint") || "0", 10);
        const icyName = res.headers.get("icy-name") || null;
        const icyGenre = res.headers.get("icy-genre") || null;
        const icyBr = res.headers.get("icy-br") || null;
        const contentType = res.headers.get("content-type") || "unknown";

        if (metaint <= 0) {
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
                    source: "icy",
                },
            });
        }

        const reader = res.body.getReader();
        const chunks = [];
        let totalBytes = 0;
        const targetBytes = metaint + 4096;

        while (totalBytes < targetBytes) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            totalBytes += value.length;
        }
        reader.cancel().catch(() => {});

        const fullBuffer = new Uint8Array(totalBytes);
        let pos = 0;
        for (const chunk of chunks) {
            fullBuffer.set(chunk, pos);
            pos += chunk.length;
        }

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
                source: "icy",
            },
        });
    } catch (err) {
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
                source: "icy-fallback",
            },
        });
    }
}
