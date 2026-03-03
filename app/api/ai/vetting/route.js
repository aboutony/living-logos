import { NextResponse } from "next/server";
import {
    submitForVetting,
    getVettingQueue,
    approveTranslation,
    rejectTranslation,
} from "@/lib/patristic-ai";

/**
 * POST /api/ai/vetting
 *
 * Submit a translation for Tier 1 Editorial Board review.
 * Body: { sourceText, sourceLang, targetLang, translatedText, sacredTermsDetected?, streamId? }
 *
 * OR approve/reject:
 * Body: { action: "approve"|"reject", id, reviewerName?, reason? }
 */
export async function POST(request) {
    try {
        const body = await request.json();

        // ── Editorial Action (Approve / Reject) ──
        if (body.action) {
            if (body.action === "approve") {
                if (!body.id) {
                    return NextResponse.json(
                        { success: false, error: "id is required for approval" },
                        { status: 400 }
                    );
                }
                const result = approveTranslation(body.id, body.reviewerName);
                return NextResponse.json(result, { status: result.success ? 200 : 400 });
            }

            if (body.action === "reject") {
                if (!body.id || !body.reason) {
                    return NextResponse.json(
                        { success: false, error: "id and reason are required for rejection" },
                        { status: 400 }
                    );
                }
                const result = rejectTranslation(body.id, body.reason, body.reviewerName);
                return NextResponse.json(result, { status: result.success ? 200 : 400 });
            }

            return NextResponse.json(
                { success: false, error: "Invalid action. Use 'approve' or 'reject'." },
                { status: 400 }
            );
        }

        // ── Submit for Vetting ──
        if (!body.sourceText || !body.translatedText) {
            return NextResponse.json(
                { success: false, error: "sourceText and translatedText are required" },
                { status: 400 }
            );
        }

        const entry = submitForVetting({
            sourceText: body.sourceText,
            sourceLang: body.sourceLang || "el",
            targetLang: body.targetLang || "en",
            translatedText: body.translatedText,
            sacredTermsDetected: body.sacredTermsDetected || [],
            streamId: body.streamId || null,
            confidence: body.confidence || 0,
        });

        return NextResponse.json({
            success: true,
            message: "Translation submitted for Tier 1 Editorial Board review",
            entry,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Invalid request body" },
            { status: 400 }
        );
    }
}

/**
 * GET /api/ai/vetting
 *
 * Fetch the vetting queue. Optional: ?status=pending|approved|rejected
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const queue = getVettingQueue(status || undefined);

    return NextResponse.json({
        success: true,
        pipeline: "Dogma-Vetting — Tier 1 Editorial Board",
        filter: status || "all",
        ...queue,
    });
}
