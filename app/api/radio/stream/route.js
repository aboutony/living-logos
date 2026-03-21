import { NextResponse } from "next/server";
import { resolveAudioUrl, spawnAudioPipe } from "@/lib/audio-pipe";
import { getRelayState } from "@/lib/relay-state";

/**
 * GET /api/radio/stream
 * Atomic Command 05: Radio Audio Bridge
 *
 * Streams audio from the current Direct Pipe source as MP3 to the browser.
 * Users can listen to Live or VOD content without the video player.
 *
 * Query params:
 *   url      - Direct YouTube/media URL to stream (optional — uses active relay if omitted)
 *   streamId - Stream identifier for logging
 *
 * Response: audio/mpeg stream (MP3 128kbps)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let streamUrl = searchParams.get("url");
    const streamId = searchParams.get("streamId") || "radio";

    // If no URL provided, try to use the currently active relay source
    if (!streamUrl) {
        const state = getRelayState();
        if (state.active?.streamUrl) {
            streamUrl = state.active.streamUrl;
        } else {
            return NextResponse.json(
                { error: "No active stream. Provide a 'url' parameter or start a stream." },
                { status: 404 }
            );
        }
    }

    // Resolve the URL (yt-dlp for YouTube, passthrough for others)
    let resolvedUrl;
    try {
        const result = await resolveAudioUrl(streamUrl);
        resolvedUrl = result.url;
        console.log(`[radio] Audio resolved via ${result.source}: ${resolvedUrl.substring(0, 80)}`);
    } catch (err) {
        return NextResponse.json(
            { error: `Audio resolution failed: ${err.message}` },
            { status: 502 }
        );
    }

    // Spawn ffmpeg to convert to MP3 stream (instead of raw PCM)
    const { spawn } = await import("child_process");

    const ffmpegProcess = spawn("ffmpeg", [
        "-reconnect", "1",
        "-reconnect_streamed", "1",
        "-reconnect_delay_max", "2",
        "-i", resolvedUrl,
        "-vn",                      // No video
        "-ac", "2",                 // Stereo for radio quality
        "-ar", "44100",             // CD-quality sample rate
        "-b:a", "128k",             // 128kbps MP3
        "-f", "mp3",                // MP3 format
        "-loglevel", "error",
        "pipe:1",                   // Output to stdout
    ]);

    // Create a ReadableStream from ffmpeg stdout
    const audioStream = new ReadableStream({
        start(controller) {
            ffmpegProcess.stdout.on("data", (chunk) => {
                try {
                    controller.enqueue(new Uint8Array(chunk));
                } catch {
                    // Stream was cancelled
                    ffmpegProcess.kill("SIGTERM");
                }
            });

            ffmpegProcess.stdout.on("end", () => {
                try { controller.close(); } catch {}
            });

            ffmpegProcess.on("error", (err) => {
                console.error("[radio] ffmpeg error:", err.message);
                try { controller.close(); } catch {}
            });

            ffmpegProcess.stderr.on("data", (data) => {
                const msg = data.toString().trim();
                if (msg) console.error("[radio-ffmpeg]", msg);
            });
        },
        cancel() {
            try { ffmpegProcess.kill("SIGTERM"); } catch {}
        },
    });

    return new Response(audioStream, {
        headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "no-cache, no-store",
            "Connection": "keep-alive",
            "X-Content-Type-Options": "nosniff",
            "X-Sovereign-Radio": "active",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
