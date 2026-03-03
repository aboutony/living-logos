import { NextResponse } from "next/server";
import { getPublicAuditLog, getTreasuryStats } from "@/lib/stewardship";
import { getNetworkStats } from "@/lib/streams";

/**
 * GET /api/stewardship/broadcaster
 * Directive 010: Public transparency endpoint for the Broadcaster Portal.
 * Returns sanitized audit log + treasury stats (no donor DIDs).
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const auditLog = getPublicAuditLog(limit);
    const treasury = getTreasuryStats();
    const network = getNetworkStats();

    return NextResponse.json({
        success: true,
        portal: "Broadcaster Portal — Financial Transparency",
        network: { totalParishes: network.total, liveNow: network.live, sealed: network.sealed },
        treasury,
        auditLog,
    });
}
