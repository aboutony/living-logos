import { NextResponse } from "next/server";
import { translateText, generateSubtitles, SUPPORTED_LANGUAGES } from "@/lib/patristic-ai";

/**
 * POST /api/ai/translate
 *
 * Patristic AI Translation — Real-time subtitle generation from live audio feed.
 * Sacred terms are locked to the canonical glossary and never altered by AI.
 *
 * Body: { text, sourceLang, targetLang, streamId? }
 * Response: { success, translation, subtitles? }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { text, sourceLang, targetLang, streamId } = body;

        // Validate required fields
        if (!text || typeof text !== "string") {
            return NextResponse.json(
                { success: false, error: "text is required (string)" },
                { status: 400 }
            );
        }
        if (!sourceLang || !targetLang) {
            return NextResponse.json(
                { success: false, error: "sourceLang and targetLang are required" },
                { status: 400 }
            );
        }

        // Execute glossary-enforced translation
        const result = translateText(text, sourceLang, targetLang);

        if (result.error) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        const response = {
            success: true,
            translation: result,
        };

        // If a streamId is provided, also generate time-coded subtitles
        if (streamId) {
            response.subtitles = generateSubtitles(streamId, targetLang);
        }

        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }
}

/**
 * GET /api/ai/translate
 * Returns supported languages and engine status.
 */
export async function GET() {
    return NextResponse.json({
        engine: "Patristic AI — Phase Three",
        status: "operational",
        supportedLanguages: SUPPORTED_LANGUAGES,
        sacredGlossaryEnforced: true,
        vettingPipeline: "active",
    });
}
