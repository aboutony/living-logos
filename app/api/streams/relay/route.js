import { NextResponse } from "next/server";
import { getStreamById } from "@/lib/streams";

/**
 * POST /api/streams/relay
 * Configure multi-platform relay targets for a stream.
 * Once a stream hits the Canonical API, it is simultaneously
 * pushed to the Official App and the parish's YouTube/Facebook.
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { stream_id, relay_targets } = body;

        if (!stream_id) {
            return NextResponse.json(
                { error: "Missing stream_id" },
                { status: 400 }
            );
        }

        const stream = getStreamById(stream_id);
        if (!stream) {
            return NextResponse.json(
                { error: "Stream not found", stream_id },
                { status: 404 }
            );
        }

        // Update relay targets
        const validTargets = ["youtube", "facebook", "app"];
        const targets = (relay_targets || []).filter((t) =>
            validTargets.includes(t.toLowerCase())
        );
        stream.relayTargets = targets;

        return NextResponse.json({
            success: true,
            stream_id: stream.id,
            relay_targets: stream.relayTargets,
            message: `Relay configured: signal will be pushed to ${targets.join(", ")}`,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Invalid request", details: err.message },
            { status: 400 }
        );
    }
}
