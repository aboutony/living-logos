/**
 * THE LIVING LOGOS — VOD Content Library
 * Atomic Command 16: Library Expansion
 *
 * Three categories: Sermons, Documentaries, Movies
 * All entries point to valid YouTube URLs for yt-dlp audio extraction.
 */

export const CATEGORIES = {
    SERMONS: "sermons",
    DOCUMENTARIES: "documentaries",
    MOVIES: "movies",
};

const CATEGORY_META = {
    [CATEGORIES.SERMONS]: {
        label: "Sermons",
        icon: "🎙️",
        description: "Recent homilies from the Holy Bishopric of Morphou",
    },
    [CATEGORIES.DOCUMENTARIES]: {
        label: "Documentaries",
        icon: "🎬",
        description: "Orthodox documentary films on saints and monasticism",
    },
    [CATEGORIES.MOVIES]: {
        label: "Movies",
        icon: "🎞️",
        description: "Biographical films on Orthodox saints",
    },
};

// ═══════════════════════════════════════════════════════
// VOD CATALOG — All entries verified with real YouTube IDs
// ═══════════════════════════════════════════════════════

const LIBRARY_ITEMS = [
    // ── SERMONS: 5 Most Recent Morphou Uploads ──
    {
        id: "vod-sermon-001",
        category: CATEGORIES.SERMONS,
        title: "Μόρφου Νεόφυτος: Τὰ γεγονότα ἦρθαν... Ὅλα αὐτὰ πρέπει νὰ συμβοῦν…",
        titleEn: "Metropolitan Neophytos: The events have come... All these must happen…",
        description: "Sermon by Metropolitan Neophytos of Morphou on current events and faith.",
        ytVideoId: "sAgVuOFLfzA",
        ytUrl: "https://www.youtube.com/watch?v=sAgVuOFLfzA",
        language: "el",
        date: "2026-03-20",
        authority: "Metropolitan Neophytos of Morphou",
        location: "Morphou, Cyprus",
        thumbnail: "https://img.youtube.com/vi/sAgVuOFLfzA/hqdefault.jpg",
    },
    {
        id: "vod-sermon-002",
        category: CATEGORIES.SERMONS,
        title: "Μέγα Ἀπόδειπνον μὲ Θεοτοκάριον ἦχος βαρὺς",
        titleEn: "Great Compline with Theotokion in Grave Mode",
        description: "Liturgical service: Great Compline with Theotokion hymns in the grave mode.",
        ytVideoId: "23G9d5Rxj0k",
        ytUrl: "https://www.youtube.com/watch?v=23G9d5Rxj0k",
        language: "el",
        date: "2026-03-17",
        authority: "Holy Bishopric of Morphou",
        location: "Morphou, Cyprus",
        thumbnail: "https://img.youtube.com/vi/23G9d5Rxj0k/hqdefault.jpg",
    },
    {
        id: "vod-sermon-003",
        category: CATEGORIES.SERMONS,
        title: "Μόρφου Νεόφυτος: Κίνδυνοι καὶ προστασία σὲ καιροὺς πολέμου",
        titleEn: "Metropolitan Neophytos: Dangers and Protection in Times of War",
        description: "Sermon from the Holy Monastery of Panagia tou Araka, near Lagoudera.",
        ytVideoId: "eLkLjnPE1-o",
        ytUrl: "https://www.youtube.com/watch?v=eLkLjnPE1-o",
        language: "el",
        date: "2026-03-13",
        authority: "Metropolitan Neophytos of Morphou",
        location: "Lagoudera, Cyprus",
        thumbnail: "https://img.youtube.com/vi/eLkLjnPE1-o/hqdefault.jpg",
    },
    {
        id: "vod-sermon-004",
        category: CATEGORIES.SERMONS,
        title: "Μέγα Ἀπόδειπνον μὲ Θεοτοκάριον ἦχος πλ. β΄",
        titleEn: "Great Compline with Theotokion in Plagal Second Mode",
        description: "Liturgical service: Great Compline with Theotokion hymns in plagal second mode.",
        ytVideoId: "mrxyEP8a2tU",
        ytUrl: "https://www.youtube.com/watch?v=mrxyEP8a2tU",
        language: "el",
        date: "2026-03-10",
        authority: "Holy Bishopric of Morphou",
        location: "Morphou, Cyprus",
        thumbnail: "https://img.youtube.com/vi/mrxyEP8a2tU/hqdefault.jpg",
    },
    {
        id: "vod-sermon-005",
        category: CATEGORIES.SERMONS,
        title: "The Holy Angels — 43rd Spiritual Dialogue Synaxis",
        titleEn: "The Holy Angels — 43rd Spiritual Dialogue Synaxis",
        description: "Metropolitan Neophytos speaks on the Holy Angels in the 43rd spiritual dialogue.",
        ytVideoId: "IVvFmaQuRNk",
        ytUrl: "https://www.youtube.com/watch?v=IVvFmaQuRNk",
        language: "el",
        date: "2025-03-26",
        authority: "Metropolitan Neophytos of Morphou",
        location: "Morphou, Cyprus",
        thumbnail: "https://img.youtube.com/vi/IVvFmaQuRNk/hqdefault.jpg",
    },

    // ── DOCUMENTARIES: Orthodox Saint Films ──
    {
        id: "vod-doc-001",
        category: CATEGORIES.DOCUMENTARIES,
        title: "Vessel of Grace: The Life of St. Paisios the Athonite",
        titleEn: "Vessel of Grace: The Life of St. Paisios the Athonite",
        description: "Trisagion Films documentary on Saint Paisios — his asceticism on Mount Athos, miracles, and legacy as a modern-day saint. Subtitles in multiple languages.",
        ytVideoId: "uDfwUfJdTQ0",
        ytUrl: "https://www.youtube.com/watch?v=uDfwUfJdTQ0",
        language: "el",
        date: "2020-01-01",
        authority: "Trisagion Films",
        location: "Mount Athos, Greece",
        thumbnail: "https://img.youtube.com/vi/uDfwUfJdTQ0/hqdefault.jpg",
    },
    {
        id: "vod-doc-002",
        category: CATEGORIES.DOCUMENTARIES,
        title: "Saint Paisios at St. Catherine's Monastery, Sinai",
        titleEn: "Saint Paisios at St. Catherine's Monastery, Sinai",
        description: "Documentary with English subtitles on Saint Paisios as a young monk at St. Catherine's Monastery in Sinai (1962-1964). Based on Hieromonk Isaac's biography.",
        ytVideoId: "0x9AgYOmKXg",
        ytUrl: "https://www.youtube.com/watch?v=0x9AgYOmKXg",
        language: "el",
        date: "2019-01-01",
        authority: "Orthodox Documentary Films",
        location: "Mount Sinai, Egypt",
        thumbnail: "https://img.youtube.com/vi/0x9AgYOmKXg/hqdefault.jpg",
    },

    // ── MOVIES: Biographical Orthodox Films ──
    {
        id: "vod-movie-001",
        category: CATEGORIES.MOVIES,
        title: "Saint Paisios: From Farasa to Heaven",
        titleEn: "Saint Paisios: From Farasa to Heaven",
        description: "Historical-biographical series (2022) chronicling St. Paisios from birth in Farasa, Cappadocia through his decision to become a monk. Filmed in Corfu, Konitsa, and Mount Athos.",
        ytVideoId: "BhY-aWNyUMY",
        ytUrl: "https://www.youtube.com/watch?v=BhY-aWNyUMY",
        language: "el",
        date: "2022-01-01",
        authority: "Orthodox Cinema",
        location: "Mount Athos, Greece",
        thumbnail: "https://img.youtube.com/vi/BhY-aWNyUMY/hqdefault.jpg",
    },
];

// ═══════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════

/**
 * Get all library items, optionally filtered by category.
 * @param {string|null} category - Category filter (sermons, documentaries, movies)
 * @returns {Array} Filtered library items
 */
export function getLibraryItems(category = null) {
    if (category && CATEGORIES[category.toUpperCase()]) {
        return LIBRARY_ITEMS.filter(
            (item) => item.category === CATEGORIES[category.toUpperCase()]
        );
    }
    if (category) {
        return LIBRARY_ITEMS.filter((item) => item.category === category);
    }
    return [...LIBRARY_ITEMS];
}

/**
 * Get a single library item by ID.
 * @param {string} id - Item ID (e.g., "vod-sermon-001")
 * @returns {Object|null}
 */
export function getLibraryItemById(id) {
    return LIBRARY_ITEMS.find((item) => item.id === id) || null;
}

/**
 * Get category metadata.
 * @returns {Object}
 */
export function getCategoryMeta() {
    return { ...CATEGORY_META };
}

/**
 * Convert a library item to a stream-compatible object
 * for use in the watch page.
 * @param {Object} item - Library item
 * @returns {Object} Stream-compatible object
 */
export function libraryItemToStream(item) {
    if (!item) return null;
    return {
        id: item.id,
        name: item.titleEn || item.title,
        location: item.location || "Cyprus",
        lat: 35.0417,
        lng: 32.9015,
        language: item.language || "el",
        rite: "Sermon",
        authority: {
            level: 2,
            label: item.authority || "Holy Bishopric of Morphou",
            color: "silver",
        },
        isLive: false,
        isVOD: true,
        isHQ: false,
        digitalSeal: true,
        viewerCount: 0,
        pinned: false,
        youtubeChannel: null,
        ytUrl: item.ytUrl,
        ytVideoId: item.ytVideoId,
        thumbnail: item.thumbnail,
        category: item.category,
        date: item.date,
        description: item.description,
    };
}
