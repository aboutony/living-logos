/**
 * THE LIVING LOGOS — Stream Data Store
 * In-memory stream registry for Phase One.
 * Seeds 12 sample parishes across 6 continents.
 */

const LITURGICAL_RITES = {
    CHRYSOSTOM: "Divine Liturgy of St. John Chrysostom",
    BASIL: "Divine Liturgy of St. Basil the Great",
    PRESANCTIFIED: "Liturgy of the Presanctified Gifts",
    VESPERS: "Great Vespers",
    ORTHROS: "Orthros (Matins)",
    PARAKLESIS: "Paraklesis",
};

const AUTHORITY_TIERS = {
    TIER_1: { level: 1, label: "Ecumenical / Patriarchal", color: "gold" },
    TIER_2: { level: 2, label: "Archdiocesan / Metropolitan", color: "silver" },
    TIER_3: { level: 3, label: "Parish / Monastic", color: "bronze" },
};

// ── Seed Data: Global Parish Streams ──
const seedStreams = [
    {
        id: "stream-phanar-001",
        name: "Ecumenical Patriarchate — The Phanar",
        location: "Constantinople (Istanbul), Turkey",
        lat: 41.0283,
        lng: 28.9514,
        language: "Greek",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_1,
        isLive: true,
        digitalSeal: true,
        viewerCount: 12480,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/phanar",
        relayTargets: ["youtube", "facebook"],
        timezone: "Europe/Istanbul",
        walletAddress: "wallet:parish:phanar-001",
    },
    {
        id: "stream-athos-001",
        name: "Great Lavra Monastery — Mount Athos",
        location: "Mount Athos, Greece",
        lat: 40.1564,
        lng: 24.3264,
        language: "Greek",
        rite: LITURGICAL_RITES.ORTHROS,
        authority: AUTHORITY_TIERS.TIER_1,
        isLive: true,
        digitalSeal: true,
        viewerCount: 8920,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/athos-lavra",
        relayTargets: ["youtube"],
        timezone: "Europe/Athens",
        walletAddress: "wallet:parish:athos-001",
    },
    {
        id: "stream-cathedral-nyc",
        name: "Holy Trinity Cathedral",
        location: "New York City, USA",
        lat: 40.7694,
        lng: -73.9634,
        language: "English",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_2,
        isLive: true,
        digitalSeal: true,
        viewerCount: 3420,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/nyc-cathedral",
        relayTargets: ["youtube", "facebook"],
        timezone: "America/New_York",
        walletAddress: "wallet:parish:nyc-cathedral",
    },
    {
        id: "stream-london-001",
        name: "Cathedral of the Dormition",
        location: "London, United Kingdom",
        lat: 51.5074,
        lng: -0.1278,
        language: "English",
        rite: LITURGICAL_RITES.VESPERS,
        authority: AUTHORITY_TIERS.TIER_2,
        isLive: false,
        digitalSeal: true,
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/london-cathedral",
        relayTargets: ["youtube"],
        timezone: "Europe/London",
        walletAddress: "wallet:parish:london-001",
    },
    {
        id: "stream-melbourne-001",
        name: "Greek Orthodox Archdiocese of Australia",
        location: "Melbourne, Australia",
        lat: -37.8136,
        lng: 144.9631,
        language: "Greek",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_2,
        isLive: true,
        digitalSeal: true,
        viewerCount: 2150,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/melbourne",
        relayTargets: ["youtube", "facebook"],
        timezone: "Australia/Melbourne",
        walletAddress: "wallet:parish:melbourne-001",
    },
    {
        id: "stream-nairobi-001",
        name: "Holy Church of the Archangels",
        location: "Nairobi, Kenya",
        lat: -1.2921,
        lng: 36.8219,
        language: "Swahili",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_3,
        isLive: false,
        digitalSeal: false,
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/nairobi",
        relayTargets: ["facebook"],
        timezone: "Africa/Nairobi",
        walletAddress: "wallet:parish:nairobi-001",
    },
    {
        id: "stream-athens-001",
        name: "Metropolitan Cathedral of Athens",
        location: "Athens, Greece",
        lat: 37.9749,
        lng: 23.7340,
        language: "Greek",
        rite: LITURGICAL_RITES.BASIL,
        authority: AUTHORITY_TIERS.TIER_2,
        isLive: true,
        digitalSeal: true,
        viewerCount: 5670,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/athens-metro",
        relayTargets: ["youtube", "facebook"],
        timezone: "Europe/Athens",
        walletAddress: "wallet:parish:athens-001",
    },
    {
        id: "stream-crete-001",
        name: "Holy Monastery of Preveli",
        location: "Rethymno, Crete, Greece",
        lat: 35.2240,
        lng: 24.4700,
        language: "Greek",
        rite: LITURGICAL_RITES.PARAKLESIS,
        authority: AUTHORITY_TIERS.TIER_3,
        isLive: false,
        digitalSeal: true,
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/crete-preveli",
        relayTargets: ["youtube"],
        timezone: "Europe/Athens",
        walletAddress: "wallet:parish:crete-001",
    },
    {
        id: "stream-dubai-001",
        name: "St. Paul's Orthodox Church",
        location: "Dubai, UAE",
        lat: 25.2048,
        lng: 55.2708,
        language: "Arabic",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_3,
        isLive: true,
        digitalSeal: true,
        viewerCount: 1890,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/dubai",
        relayTargets: ["youtube"],
        timezone: "Asia/Dubai",
        walletAddress: "wallet:parish:dubai-001",
    },
    {
        id: "stream-saopaulo-001",
        name: "Greek Orthodox Church of the Annunciation",
        location: "São Paulo, Brazil",
        lat: -23.5505,
        lng: -46.6333,
        language: "Portuguese",
        rite: LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS.TIER_3,
        isLive: false,
        digitalSeal: false,
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/saopaulo",
        relayTargets: ["facebook"],
        timezone: "America/Sao_Paulo",
        walletAddress: "wallet:parish:saopaulo-001",
    },
    {
        id: "stream-stanthony-az",
        name: "St. Anthony's Greek Orthodox Monastery",
        location: "Florence, Arizona, USA",
        lat: 33.0314,
        lng: -111.3837,
        language: "English",
        rite: LITURGICAL_RITES.PRESANCTIFIED,
        authority: AUTHORITY_TIERS.TIER_3,
        isLive: true,
        digitalSeal: true,
        viewerCount: 4230,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/st-anthony-az",
        relayTargets: ["youtube"],
        timezone: "America/Phoenix",
        walletAddress: "wallet:parish:stanthony-az",
    },
    {
        id: "stream-sinai-001",
        name: "Saint Catherine's Monastery",
        location: "Mount Sinai, Egypt",
        lat: 28.5561,
        lng: 33.9759,
        language: "Greek",
        rite: LITURGICAL_RITES.ORTHROS,
        authority: AUTHORITY_TIERS.TIER_1,
        isLive: false,
        digitalSeal: true,
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: "rtmp://ingest.livinglogos.net/sinai",
        relayTargets: ["youtube"],
        timezone: "Africa/Cairo",
        walletAddress: "wallet:parish:sinai-001",
    },
];

// ── In-Memory Store ──
let streams = [...seedStreams];
let streamIdCounter = streams.length;

/**
 * Get all streams (optionally filter by live status)
 */
export function getActiveStreams(filters = {}) {
    let result = [...streams];
    if (filters.liveOnly) result = result.filter((s) => s.isLive);
    if (filters.language)
        result = result.filter((s) => s.language === filters.language);
    if (filters.rite) result = result.filter((s) => s.rite === filters.rite);
    if (filters.tier)
        result = result.filter((s) => s.authority.level === filters.tier);
    if (filters.sealedOnly) result = result.filter((s) => s.digitalSeal);
    return result;
}

/**
 * Get a single stream by ID
 */
export function getStreamById(id) {
    return streams.find((s) => s.id === id) || null;
}

/**
 * Register a new stream (from a parish encoder)
 */
export function registerStream(data) {
    streamIdCounter++;
    const newStream = {
        id: `stream-custom-${streamIdCounter}`,
        name: data.name,
        location: data.location || "Unknown",
        lat: data.lat || 0,
        lng: data.lng || 0,
        language: data.language || "Greek",
        rite: data.rite || LITURGICAL_RITES.CHRYSOSTOM,
        authority: AUTHORITY_TIERS[`TIER_${data.authorityTier || 3}`],
        isLive: false,
        digitalSeal: false, // must be verified separately
        viewerCount: 0,
        thumbnailUrl: null,
        rtmpEndpoint: data.rtmpEndpoint || null,
        relayTargets: data.relayTargets || [],
        timezone: data.timezone || "UTC",
    };
    streams.push(newStream);
    return newStream;
}

/**
 * Update stream live status
 */
export function setStreamLive(id, isLive) {
    const stream = streams.find((s) => s.id === id);
    if (stream) stream.isLive = isLive;
    return stream;
}

/**
 * Apply Digital Seal to a stream
 */
export function sealStream(id) {
    const stream = streams.find((s) => s.id === id);
    if (stream) stream.digitalSeal = true;
    return stream;
}

export { LITURGICAL_RITES, AUTHORITY_TIERS };
