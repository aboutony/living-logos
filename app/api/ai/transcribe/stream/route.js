import { NextResponse } from "next/server";
import { spawn } from "child_process";
import { sanitizeTheologicalOutput, detectSacredTerms, SUPPORTED_LANGUAGES } from "@/lib/patristic-ai";

/**
 * GET /api/ai/transcribe/stream
 *
 * Atomic 04.6: Server-Side Stream Interception (SSE)
 *
 * Uses ffmpeg to pipe audio from a streamUrl in 3-second segments,
 * feeds each segment to Whisper-1, and streams vetted translations
 * back to the client via Server-Sent Events.
 *
 * Query params:
 *   streamUrl  - The media URL to extract audio from (HLS, MP4, etc.)
 *   sourceLang - Source language code (default: "el")
 *   targetLang - Target language code (default: "en")
 *   streamId   - Stream identifier for logging
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Convert raw PCM s16le buffer to WAV buffer */
function pcmToWav(pcmBuffer, sampleRate = 16000) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const dataSize = pcmBuffer.length;
    const wav = Buffer.alloc(44 + dataSize);

    wav.write("RIFF", 0);
    wav.writeUInt32LE(36 + dataSize, 4);
    wav.write("WAVE", 8);
    wav.write("fmt ", 12);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(numChannels, 22);
    wav.writeUInt32LE(sampleRate, 24);
    wav.writeUInt32LE(byteRate, 28);
    wav.writeUInt16LE(blockAlign, 32);
    wav.writeUInt16LE(bitsPerSample, 34);
    wav.write("data", 36);
    wav.writeUInt32LE(dataSize, 40);
    pcmBuffer.copy(wav, 44);

    return wav;
}

/** Send base64 WAV to Whisper-1 */
async function whisperTranscribe(base64Audio, sourceLang, apiKey) {
    const audioBuffer = Buffer.from(base64Audio, "base64");
    if (audioBuffer.length < 100) return { success: false, error: "Chunk too small" };

    const formData = new FormData();
    formData.append("file", new Blob([audioBuffer], { type: "audio/wav" }), "chunk.wav");
    formData.append("model", "whisper-1");
    formData.append("language", sourceLang);
    formData.append("response_format", "verbose_json");
    formData.append("prompt",
        "Greek Orthodox liturgical sermon. " +
        "Speakers: Metropolitan, Bishop, Priest, Deacon, Monk. " +
        "Saints: Ἅγιος Παΐσιος, Νεόφυτος, Μόρφου, Αθανάσιος, Βασίλειος, " +
        "Γρηγόριος, Ιωάννης Χρυσόστομος, Κοσμάς Αιτωλός, Πορφύριος. " +
        "Terms: Θεοτόκος, Θεία Λειτουργία, Εὐχαριστία, Θέωσις, Ἡσυχασμός, " +
        "ὁμοούσιος, Μετάνοια, Κύριε ἐλέησον, Χριστός Ανέστη, Ἅγιον Ὄρος."
    );

    try {
        const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}` },
            body: formData,
        });
        if (!res.ok) {
            const errText = await res.text();
            return { success: false, error: `Whisper ${res.status}: ${errText}` };
        }
        const data = await res.json();
        let transcript = (data.text || "").trim();
        // Filter Whisper silence hallucinations
        const hallucinations = [/\[?SUBTITLES?\]?/gi, /\[?subscribe\]?/gi, /[υΥ]ποτ[ιί]τλοι/gi];
        for (const p of hallucinations) transcript = transcript.replace(p, "").trim();
        if (transcript.length < 2) return { success: false, error: null };
        return { success: true, transcript, duration: data.duration || 3 };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/** GPT-4o-mini translation with Sacred Glossary enforcement */
async function translateWithGPT(text, sourceLang, targetLang, apiKey) {
    if (!text || text.length < 2) return null;
    try {
        const targetName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
        const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `You are a Greek Orthodox theological translator. Translate from ${sourceName} to ${targetName}. Output ONLY the translation.` },
                    { role: "user", content: text },
                ],
                max_tokens: 300,
                temperature: 0.3,
            }),
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return null;
        const data = await res.json();
        let translated = data.choices?.[0]?.message?.content?.trim();
        if (!translated || translated.length < 2) return null;

        const sacredTerms = detectSacredTerms(text);
        const glossaryApplied = [];
        for (const term of sacredTerms) {
            const sourceForm = term.translations[sourceLang] || term.canonical;
            const targetForm = term.translations[targetLang] || term.canonical;
            if (targetForm && translated.includes(sourceForm)) {
                translated = translated.replace(
                    new RegExp(sourceForm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                    `⸬${targetForm}⸬`
                );
                glossaryApplied.push({ termId: term.id, from: sourceForm, to: targetForm });
            }
        }
        translated = sanitizeTheologicalOutput(translated);
        return {
            text: translated,
            sacredTerms: sacredTerms.map(t => ({ id: t.id, canonical: t.canonical, category: t.category })),
            glossaryApplied,
        };
    } catch { return null; }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const streamUrl = searchParams.get("streamUrl");
    const sourceLang = searchParams.get("sourceLang") || "el";
    const targetLang = searchParams.get("targetLang") || "en";
    const streamId = searchParams.get("streamId") || "";

    if (!streamUrl) {
        return NextResponse.json({ error: "streamUrl is required" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
    }

    const encoder = new TextEncoder();
    let ffmpegProcess = null;

    const stream = new ReadableStream({
        start(controller) {
            const sendSSE = (data) => {
                try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch {}
            };

            sendSSE({ type: "status", message: "📡 LIVE — Server audio relay active" });

            try {
                // Spawn ffmpeg: extract audio as raw PCM s16le, mono, 16kHz
                ffmpegProcess = spawn("ffmpeg", [
                    "-i", streamUrl,
                    "-vn",            // No video
                    "-ac", "1",       // Mono
                    "-ar", "16000",   // 16kHz sample rate
                    "-f", "s16le",    // Raw PCM signed 16-bit little-endian
                    "-loglevel", "error",
                    "pipe:1",         // Output to stdout
                ]);

                let pcmBuffer = Buffer.alloc(0);
                const CHUNK_SIZE = 16000 * 2 * 3; // 3 seconds of 16-bit mono @ 16kHz = 96,000 bytes
                let processing = false;

                async function processChunk(chunk) {
                    // VAD: compute RMS on the PCM chunk
                    let sumSquares = 0;
                    const sampleCount = chunk.length / 2;
                    for (let i = 0; i < chunk.length; i += 2) {
                        const sample = chunk.readInt16LE(i) / 32768;
                        sumSquares += sample * sample;
                    }
                    const rms = Math.sqrt(sumSquares / sampleCount);

                    if (rms < 0.01) {
                        sendSSE({ type: "vad", status: "silence", rms });
                        return;
                    }

                    // Convert PCM to WAV, then to base64
                    const wavBuffer = pcmToWav(chunk);
                    const base64 = wavBuffer.toString("base64");

                    // Whisper transcription
                    const result = await whisperTranscribe(base64, sourceLang, apiKey);
                    if (!result.success) {
                        if (result.error) sendSSE({ type: "error", message: result.error });
                        return;
                    }

                    // GPT translation + Sacred Glossary
                    let translatedText = null;
                    let sacredTermsDetected = [];
                    if (targetLang && targetLang !== sourceLang) {
                        const translated = await translateWithGPT(result.transcript, sourceLang, targetLang, apiKey);
                        if (translated) {
                            translatedText = translated.text;
                            sacredTermsDetected = translated.sacredTerms;
                        }
                    } else {
                        translatedText = result.transcript;
                    }

                    sendSSE({
                        type: "transcription",
                        success: true,
                        transcript: result.transcript,
                        translatedText,
                        sacredTerms: sacredTermsDetected,
                        cue: { id: Date.now(), duration: result.duration || 3 },
                        rms,
                        engine: "OpenAI Whisper-1",
                        relay: "server-ffmpeg",
                    });
                }

                ffmpegProcess.stdout.on("data", (data) => {
                    pcmBuffer = Buffer.concat([pcmBuffer, data]);

                    // Process 3-second chunks sequentially
                    if (pcmBuffer.length >= CHUNK_SIZE && !processing) {
                        processing = true;
                        const chunk = pcmBuffer.subarray(0, CHUNK_SIZE);
                        pcmBuffer = pcmBuffer.subarray(CHUNK_SIZE);

                        processChunk(Buffer.from(chunk))
                            .catch((err) => sendSSE({ type: "error", message: err.message }))
                            .finally(() => { processing = false; });
                    }
                });

                ffmpegProcess.stderr.on("data", (data) => {
                    const msg = data.toString().trim();
                    if (msg) console.error("[ffmpeg]", msg);
                });

                ffmpegProcess.on("close", (code) => {
                    sendSSE({ type: "status", message: `Stream ended (exit: ${code})` });
                    try { controller.close(); } catch {}
                });

                ffmpegProcess.on("error", (err) => {
                    sendSSE({ type: "error", message: `ffmpeg error: ${err.message}. Ensure ffmpeg is installed.` });
                    try { controller.close(); } catch {}
                });
            } catch (err) {
                sendSSE({ type: "error", message: `Stream relay failed: ${err.message}` });
                try { controller.close(); } catch {}
            }
        },
        cancel() {
            if (ffmpegProcess) {
                try { ffmpegProcess.kill("SIGTERM"); } catch {}
                ffmpegProcess = null;
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
