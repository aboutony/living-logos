import { NextResponse } from "next/server";
import { getHubById, getHubFeed } from "@/lib/regional-hubs";

/**
 * GET /api/hubs/[hubId]/feed
 *
 * Returns the content feed for a specific regional hub.
 * Optional query: ?type=news|feature|youth|editorial
 */
export async function GET(request, { params }) {
    const { hubId } = await params;

    const hub = getHubById(hubId);
    if (!hub) {
        return NextResponse.json(
            { success: false, error: `Hub not found: ${hubId}` },
            { status: 404 }
        );
    }

    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get("type");

    const feed = getHubFeed(hubId, typeFilter || undefined);

    return NextResponse.json({
        success: true,
        hub: {
            id: hub.id,
            name: hub.name,
            city: hub.city,
            isLive: hub.isLive,
        },
        filter: typeFilter || "all",
        ...feed,
    });
}
