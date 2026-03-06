import { NextResponse } from "next/server";

/**
 * POST/GET /api/analytics/selection
 * Directive 019: Anonymous Selection Event tracking for Diaspora Heat Map.
 *
 * POST — Records { language, country, timestamp }
 * GET  — Returns aggregated distribution data for the Broadcaster Portal
 *
 * Phase One: In-memory store. Production would persist to a sovereign database.
 */

// ── In-memory selection events store ──
const selectionEvents = [];

export async function POST(request) {
    try {
        const body = await request.json();
        const { language, country, timestamp } = body;

        if (!language || !country) {
            return NextResponse.json(
                { success: false, error: "language and country are required" },
                { status: 400 }
            );
        }

        const event = {
            id: `sel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            language: language, // e.g. { code: "el", name: "Ελληνικά" }
            country: country,  // e.g. { code: "CY", name: "Cyprus" }
            timestamp: timestamp || new Date().toISOString(),
            recordedAt: new Date().toISOString(),
        };

        selectionEvents.push(event);

        return NextResponse.json({
            success: true,
            event: { id: event.id },
            totalEvents: selectionEvents.length,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }
}

export async function GET() {
    // ── Aggregate language distribution ──
    const langCounts = {};
    const countryCounts = {};

    for (const evt of selectionEvents) {
        const lKey = evt.language?.code || "unknown";
        const lName = evt.language?.name || lKey;
        if (!langCounts[lKey]) langCounts[lKey] = { code: lKey, name: lName, count: 0 };
        langCounts[lKey].count++;

        const cKey = evt.country?.code || "unknown";
        const cName = evt.country?.name || cKey;
        if (!countryCounts[cKey]) countryCounts[cKey] = { code: cKey, name: cName, count: 0 };
        countryCounts[cKey].count++;
    }

    // Sort by count descending
    const topLanguages = Object.values(langCounts).sort((a, b) => b.count - a.count);
    const topCountries = Object.values(countryCounts).sort((a, b) => b.count - a.count);

    return NextResponse.json({
        success: true,
        totalEvents: selectionEvents.length,
        distribution: {
            languages: topLanguages,
            countries: topCountries,
        },
        recentEvents: selectionEvents.slice(-10).reverse(),
    });
}
