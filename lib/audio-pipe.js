/**
 * audio-pipe.js — Atomic Command 12.2: Direct Audio Pipe
 *
 * Server-side yt-dlp → ffmpeg pipeline for direct audio extraction.
 * Eliminates browser overhead entirely. Fetches raw audio bits from
 * YouTube (or any supported URL) and pipes PCM to Whisper.
 *
 * Functions:
 *   resolveAudioUrl(inputUrl)  — Resolves YouTube URLs via yt-dlp
 *   spawnAudioPipe(audioUrl)   — Spawns ffmpeg for PCM extraction
 */

import { execSync } from "child_process";
import { spawn } from "child_process";

// ── URL Resolution Cache (30-minute TTL) ──
const urlCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function isYouTubeUrl(url) {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be|googlevideo\.com)/i.test(url);
}

/**
 * Resolve a media URL to a direct audio stream URL.
 * - YouTube URLs → yt-dlp extracts the best audio-only stream URL
 * - Other URLs → passed through unchanged
 *
 * @param {string} inputUrl - The original media URL
 * @returns {Promise<{url: string, source: string}>}
 */
export async function resolveAudioUrl(inputUrl) {
    if (!inputUrl) {
        throw new Error("No input URL provided");
    }

    // Non-YouTube: pass through directly
    if (!isYouTubeUrl(inputUrl)) {
        return { url: inputUrl, source: "direct" };
    }

    // Check cache
    const cached = urlCache.get(inputUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log("[audio-pipe] Cache hit:", inputUrl.substring(0, 60));
        return { url: cached.resolvedUrl, source: "yt-dlp-cached" };
    }

    // Resolve via yt-dlp
    console.log("[audio-pipe] Resolving YouTube URL via yt-dlp:", inputUrl.substring(0, 80));

    try {
        const resolvedUrl = execSync(
            `yt-dlp --get-url -f "bestaudio" --no-warnings "${inputUrl}"`,
            {
                encoding: "utf-8",
                timeout: 15000, // 15s timeout
                stdio: ["pipe", "pipe", "pipe"],
            }
        ).trim();

        if (!resolvedUrl || resolvedUrl.length < 10) {
            throw new Error("yt-dlp returned empty or invalid URL");
        }

        // Cache the resolved URL
        urlCache.set(inputUrl, {
            resolvedUrl,
            timestamp: Date.now(),
        });

        console.log("[audio-pipe] yt-dlp resolved:", resolvedUrl.substring(0, 100) + "...");
        return { url: resolvedUrl, source: "yt-dlp" };
    } catch (err) {
        // Clear stale cache on failure
        urlCache.delete(inputUrl);
        throw new Error(`yt-dlp resolution failed: ${err.message}`);
    }
}

/**
 * Spawn an ffmpeg process that reads audio from the given URL
 * and outputs raw PCM s16le mono 16kHz to stdout.
 *
 * @param {string} audioUrl - The direct audio URL (resolved by resolveAudioUrl)
 * @param {number} sampleRate - Output sample rate (default: 16000)
 * @returns {import("child_process").ChildProcess}
 */
export function spawnAudioPipe(audioUrl, sampleRate = 16000) {
    console.log("[audio-pipe] Spawning ffmpeg pipe:", audioUrl.substring(0, 80));

    const ffmpegProcess = spawn("ffmpeg", [
        "-reconnect", "1",              // Auto-reconnect on network drops
        "-reconnect_streamed", "1",
        "-reconnect_delay_max", "2",    // Max 2s reconnect delay
        "-i", audioUrl,
        "-vn",                          // No video
        "-ac", "1",                     // Mono
        "-ar", String(sampleRate),      // 16kHz sample rate
        "-f", "s16le",                  // Raw PCM signed 16-bit little-endian
        "-loglevel", "error",
        "pipe:1",                       // Output to stdout
    ]);

    ffmpegProcess.on("error", (err) => {
        console.error("[audio-pipe] ffmpeg spawn error:", err.message);
    });

    return ffmpegProcess;
}

/**
 * Flush expired entries from the URL cache.
 * Called periodically to prevent memory leaks.
 */
export function flushCache() {
    const now = Date.now();
    for (const [key, val] of urlCache.entries()) {
        if (now - val.timestamp > CACHE_TTL) {
            urlCache.delete(key);
        }
    }
}

// Auto-flush every 10 minutes
setInterval(flushCache, 10 * 60 * 1000);
