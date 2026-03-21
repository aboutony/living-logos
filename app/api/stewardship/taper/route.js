import { NextResponse } from "next/server";
import { lightCandle, TAPER_AMOUNTS } from "@/lib/stewardship";

/**
 * POST /api/stewardship/taper
 *
 * "Light a Candle" — Execute an 80/20 sovereign split transaction.
 *
 * Body: { streamId: string, amount: number, donorDid?: string }
 * Response: { success, transaction }
 */
export async function POST(request) {
    try {
        const body = await request.json();
        const { streamId: rawStreamId, contentId, amount, donorDid } = body;

        // Accept contentId as alias for streamId (VOD bridge)
        const streamId = rawStreamId || contentId;

        // Validate required fields
        if (!streamId) {
            return NextResponse.json(
                { success: false, error: "streamId or contentId is required" },
                { status: 400 }
            );
        }
        if (!amount || typeof amount !== "number" || amount <= 0) {
            return NextResponse.json(
                { success: false, error: "amount must be a positive number" },
                { status: 400 }
            );
        }

        // Execute sovereign split
        const result = lightCandle(streamId, amount, donorDid || null);

        if (!result.success) {
            return NextResponse.json(result, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `🕯️ Candle lit! $${amount.toFixed(2)} routed to ${result.transaction.parishName}`,
            transaction: result.transaction,
            canonicalAmounts: TAPER_AMOUNTS,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }
}
