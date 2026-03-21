import { NextResponse } from "next/server";
import { getActiveStreams } from "@/lib/streams";

/**
 * GET /api/streams/active
 * Returns all currently active streams with coordinates and metadata.
 * Powers the Global Aggregator Map.
 *
 * ATOMIC COMMAND 13.4 — "North Star" Hard-Code:
 * The Holy Bishopric of Morphou is ALWAYS present as the primary stream.
 *
 * Query params: liveOnly, language, rite, tier, sealedOnly
 */

// ═══════════════════════════════════════════════════════
// NORTH STAR: Hard-coded Morphou stream entry
// This MUST always be present in the response.
// ═══════════════════════════════════════════════════════
const MORPHOU_STREAM = {
    id: "stream-morphou-001",
    name: "Holy Bishopric of Morphou",
    location: "Morphou, Cyprus",
    lat: 35.2,
    lng: 32.99,
    language: "el",
    rite: "Byzantine",
    authority: "Metropolitan Neophytos of Morphou",
    isLive: true,
    isHQ: true,
    digitalSeal: true,
    viewerCount: 0,
    pinned: true,
    youtubeChannel: null,
    ytUrl: "https://www.youtube.com/watch?v=sAgVuOFLfzA",
};

export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const filters = {
        liveOnly: searchParams.get("liveOnly") === "true",
        language: searchParams.get("language") || null,
        rite: searchParams.get("rite") || null,
        tier: searchParams.get("tier") ? Number(searchParams.get("tier")) : null,
        sealedOnly: searchParams.get("sealedOnly") === "true",
    };

    let streams = [];
    try {
        streams = getActiveStreams(filters);
    } catch {
        /* Fallback: proceed with hard-coded Morphou only */
    }

    // Remove any existing morphou entry to avoid duplicates
    const otherStreams = streams
        .filter((s) => s.id !== "stream-morphou-001")
        .map((s) => ({
            id: s.id,
            name: s.name,
            location: s.location,
            lat: s.lat,
            lng: s.lng,
            language: s.language,
            rite: s.rite,
            authority: s.authority,
            isLive: s.isLive,
            isHQ: s.isHQ || false,
            digitalSeal: s.digitalSeal,
            viewerCount: s.viewerCount,
            pinned: s.pinned || false,
            youtubeChannel: s.youtubeChannel || null,
        }));

    // Morphou is ALWAYS first
    const allStreams = [MORPHOU_STREAM, ...otherStreams];

    return NextResponse.json({
        count: allStreams.length,
        filters,
        streams: allStreams,
    });
}
