/**
 * THE LIVING LOGOS — Regional Production Hub Registry
 * Phase Three: The Global Newsroom & Production
 *
 * Five regional studios for localized news, features, and "Life in Christ" content.
 * Each hub feeds into the 24/7 linear channel via the Canonical API.
 */

import { v4Stub } from "./utils.js";

// ── Hub Capabilities ──
const HUB_CAPABILITIES = {
    LIVE_NEWS: "Live News Bureau",
    DOCUMENTARY: "Documentary Production",
    YOUTH_PULSE: "Youth Pulse (Short-Form)",
    TALK_RADIO: "Apostolic Ear (Talk Radio)",
    DUBBING: "AI Dubbing Studio",
    PATRISTIC_AI: "Patristic AI Translation Hub",
};

// ══════════════════════════════════════════════════════════
//   REGIONAL HUB SEED DATA — Five Production Centers
// ══════════════════════════════════════════════════════════

const seedHubs = [
    {
        id: "hub-athens",
        name: "Athens Bureau",
        city: "Athens",
        country: "Greece",
        lat: 37.9838,
        lng: 23.7275,
        timezone: "Europe/Athens",
        languages: ["el", "en"],
        flag: "🇬🇷",
        capabilities: [
            HUB_CAPABILITIES.LIVE_NEWS,
            HUB_CAPABILITIES.DOCUMENTARY,
            HUB_CAPABILITIES.PATRISTIC_AI,
        ],
        bureauChief: "Metropolitan Editorial Board — Athens",
        isLive: true,
        description: "The heart of Hellenistic Orthodoxy. Primary hub for liturgical documentation, Patristic AI training data, and pan-Orthodox news coverage.",
        ingestEndpoint: "rtmp://hubs.livinglogos.net/athens",
    },
    {
        id: "hub-istanbul",
        name: "Constantinople Bureau",
        city: "Istanbul",
        country: "Turkey",
        lat: 41.0082,
        lng: 28.9784,
        timezone: "Europe/Istanbul",
        languages: ["el", "en", "ar"],
        flag: "🇹🇷",
        capabilities: [
            HUB_CAPABILITIES.LIVE_NEWS,
            HUB_CAPABILITIES.DOCUMENTARY,
        ],
        bureauChief: "Ecumenical Patriarchate Communications Office",
        isLive: true,
        description: "The Ecumenical seat. Covers Patriarchal encyclicals, Phanar events, and intercultural Orthodox dialogue across the Middle East.",
        ingestEndpoint: "rtmp://hubs.livinglogos.net/istanbul",
    },
    {
        id: "hub-newyork",
        name: "New York Bureau",
        city: "New York",
        country: "United States",
        lat: 40.7128,
        lng: -74.0060,
        timezone: "America/New_York",
        languages: ["en", "el"],
        flag: "🇺🇸",
        capabilities: [
            HUB_CAPABILITIES.LIVE_NEWS,
            HUB_CAPABILITIES.YOUTH_PULSE,
            HUB_CAPABILITIES.TALK_RADIO,
        ],
        bureauChief: "Greek Orthodox Archdiocese of America — Media Division",
        isLive: false,
        description: "The Americas hub. Focuses on diaspora youth engagement, English-language theological education, and 'Life in Christ' feature programming.",
        ingestEndpoint: "rtmp://hubs.livinglogos.net/newyork",
    },
    {
        id: "hub-sydney",
        name: "Sydney Bureau",
        city: "Sydney",
        country: "Australia",
        lat: -33.8688,
        lng: 151.2093,
        timezone: "Australia/Sydney",
        languages: ["en", "el"],
        flag: "🇦🇺",
        capabilities: [
            HUB_CAPABILITIES.LIVE_NEWS,
            HUB_CAPABILITIES.DUBBING,
            HUB_CAPABILITIES.YOUTH_PULSE,
        ],
        bureauChief: "Greek Orthodox Archdiocese of Australia — Production",
        isLive: false,
        description: "Oceania and Asia-Pacific coverage. Specializes in AI dubbing for the Asia-Pacific diaspora and youth-focused vertical content.",
        ingestEndpoint: "rtmp://hubs.livinglogos.net/sydney",
    },
    {
        id: "hub-nairobi",
        name: "Nairobi Bureau",
        city: "Nairobi",
        country: "Kenya",
        lat: -1.2921,
        lng: 36.8219,
        timezone: "Africa/Nairobi",
        languages: ["sw", "en", "fr"],
        flag: "🇰🇪",
        capabilities: [
            HUB_CAPABILITIES.LIVE_NEWS,
            HUB_CAPABILITIES.DOCUMENTARY,
            HUB_CAPABILITIES.PATRISTIC_AI,
        ],
        bureauChief: "Orthodox Church of Kenya — Media Outreach",
        isLive: false,
        description: "The African frontier. Covers the rapidly growing Orthodox communities across East and Central Africa with multilingual content in Swahili, English, and French.",
        ingestEndpoint: "rtmp://hubs.livinglogos.net/nairobi",
    },
];

// ══════════════════════════════════════════════════════════
//   CONTENT FEED — In-Memory Store
// ══════════════════════════════════════════════════════════

const CONTENT_TYPES = {
    NEWS: "news",
    FEATURE: "feature",
    YOUTH: "youth",
    EDITORIAL: "editorial",
};

// Seed content feed
let contentFeed = [
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-athens",
        type: CONTENT_TYPES.NEWS,
        title: "Synod of the Church of Greece Addresses Digital Evangelism",
        summary: "The Holy Synod convenes to discuss the role of digital platforms in the missionary mandate of the Church, emphasizing sovereignty over secular tech dependency.",
        author: "Athens Bureau",
        publishedAt: "2026-03-03T09:00:00Z",
        language: "el",
        thumbnailUrl: null,
        duration: "4:30",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-athens",
        type: CONTENT_TYPES.DOCUMENTARY,
        title: "The Monasteries of Meteora — Faith Above the Clouds",
        summary: "A cinematic journey through the suspended monasteries of Meteora, exploring 600 years of monastic life and unbroken liturgical tradition.",
        author: "Athens Bureau — Documentaries",
        publishedAt: "2026-03-02T14:00:00Z",
        language: "el",
        thumbnailUrl: null,
        duration: "48:00",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-istanbul",
        type: CONTENT_TYPES.NEWS,
        title: "Ecumenical Patriarch Issues Encyclical on Peace in the Middle East",
        summary: "His All-Holiness calls for prayer, dialogue, and humanitarian action across the Orthodox world in response to ongoing conflicts in the region.",
        author: "Constantinople Bureau",
        publishedAt: "2026-03-03T07:30:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "6:15",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-istanbul",
        type: CONTENT_TYPES.EDITORIAL,
        title: "The Phanar and the Future: A Digital Bridge Between East and West",
        summary: "An editorial exploring how the Ecumenical Patriarchate is leveraging technology to maintain Orthodox unity across jurisdictional boundaries.",
        author: "Patriarchal Communications Office",
        publishedAt: "2026-03-01T11:00:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "8:45",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-newyork",
        type: CONTENT_TYPES.YOUTH,
        title: "Faith & Finals: Orthodox Students Navigate Campus Life",
        summary: "A Youth Pulse short following three Orthodox college students balancing faith, fasting, and finals at American universities.",
        author: "New York Bureau — Youth Pulse",
        publishedAt: "2026-03-02T18:00:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "3:20",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-newyork",
        type: CONTENT_TYPES.FEATURE,
        title: "Life in Christ: The Baker of Brooklyn Who Bakes Prosphora for 40 Parishes",
        summary: "A heartwarming feature on Maria Papadopoulos, who has baked sacramental bread for four decades, explaining the theology behind each loaf.",
        author: "New York Bureau — Features",
        publishedAt: "2026-03-01T15:30:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "12:00",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-sydney",
        type: CONTENT_TYPES.NEWS,
        title: "Australian Orthodox Youth Conference Draws Record Attendance",
        summary: "Over 2,000 young Orthodox Christians gathered in Melbourne for the largest Orthodox youth event in the Southern Hemisphere.",
        author: "Sydney Bureau",
        publishedAt: "2026-03-02T08:00:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "5:10",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-sydney",
        type: CONTENT_TYPES.YOUTH,
        title: "Chanting in the Outback: Young Cantors Keep Tradition Alive",
        summary: "A Youth Pulse short on Byzantine chanting workshops for Indigenous and immigrant communities in rural Australia.",
        author: "Sydney Bureau — Youth Pulse",
        publishedAt: "2026-03-01T06:00:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "2:50",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-nairobi",
        type: CONTENT_TYPES.NEWS,
        title: "New Orthodox Seminary Opens in Nairobi to Serve East Africa",
        summary: "The first dedicated Orthodox theological seminary in East Africa opens its doors, offering instruction in Swahili, English, and liturgical Greek.",
        author: "Nairobi Bureau",
        publishedAt: "2026-03-03T06:00:00Z",
        language: "sw",
        thumbnailUrl: null,
        duration: "7:00",
        isLive: false,
    },
    {
        id: `content-${v4Stub()}`,
        hubId: "hub-nairobi",
        type: CONTENT_TYPES.DOCUMENTARY,
        title: "The Orthodox of the Great Rift: Faith on the African Frontier",
        summary: "A documentary exploring the growth of Orthodoxy across Kenya, Uganda, and Tanzania, told through the voices of local clergy and faithful.",
        author: "Nairobi Bureau — Documentaries",
        publishedAt: "2026-02-28T10:00:00Z",
        language: "en",
        thumbnailUrl: null,
        duration: "36:00",
        isLive: false,
    },
];

// ══════════════════════════════════════════════════════════
//   HUB OPERATIONS
// ══════════════════════════════════════════════════════════

let hubs = [...seedHubs];

/**
 * Get all regional hubs with content counts.
 */
export function getHubs() {
    return hubs.map((hub) => ({
        ...hub,
        contentCount: contentFeed.filter((c) => c.hubId === hub.id).length,
    }));
}

/**
 * Get a single hub by ID.
 */
export function getHubById(hubId) {
    const hub = hubs.find((h) => h.id === hubId);
    if (!hub) return null;
    return {
        ...hub,
        contentCount: contentFeed.filter((c) => c.hubId === hubId).length,
    };
}

/**
 * Get the content feed for a specific hub.
 * @param {string} hubId
 * @param {string} [typeFilter] - "news" | "feature" | "youth" | "editorial"
 */
export function getHubFeed(hubId, typeFilter) {
    let items = contentFeed.filter((c) => c.hubId === hubId);
    if (typeFilter) {
        items = items.filter((c) => c.type === typeFilter);
    }
    // Sort newest first
    items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return {
        hubId,
        count: items.length,
        items,
    };
}

/**
 * Publish a new content item to a hub.
 * @param {string} hubId
 * @param {{ type, title, summary, author?, language?, duration? }} item
 */
export function publishToHub(hubId, item) {
    const hub = hubs.find((h) => h.id === hubId);
    if (!hub) return { success: false, error: `Hub not found: ${hubId}` };

    const newItem = {
        id: `content-${v4Stub()}`,
        hubId,
        type: item.type || CONTENT_TYPES.NEWS,
        title: item.title,
        summary: item.summary || "",
        author: item.author || hub.name,
        publishedAt: new Date().toISOString(),
        language: item.language || hub.languages[0],
        thumbnailUrl: null,
        duration: item.duration || "0:00",
        isLive: item.isLive || false,
    };

    contentFeed.push(newItem);
    return { success: true, item: newItem };
}

export { HUB_CAPABILITIES, CONTENT_TYPES };
