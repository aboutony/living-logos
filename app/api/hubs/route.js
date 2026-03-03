import { NextResponse } from "next/server";
import { getHubs } from "@/lib/regional-hubs";

/**
 * GET /api/hubs
 *
 * Returns all five regional production hubs with content counts and live status.
 */
export async function GET() {
    const hubs = getHubs();

    return NextResponse.json({
        success: true,
        network: "The Living Logos — Regional Production Hubs",
        totalHubs: hubs.length,
        liveHubs: hubs.filter((h) => h.isLive).length,
        hubs,
    });
}
