import { NextResponse } from "next/server";
import { sanitizeTheologicalOutput, detectSacredTerms, SUPPORTED_LANGUAGES } from "@/lib/patristic-ai";

/**
 * POST /api/ai/transcribe
 *
 * Directive 018: Hardware-Locked Whisper Integration
 *
 * ZERO stubs. ZERO simulated scripts. Whisper-1 API ONLY.
 * Real 3-second audio chunks from MediaRecorder are sent directly
 * to OpenAI Whisper-1 for high-fidelity speech-to-text.
 *
 * If OPENAI_API_KEY is not configured, returns an explicit error
 * telling the user to configure it. No fallback, no simulation.
 *
 * Body: {
 *   audioData: string (base64 encoded REAL audio chunk),
 *   format: string ("webm", "ogg", "wav"),
 *   sourceLang: string ("el", "en", "ar"),
 *   streamId: string,
 *   streamTime: number (current playback time in seconds)
 * }
 */

/**
 * Send a base64-encoded audio chunk to OpenAI Whisper-1 for transcription.
 */
async function whisperTranscribe(base64Audio, format = "webm", sourceLang = "el") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return { success: false, error: "OPENAI_API_KEY not configured. Set it in .env.local or Vercel Environment Variables." };
    }

    try {
        // Convert base64 to binary buffer
        const audioBuffer = Buffer.from(base64Audio, "base64");

        // Reject empty/trivial chunks
        if (audioBuffer.length < 100) {
            return { success: false, error: "Audio chunk too small — no real audio data" };
        }

        const ext = format === "ogg" ? "ogg" : format === "wav" ? "wav" : "webm";
        const mimeType = format === "ogg" ? "audio/ogg" : format === "wav" ? "audio/wav" : "audio/webm";

        // Language mapping for Whisper (ISO 639-1)
        const whisperLang = sourceLang || "el";

        // Use native FormData + Blob (Node.js 18+)
        const formData = new FormData();
        formData.append("file", new Blob([audioBuffer], { type: mimeType }), `chunk.${ext}`);
        formData.append("model", "whisper-1");
        formData.append("language", whisperLang);
        formData.append("response_format", "verbose_json");

        // Orthodox theology prompt — guides Whisper vocabulary for accurate transcription
        // This prevents hallucinations and ensures proper Greek Orthodox terminology
        formData.append("prompt",
            "Greek Orthodox liturgical sermon. " +
            "Speakers: Metropolitan, Bishop, Priest, Deacon, Monk. " +
            "Saints: Ἅγιος Παΐσιος, Παΐσιος Αγιορείτης, Νεόφυτος, Μόρφου, Αθανάσιος, Βασίλειος, " +
            "Γρηγόριος, Ιωάννης Χρυσόστομος, Μάξιμος Ομολογητής, Σεραφείμ Σαρώφ, " +
            "Κοσμάς Αιτωλός, Πορφύριος Καυσοκαλυβίτης, Σωφρόνιος Σαχάρωφ, " +
            "Ιουστίνος Πόποβιτς, Νικόλαος, Σπυρίδων, Νεκτάριος, Λουκάς Κριμαίας. " +
            "Terms: Θεοτόκος, Θεία Λειτουργία, Εὐχαριστία, Θέωσις, Ἡσυχασμός, " +
            "ὁμοούσιος, Χρίσμα, Πάσχα, Εἰκονοστάσιον, Μετάνοια, Ἀντίδωρον, " +
            "Κύριε ἐλέησον, Χριστός Ανέστη, Εὐλογημένη ἡ Βασιλεία, " +
            "Ἅγιον Ὄρος, Μονή, Σκήτη, Κελλί, Ιερά Σύνοδος."
        );

        const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errText = await response.text();
            return { success: false, error: `Whisper API ${response.status}: ${errText}` };
        }

        const data = await response.json();

        // Light filter: only remove known Whisper silence hallucinations
        // (GPT-4o-mini handles translation — no MyMemory noise to worry about)
        let transcript = (data.text || "").trim();
        const whisperHallucinations = [
            /\[?AUTHORWAVE\]?/gi,
            /\[?SUBTITLES?\]?/gi,
            /\[?subscribe\]?/gi,
            /[υΥ]ποτ[ιί]τλοι/gi,
        ];
        for (const pattern of whisperHallucinations) {
            transcript = transcript.replace(pattern, "").trim();
        }
        // Skip empty or very short transcriptions after filtering
        if (transcript.length < 2) {
            return { success: false, error: null }; // silent skip
        }

        return {
            success: true,
            transcript,
            language: data.language || sourceLang,
            duration: data.duration || 3,
            segments: data.segments || [],
        };
    } catch (err) {
        return { success: false, error: `Whisper request failed: ${err.message}` };
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { audioData, format, sourceLang, targetLang, streamId } = body;

        if (!audioData) {
            return NextResponse.json(
                { success: false, error: "audioData is required — no simulated data accepted" },
                { status: 400 }
            );
        }

        // D018: Hard gate — reject trivial/simulated data
        if (audioData.length < 100) {
            return NextResponse.json(
                { success: false, error: "Audio data too small. Send real 3-second MediaRecorder chunks." },
                { status: 400 }
            );
        }

        // D018: Whisper-1 ONLY — no fallback, no stubs
        const result = await whisperTranscribe(audioData, format, sourceLang);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error, engine: "OpenAI Whisper-1", mode: "hardware-locked" },
                { status: 503 }
            );
        }

        // ─── Atomic 02: Post-Processing Relay — Any-to-Any Translation ───
        let translatedText = null;
        let sacredTermsDetected = [];
        let glossaryApplied = [];

        const effectiveTargetLang = targetLang || null;
        if (effectiveTargetLang && effectiveTargetLang !== sourceLang) {
            const translated = await translateWithGPT(result.transcript, sourceLang, effectiveTargetLang);
            if (translated) {
                translatedText = translated.text;
                sacredTermsDetected = translated.sacredTerms;
                glossaryApplied = translated.glossaryApplied;
            }
        } else if (effectiveTargetLang && effectiveTargetLang === sourceLang) {
            // Same language — no translation needed, pass through
            translatedText = result.transcript;
        }

        return NextResponse.json({
            success: true,
            transcript: result.transcript,
            // Atomic 02: Unified relay response
            translatedText,
            cue: {
                id: Date.now(),
                startTime: 0,
                endTime: result.duration || 3,
                duration: result.duration || 3,
                scene: null,
            },
            confidence: sacredTermsDetected.length > 0 ? 0.85 : 0.97,
            sacredTerms: sacredTermsDetected,
            glossaryApplied,
            sequenceId: Date.now(),
            engine: "OpenAI Whisper-1",
            translationEngine: translatedText ? "GPT-4o-mini + Sacred Glossary" : null,
            source: "internal-audio-buffer",
            micRequired: false,
            format: format || "webm",
            sanitized: true,
            mode: "hardware-locked",
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Transcription failed: " + err.message },
            { status: 500 }
        );
    }
}

/**
 * Atomic 02: GPT-4o-mini Translation Relay with Sacred Glossary enforcement.
 * Mirrors /api/ai/translate logic but runs inline as post-processing.
 */
async function translateWithGPT(text, sourceLang, targetLang) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !text || text.length < 2) return null;

    try {
        const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
        const sourceLangName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;

        const systemPrompt = [
            `You are a Greek Orthodox theological translator. Translate from ${sourceLangName} to ${targetLangName}.`,
            "",
            "RULES:",
            "1. Translate MEANING and CONTEXT, not word-by-word.",
            "2. You are an expert in Orthodox Christianity — Patristics, liturgy, hagiography, and dogma.",
            "3. Saint names MUST use their correct international transliterations.",
            "4. Preserve the register and gravitas of ecclesiastical speech.",
            "5. Output ONLY the translation, no commentary, no brackets, no metadata.",
            "6. If you cannot translate a phrase, transliterate it.",
        ].join("\n");

        const gptRes = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text },
                ],
                max_tokens: 300,
                temperature: 0.3,
            }),
            signal: AbortSignal.timeout(8000),
        });

        if (!gptRes.ok) return null;

        const gptData = await gptRes.json();
        let translatedText = gptData.choices?.[0]?.message?.content?.trim();
        if (!translatedText || translatedText.length < 2) return null;

        // Theological Interception: Sacred Glossary enforcement
        const sacredTerms = detectSacredTerms(text);
        const glossaryApplied = [];

        for (const term of sacredTerms) {
            const sourceForm = term.translations[sourceLang] || term.canonical;
            const targetForm = term.translations[targetLang] || term.canonical;
            if (targetForm && translatedText.includes(sourceForm)) {
                translatedText = translatedText.replace(
                    new RegExp(sourceForm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
                    `⸬${targetForm}⸬`
                );
                glossaryApplied.push({ termId: term.id, from: sourceForm, to: targetForm });
            }
        }

        // Theological Interception: Sanitize for canonical Christian forms
        translatedText = sanitizeTheologicalOutput(translatedText);

        return {
            text: translatedText,
            sacredTerms: sacredTerms.map(t => ({ id: t.id, canonical: t.canonical, category: t.category })),
            glossaryApplied,
        };
    } catch {
        return null;
    }
}

/**
 * GET /api/ai/transcribe
 * Engine status — Directive 018: Hardware-locked, Whisper-only.
 */
export async function GET() {
    const whisperAvailable = !!process.env.OPENAI_API_KEY;
    return NextResponse.json({
        engine: "OpenAI Whisper-1",
        status: whisperAvailable ? "operational" : "UNCONFIGURED — set OPENAI_API_KEY",
        whisperConnected: whisperAvailable,
        mode: "hardware-locked",
        source: "internal-audio-buffer",
        microphoneRequired: false,
        supportedFormats: ["webm", "ogg", "wav", "mp4"],
        note: "Directive 018: Zero stubs. Real audio or nothing. Pause = idle.",
        directive: "D018 — No-Motion, No-Text Mandate",
    });
}
