import { NextResponse } from "next/server";
import { SUPPORTED_LANGUAGES, detectSacredTerms, sanitizeTheologicalOutput } from "@/lib/patristic-ai";

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

        // Step 2: Translate using OpenAI GPT-4o-mini — contextual, theology-aware
        let translatedText = text;
        const apiKey = process.env.OPENAI_API_KEY;
        if (apiKey) {
            try {
                const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;
                const sourceLangName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;

                const systemPrompt = [
                    `You are a Greek Orthodox theological translator. Translate from ${sourceLangName} to ${targetLangName}.`,
                    "",
                    "RULES:",
                    "1. Translate MEANING and CONTEXT, not word-by-word.",
                    "2. You are an expert in Orthodox Christianity — Patristics, liturgy, hagiography, and dogma.",
                    "3. Saint names MUST use their correct international transliterations:",
                    "   Παΐσιος = Paisios (NEVER Baisios), Νεόφυτος = Neophytos, Πορφύριος = Porphyrios,",
                    "   Χρυσόστομος = Chrysostom, Αθανάσιος = Athanasios, Βασίλειος = Basil,",
                    "   Γρηγόριος = Gregory, Νεκτάριος = Nectarios, Σπυρίδων = Spyridon,",
                    "   Κοσμάς Αιτωλός = Kosmas Aitolos, Σεραφείμ Σαρώφ = Seraphim of Sarov,",
                    "   Λουκάς Κριμαίας = Luke of Crimea, Σωφρόνιος = Sophrony.",
                    "4. Theological terms: Θεοτόκος = Theotokos (Mother of God), Θέωσις = Theosis (Deification),",
                    "   Ἡσυχασμός = Hesychasm, Θεία Λειτουργία = Divine Liturgy, ὁμοούσιος = Consubstantial.",
                    "5. Preserve the register and gravitas of ecclesiastical speech.",
                    "6. Output ONLY the translation, no commentary, no brackets, no metadata.",
                    "7. If you cannot translate a phrase, transliterate it — never output [SUBTITLE] or symbols.",
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

                if (gptRes.ok) {
                    const gptData = await gptRes.json();
                    const translation = gptData.choices?.[0]?.message?.content?.trim();
                    if (translation && translation.length > 1) {
                        translatedText = translation;
                    }
                }
            } catch {
                // If GPT fails, fall back to original text
            }
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
        translationBackend: "OpenAI GPT-4o-mini + Sacred Glossary Enforcement",
        supportedLanguages: SUPPORTED_LANGUAGES,
        sacredGlossaryEnforced: true,
        vettingPipeline: "active",
    });
}
