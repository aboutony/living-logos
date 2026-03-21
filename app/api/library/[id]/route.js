import { NextResponse } from "next/server";
import { getLibraryItemById, libraryItemToStream } from "@/lib/library";

/**
 * GET /api/library/[id]
 * Returns a single VOD library item formatted as a stream-compatible object.
 *
 * Atomic Command 16: VOD Library Expansion
 * Used by the watch page to load VOD content.
 */
export async function GET(request, { params }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json(
            { error: "Missing library item ID" },
            { status: 400 }
        );
    }

    const item = getLibraryItemById(id);

    if (!item) {
        return NextResponse.json(
            { error: `Library item '${id}' not found` },
            { status: 404 }
        );
    }

    const streamData = libraryItemToStream(item);

    return NextResponse.json({
        success: true,
        stream: streamData,
        source: "library-vod",
    });
}
