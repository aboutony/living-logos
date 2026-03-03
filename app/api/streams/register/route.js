import { NextResponse } from "next/server";
import { registerStream } from "@/lib/streams";

/**
 * POST /api/streams/register
 * Register a new parish stream with the Canonical API.
 * Validates mandatory "One Doctrine" tagging.
 */
export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        const required = ["name", "language", "rite", "authorityTier"];
        const missing = required.filter((f) => !body[f]);
        if (missing.length > 0) {
            return NextResponse.json(
                {
                    error: "Missing required fields",
                    missing,
                    message:
                        "Every stream must include: name, language, rite, and authorityTier (1, 2, or 3).",
                },
                { status: 400 }
            );
        }

        // Validate authority tier
        if (![1, 2, 3].includes(Number(body.authorityTier))) {
            return NextResponse.json(
                { error: "authorityTier must be 1 (Patriarchal), 2 (Archdiocesan), or 3 (Parish)" },
                { status: 400 }
            );
        }

        const stream = registerStream(body);

        return NextResponse.json(
            {
                success: true,
                stream_id: stream.id,
                digital_seal: stream.digitalSeal,
                message: stream.digitalSeal
                    ? "Stream registered with Digital Seal of Authenticity."
                    : "Stream registered. Digital Seal pending verification by canonical authority.",
                relay_endpoints: stream.relayTargets,
            },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            { error: "Invalid request body", details: err.message },
            { status: 400 }
        );
    }
}
