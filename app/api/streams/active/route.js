import { NextResponse } from "next/server";
import { getActiveStreams } from "@/lib/streams";

/**
 * GET /api/streams/active
 * Returns all currently active streams with coordinates and metadata.
 * Powers the Global Aggregator Map.
 *
 * Query params: liveOnly, language, rite, tier, sealedOnly
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);

    const filters = {
        liveOnly: searchParams.get("liveOnly") === "true",
        language: searchParams.get("language") || null,
        rite: searchParams.get("rite") || null,
        tier: searchParams.get("tier") ? Number(searchParams.get("tier")) : null,
        sealedOnly: searchParams.get("sealedOnly") === "true",
    };

    const streams = getActiveStreams(filters);

    return NextResponse.json({
        count: streams.length,
        filters,
        streams: streams.map((s) => ({
            id: s.id,
            name: s.name,
            location: s.location,
            lat: s.lat,
            lng: s.lng,
            language: s.language,
            rite: s.rite,
            authority: s.authority,
            isLive: s.isLive,
            isHQ: s.isHQ || false, // Directive 015: Sovereign Red HQ flag
            digitalSeal: s.digitalSeal,
            viewerCount: s.viewerCount,
            pinned: s.pinned || false,
            youtubeChannel: s.youtubeChannel || null,
        })),
    });
}
