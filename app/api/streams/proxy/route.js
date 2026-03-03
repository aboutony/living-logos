import { NextResponse } from "next/server";
import { stripSecularMetadata, sanitizeHeaders, isSafeOrigin } from "@/lib/proxy-filter";

/**
 * GET /api/streams/proxy
 * Sovereign Proxy Filter — strips secular metadata and trackers
 * from third-party feeder signal URLs.
 *
 * Query param: url — the raw third-party URL to sanitize
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get("url");

    if (!rawUrl) {
        return NextResponse.json(
            { error: "Missing 'url' query parameter" },
            { status: 400 }
        );
    }

    // Check if the URL is from a blocked ad/tracker domain
    if (!isSafeOrigin(rawUrl)) {
        return NextResponse.json(
            {
                error: "Blocked origin",
                message:
                    "This URL originates from a secular advertising or tracking domain and has been filtered by the Sovereign Proxy.",
            },
            { status: 403 }
        );
    }

    // Strip tracking parameters
    const cleanedUrl = stripSecularMetadata(rawUrl);

    // Demonstrate header sanitization
    const sampleHeaders = {
        "content-type": "video/mp4",
        "x-google-analytics": "UA-12345-1",
        "x-fb-trace-id": "abc123",
        "cache-control": "no-cache",
        "set-cookie": "_ga=GA1.2.xxx; _fbp=fb.1.xxx",
    };
    const cleanedHeaders = sanitizeHeaders(sampleHeaders);

    return NextResponse.json({
        original_url: rawUrl,
        sanitized_url: cleanedUrl,
        params_stripped: rawUrl.length - cleanedUrl.length > 0,
        headers_sanitized: cleanedHeaders,
        sovereign_status: "✦ Signal purified — secular metadata removed",
    });
}
