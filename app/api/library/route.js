import { NextResponse } from "next/server";
import { getLibraryItems, getCategoryMeta } from "@/lib/library";

/**
 * GET /api/library
 * Returns VOD library items, optionally filtered by category.
 *
 * Atomic Command 16: VOD Library Expansion
 *
 * Query params:
 *   category — "sermons" | "documentaries" | "movies" (optional)
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || null;

    const items = getLibraryItems(category);
    const categories = getCategoryMeta();

    return NextResponse.json({
        count: items.length,
        category: category || "all",
        categories,
        items,
    });
}
