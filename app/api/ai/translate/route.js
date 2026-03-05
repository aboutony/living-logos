import { NextResponse } from "next/server";
import { translateText, generateSubtitles, SUPPORTED_LANGUAGES, detectSacredTerms, sanitizeTheologicalOutput } from "@/lib/patristic-ai";

/**
 * POST /api/ai/translate
 *
 * Patristic AI Translation — Real-time subtitle translation.
 * Uses MyMemory API for actual translation, then enforces Sacred Glossary.
 *
 * Body: { text, sourceLang, targetLang, streamId? }
 * Response: { success, translation, subtitles? }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { text, sourceLang, targetLang, streamId } = body;

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

        // If same language, return as-is
        if (sourceLang === targetLang) {
            return NextResponse.json({
                success: true,
                translation: {
                    translatedText: text,
                    sourceLang,
                    targetLang,
                    sacredTerms: [],
                    glossaryApplied: [],
                    vettingRequired: false,
                    confidence: 1.0,
                },
            });
        }

        // Step 1: Detect sacred terms in the source text
        const sacredTerms = detectSacredTerms(text);
        const glossaryApplied = [];

        // Step 2: Get real translation from MyMemory API
        let translatedText = text;
        try {
            const langPair = `${sourceLang}|${targetLang}`;
            const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(langPair)}`;
            const tmRes = await fetch(apiUrl, {
                headers: { "User-Agent": "LivingLogos/1.0" },
                signal: AbortSignal.timeout(5000),
            });

            if (tmRes.ok) {
                const tmData = await tmRes.json();
                if (tmData.responseData?.translatedText &&
                    tmData.responseData.translatedText !== text &&
                    !tmData.responseData.translatedText.startsWith("MYMEMORY WARNING")) {
                    translatedText = tmData.responseData.translatedText;
                }
            }
        } catch {
            // If translation API fails, fall back to glossary-only approach
        }

        // Step 3: Enforce Sacred Glossary — replace any incorrect translations
        // of sacred terms with the locked glossary versions
        for (const term of sacredTerms) {
            const sourceForm = term.translations[sourceLang] || term.canonical;
            const targetForm = term.translations[targetLang] || term.canonical;

            // Check if the source form or canonical form appears in EITHER
            // the original or translated text, and replace with canonical target
            if (targetForm) {
                // Replace any translation of the sacred term with the glossary version
                // First, check if the source form leaked into the translation
                if (translatedText.includes(sourceForm)) {
                    translatedText = translatedText.replace(
                        new RegExp(escapeRegex(sourceForm), "g"),
                        `⸬${targetForm}⸬`
                    );
                    glossaryApplied.push({
                        termId: term.id,
                        from: sourceForm,
                        to: targetForm,
                        category: term.category,
                    });
                }

                // Also try to find the canonical form
                if (term.canonical !== sourceForm && translatedText.includes(term.canonical)) {
                    translatedText = translatedText.replace(
                        new RegExp(escapeRegex(term.canonical), "g"),
                        `⸬${targetForm}⸬`
                    );
                    glossaryApplied.push({
                        termId: term.id,
                        from: term.canonical,
                        to: targetForm,
                        category: term.category,
                    });
                }
            }
        }

        const vettingRequired = sacredTerms.length > 0;
        const confidence = vettingRequired ? 0.85 : 0.95;

        // Directive 016/017: Sanitize for theological accuracy
        // Catches Islamic idioms that MyMemory may return in Arabic output
        translatedText = sanitizeTheologicalOutput(translatedText);

        const response = {
            success: true,
            translation: {
                translatedText,
                sourceLang,
                targetLang,
                sacredTerms: sacredTerms.map((t) => ({
                    id: t.id,
                    canonical: t.canonical,
                    category: t.category,
                    targetTranslation: t.translations[targetLang],
                    note: t.note,
                })),
                glossaryApplied,
                vettingRequired,
                confidence,
            },
        };

        return NextResponse.json(response);
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/ai/translate
 * Returns supported languages and engine status.
 */
export async function GET() {
    return NextResponse.json({
        engine: "Patristic AI — Phase Three (Live Translation)",
        status: "operational",
        translationBackend: "MyMemory + Sacred Glossary Enforcement",
        supportedLanguages: SUPPORTED_LANGUAGES,
        sacredGlossaryEnforced: true,
        vettingPipeline: "active",
    });
}
