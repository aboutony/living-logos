import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/stewardship";

/**
 * GET /api/stewardship/audit
 *
 * Returns the immutable audit log of all 80/20 sovereign splits.
 * Every transaction is recorded with full traceability.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const log = getAuditLog(limit);

    return NextResponse.json({
        ...log,
        description: "Immutable Sovereign Audit Log — Every transaction split is recorded for total transparency.",
    });
}
