import { NextResponse } from "next/server";
import { getParishFunds } from "@/lib/stewardship";

/**
 * GET /api/stewardship/parish?streamId=<id>
 *
 * Returns accumulated stewardship funds for a specific parish.
 * Used by the Broadcaster Portal / Parish Dashboard.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
        return NextResponse.json(
            { error: "streamId query parameter is required" },
            { status: 400 }
        );
    }

    const funds = getParishFunds(streamId);

    return NextResponse.json({
        ...funds,
        policy: {
            parishShare: "80%",
            networkShare: "20%",
            platformFee: "0% — Zero Platform Fees (Sovereign Covenant)",
        },
    });
}
