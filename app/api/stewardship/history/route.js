import { NextResponse } from "next/server";
import { getBelieverHistory } from "@/lib/stewardship";

/**
 * GET /api/stewardship/history?did=<did>
 *
 * Returns the stewardship history for a believer identified by their DID.
 * Shows all candles lit, parishes supported, and total given.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const did = searchParams.get("did") || "anonymous";

    const history = getBelieverHistory(did);

    return NextResponse.json({
        ...history,
        description: "Your sovereign stewardship record — every candle lit, every parish supported.",
    });
}
