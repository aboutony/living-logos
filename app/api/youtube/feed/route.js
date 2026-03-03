import { NextResponse } from "next/server";

/**
 * GET /api/youtube/feed?handle=@rumorthodox9171
 * 
 * Fetches the public YouTube RSS feed for a channel and returns
 * the latest videos with embed-ready IDs. No API key required.
 * Uses youtube-nocookie.com for privacy-enhanced embedding.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get("handle");
    const channelId = searchParams.get("channelId");

    if (!handle && !channelId) {
        return NextResponse.json(
            { error: "Provide 'handle' or 'channelId' query parameter" },
            { status: 400 }
        );
    }

    try {
        // Step 1: Resolve the channel page to get the canonical channel ID
        let resolvedChannelId = channelId;

        if (!resolvedChannelId && handle) {
            // Fetch channel page to extract channel ID from meta tags
            const channelPageRes = await fetch(
                `https://www.youtube.com/${handle}`,
                {
                    headers: {
                        "User-Agent": "Mozilla/5.0 (compatible; LivingLogos/1.0)",
                    },
                }
            );

            if (channelPageRes.ok) {
                const html = await channelPageRes.text();
                // Extract channel ID from the page
                const channelIdMatch = html.match(
                    /\"channelId\":\"(UC[a-zA-Z0-9_-]+)\"/
                );
                if (channelIdMatch) {
                    resolvedChannelId = channelIdMatch[1];
                }

                // Also try external ID meta tag
                if (!resolvedChannelId) {
                    const externalIdMatch = html.match(
                        /<meta\s+itemprop="channelId"\s+content="(UC[a-zA-Z0-9_-]+)"/
                    );
                    if (externalIdMatch) {
                        resolvedChannelId = externalIdMatch[1];
                    }
                }
            }
        }

        if (!resolvedChannelId) {
            return NextResponse.json(
                { error: "Could not resolve channel ID", handle },
                { status: 404 }
            );
        }

        // Step 2: Fetch the YouTube RSS feed
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${resolvedChannelId}`;
        const rssRes = await fetch(rssUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; LivingLogos/1.0)",
            },
        });

        if (!rssRes.ok) {
            return NextResponse.json(
                { error: "Failed to fetch YouTube RSS feed", status: rssRes.status },
                { status: 502 }
            );
        }

        const rssXml = await rssRes.text();

        // Step 3: Parse video entries from the RSS XML
        const videos = [];
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(rssXml)) !== null && videos.length < 12) {
            const entry = match[1];

            const videoId = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
            const title = entry.match(/<title>([^<]+)<\/title>/)?.[1];
            const published = entry.match(/<published>([^<]+)<\/published>/)?.[1];
            const updated = entry.match(/<updated>([^<]+)<\/updated>/)?.[1];
            const views = entry.match(/views="(\d+)"/)?.[1];
            const thumbnail = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1];

            if (videoId && title) {
                videos.push({
                    videoId,
                    title: decodeXmlEntities(title),
                    published,
                    updated,
                    views: views ? parseInt(views, 10) : 0,
                    thumbnail: thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
                });
            }
        }

        // Extract channel title
        const channelTitle = rssXml.match(/<title>([^<]+)<\/title>/)?.[1] || handle;

        return NextResponse.json({
            channelId: resolvedChannelId,
            channelTitle: decodeXmlEntities(channelTitle),
            handle,
            videoCount: videos.length,
            videos,
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Internal error fetching YouTube feed", details: err.message },
            { status: 500 }
        );
    }
}

function decodeXmlEntities(str) {
    return str
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}
