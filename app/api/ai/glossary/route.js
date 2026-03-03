import { NextResponse } from "next/server";
import { getGlossary, lookupTerm, SUPPORTED_LANGUAGES } from "@/lib/patristic-ai";

/**
 * GET /api/ai/glossary
 *
 * Sacred Glossary — Immutable theological term dictionary.
 * Optional query: ?lang=en (filter to a single target language)
 *                 ?term=term-theotokos (lookup a specific term)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang");
    const termQuery = searchParams.get("term");

    // Single term lookup
    if (termQuery) {
        const term = lookupTerm(termQuery);
        if (!term) {
            return NextResponse.json(
                { success: false, error: `Term not found: ${termQuery}` },
                { status: 404 }
            );
        }
        return NextResponse.json({
            success: true,
            term: {
                id: term.id,
                canonical: term.canonical,
                category: term.category,
                locked: term.locked,
                translations: term.translations,
                note: term.note,
            },
        });
    }

    // Full glossary (optionally filtered by language)
    const glossary = getGlossary(lang || null);

    return NextResponse.json({
        success: true,
        engine: "Patristic AI — Sacred Glossary",
        locked: true,
        totalTerms: glossary.length,
        supportedLanguages: SUPPORTED_LANGUAGES,
        languageFilter: lang || "all",
        glossary,
    });
}
