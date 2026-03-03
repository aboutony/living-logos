/**
 * THE LIVING LOGOS — Patristic AI Translation Engine
 * Phase Three: Production & AI Sovereignty
 *
 * Sacred Glossary:   Immutable theological term dictionary across 8 languages.
 * Translation Stub:  Simulates real-time AI translation with glossary enforcement.
 * Dogma-Vetting:     Tier 1 Editorial Board review queue for theological accuracy.
 * Subtitle Pipeline: Time-coded subtitle generation linked to live streams.
 *
 * NON-NEGOTIABLE: Sacred terms are LOCKED and never altered by AI inference.
 */

import { v4Stub } from "./utils.js";

// ── Directive 010: Glossary Lockdown ──
const GLOSSARY_LOCKED = true; // Final lockdown — no modifications permitted
const VETTING_KEY_HOLDER = Object.freeze({
    authority: "Tier 1 Editorial Board",
    key: "vk-tier1-patriarchal-2026",
    issuedAt: "2026-03-03T23:00:00Z",
    permissions: ["approve", "reject", "escalate"],
    note: "Exclusive vetting key. Only Tier 1 hierarchs may approve theological translations.",
});

// ── Supported Languages ──
export const SUPPORTED_LANGUAGES = [
    { code: "el", name: "Greek", nativeName: "Ελληνικά", flag: "🇬🇷" },
    { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
    { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇱🇧" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
    { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
];

// ══════════════════════════════════════════════════════════
//   SACRED GLOSSARY — Immutable Theological Terms
//   These terms are LOCKED across all AI operations.
//   The Tier 1 Editorial Board alone may modify entries.
// ══════════════════════════════════════════════════════════

const SACRED_GLOSSARY = Object.freeze([
    {
        id: "term-theotokos",
        canonical: "Θεοτόκος",
        category: "Christological",
        locked: true,
        translations: Object.freeze({
            el: "Θεοτόκος",
            en: "Theotokos (Mother of God)",
            ar: "والدة الإله",
            sw: "Mzazi wa Mungu",
            pt: "Theotokos (Mãe de Deus)",
            ru: "Богородица",
            ro: "Născătoare de Dumnezeu",
            fr: "Théotokos (Mère de Dieu)",
        }),
        note: "NEVER translate as merely 'Mother of Jesus'. The Christological title must be preserved.",
    },
    {
        id: "term-eucharist",
        canonical: "Εὐχαριστία",
        category: "Sacramental",
        locked: true,
        translations: Object.freeze({
            el: "Θεία Ευχαριστία",
            en: "Holy Eucharist",
            ar: "القربان المقدس",
            sw: "Ekaristi Takatifu",
            pt: "Sagrada Eucaristia",
            ru: "Святая Евхаристия",
            ro: "Sfânta Euharistie",
            fr: "Sainte Eucharistie",
        }),
        note: "Must always carry the 'Holy' / 'Sacred' prefix. Never reduce to 'communion' alone.",
    },
    {
        id: "term-chrismation",
        canonical: "Χρίσμα",
        category: "Sacramental",
        locked: true,
        translations: Object.freeze({
            el: "Χρίσμα",
            en: "Chrismation",
            ar: "الميرون",
            sw: "Upako wa Krismasi",
            pt: "Crismação",
            ru: "Миропомазание",
            ro: "Mirungere",
            fr: "Chrismation",
        }),
        note: "Distinct from Western 'Confirmation'. Use the Orthodox term exclusively.",
    },
    {
        id: "term-homoousios",
        canonical: "ὁμοούσιος",
        category: "Trinitarian",
        locked: true,
        translations: Object.freeze({
            el: "ὁμοούσιος",
            en: "Consubstantial (of one essence)",
            ar: "مساوٍ في الجوهر",
            sw: "Mwenye asili moja",
            pt: "Consubstancial",
            ru: "Единосущный",
            ro: "Deoființă",
            fr: "Consubstantiel",
        }),
        note: "Nicene Creed foundation. NEVER translate as 'similar in essence' (homoiousios heresy).",
    },
    {
        id: "term-theosis",
        canonical: "Θέωσις",
        category: "Soteriological",
        locked: true,
        translations: Object.freeze({
            el: "Θέωσις",
            en: "Theosis (Deification)",
            ar: "التأله",
            sw: "Uungu (Theosis)",
            pt: "Theosis (Deificação)",
            ru: "Обожение",
            ro: "Îndumnezeire",
            fr: "Théosis (Déification)",
        }),
        note: "Central Orthodox soteriology. Never reduce to 'salvation' or 'sanctification' alone.",
    },
    {
        id: "term-hesychasm",
        canonical: "Ἡσυχασμός",
        category: "Mystical",
        locked: true,
        translations: Object.freeze({
            el: "Ἡσυχασμός",
            en: "Hesychasm",
            ar: "الهدوئية",
            sw: "Hesykasmu",
            pt: "Hesicasmo",
            ru: "Исихазм",
            ro: "Isihasm",
            fr: "Hésychasme",
        }),
        note: "The prayer practice of inner stillness. Preserve the technical term.",
    },
    {
        id: "term-pascha",
        canonical: "Πάσχα",
        category: "Liturgical",
        locked: true,
        translations: Object.freeze({
            el: "Πάσχα",
            en: "Pascha (Easter)",
            ar: "الفصح",
            sw: "Pasaka",
            pt: "Páscoa",
            ru: "Пасха",
            ro: "Paștele",
            fr: "Pâques",
        }),
        note: "Always 'Pascha', never merely 'Easter'. The Resurrection feast.",
    },
    {
        id: "term-liturgy",
        canonical: "Λειτουργία",
        category: "Liturgical",
        locked: true,
        translations: Object.freeze({
            el: "Θεία Λειτουργία",
            en: "Divine Liturgy",
            ar: "القداس الإلهي",
            sw: "Liturujia Takatifu",
            pt: "Divina Liturgia",
            ru: "Божественная Литургия",
            ro: "Sfânta Liturghie",
            fr: "Divine Liturgie",
        }),
        note: "Always prefixed with 'Divine' / 'Holy'. Never just 'service' or 'mass'.",
    },
    {
        id: "term-iconostasis",
        canonical: "Εἰκονοστάσιον",
        category: "Architectural",
        locked: true,
        translations: Object.freeze({
            el: "Εἰκονοστάσιον",
            en: "Iconostasis",
            ar: "الأيقونسطاس",
            sw: "Ikonostasi",
            pt: "Iconostase",
            ru: "Иконостас",
            ro: "Iconostas",
            fr: "Iconostase",
        }),
        note: "The sacred screen. Never 'altar screen' or 'partition'.",
    },
    {
        id: "term-metropolitan",
        canonical: "Μητροπολίτης",
        category: "Hierarchical",
        locked: true,
        translations: Object.freeze({
            el: "Μητροπολίτης",
            en: "Metropolitan",
            ar: "المطران",
            sw: "Metropolitani",
            pt: "Metropolita",
            ru: "Митрополит",
            ro: "Mitropolit",
            fr: "Métropolite",
        }),
        note: "Ecclesiastical rank. Always capitalized as a title.",
    },
    {
        id: "term-troparion",
        canonical: "Τροπάριον",
        category: "Hymnographic",
        locked: true,
        translations: Object.freeze({
            el: "Τροπάριον",
            en: "Troparion",
            ar: "الطروباريّة",
            sw: "Troparioni",
            pt: "Tropário",
            ru: "Тропарь",
            ro: "Tropar",
            fr: "Tropaire",
        }),
        note: "A short hymn. Preserve the liturgical music term.",
    },
    {
        id: "term-kontakion",
        canonical: "Κοντάκιον",
        category: "Hymnographic",
        locked: true,
        translations: Object.freeze({
            el: "Κοντάκιον",
            en: "Kontakion",
            ar: "القنداق",
            sw: "Kontakioni",
            pt: "Kontákion",
            ru: "Кондак",
            ro: "Condac",
            fr: "Kondakion",
        }),
        note: "A poetic sermon-hymn. Preserve the liturgical music term.",
    },
]);

// ══════════════════════════════════════════════════════════
//   DOGMA-VETTING QUEUE — Tier 1 Editorial Review
// ══════════════════════════════════════════════════════════

let vettingQueue = [];

const VETTING_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
};

/**
 * Submit a translation for Tier 1 Editorial Board review.
 * @param {{ sourceText, sourceLang, targetLang, translatedText, sacredTermsDetected, streamId? }} translation
 */
export function submitForVetting(translation) {
    const entry = {
        id: `vet-${v4Stub()}`,
        status: VETTING_STATUS.PENDING,
        submittedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        sourceText: translation.sourceText,
        sourceLang: translation.sourceLang,
        targetLang: translation.targetLang,
        translatedText: translation.translatedText,
        sacredTermsDetected: translation.sacredTermsDetected || [],
        streamId: translation.streamId || null,
        confidence: translation.confidence || 0,
    };
    vettingQueue.push(entry);
    return entry;
}

/**
 * Get the vetting queue, optionally filtered by status.
 * @param {string} [statusFilter] - "pending" | "approved" | "rejected"
 */
export function getVettingQueue(statusFilter) {
    let results = [...vettingQueue];
    if (statusFilter && VETTING_STATUS[statusFilter.toUpperCase()]) {
        results = results.filter((e) => e.status === statusFilter);
    }
    return {
        count: results.length,
        entries: results.reverse(),
        statuses: { ...VETTING_STATUS },
    };
}

/**
 * Approve a translation — Tier 1 Editorial Board action.
 * @param {string} id - Vetting entry ID
 * @param {string} [reviewerName] - Name of the reviewing hierarch
 */
/**
 * Approve a translation — Tier 1 Editorial Board action.
 * Directive 010: Requires valid vetting key.
 * @param {string} id - Vetting entry ID
 * @param {string} [reviewerName] - Name of the reviewing hierarch
 * @param {string} [vettingKey] - Tier 1 vetting key
 */
export function approveTranslation(id, reviewerName, vettingKey) {
    // Directive 010: Vetting key enforcement
    if (vettingKey !== VETTING_KEY_HOLDER.key) {
        return { success: false, error: "Invalid vetting key. Only Tier 1 Editorial Board may approve." };
    }
    const entry = vettingQueue.find((e) => e.id === id);
    if (!entry) return { success: false, error: "Entry not found" };
    if (entry.status !== VETTING_STATUS.PENDING) {
        return { success: false, error: `Already ${entry.status}` };
    }
    entry.status = VETTING_STATUS.APPROVED;
    entry.reviewedAt = new Date().toISOString();
    entry.reviewedBy = reviewerName || "Tier 1 Editorial Board";
    return { success: true, entry };
}

/**
 * Reject a translation — Tier 1 Editorial Board action.
 * @param {string} id - Vetting entry ID
 * @param {string} reason - Doctrinal correction note
 * @param {string} [reviewerName]
 */
export function rejectTranslation(id, reason, reviewerName) {
    const entry = vettingQueue.find((e) => e.id === id);
    if (!entry) return { success: false, error: "Entry not found" };
    if (entry.status !== VETTING_STATUS.PENDING) {
        return { success: false, error: `Already ${entry.status}` };
    }
    entry.status = VETTING_STATUS.REJECTED;
    entry.reviewedAt = new Date().toISOString();
    entry.reviewedBy = reviewerName || "Tier 1 Editorial Board";
    entry.rejectionReason = reason || "Doctrinal inaccuracy";
    return { success: true, entry };
}

// ══════════════════════════════════════════════════════════
//   TRANSLATION ENGINE — Glossary-Enforced AI Stub
// ══════════════════════════════════════════════════════════

/**
 * Detect sacred terms in source text.
 * Scans for matches against all glossary canonical forms and translations.
 */
export function detectSacredTerms(text) {
    const detected = [];
    const lowerText = text.toLowerCase();

    for (const term of SACRED_GLOSSARY) {
        // Check canonical form
        if (text.includes(term.canonical)) {
            detected.push(term);
            continue;
        }
        // Check all language translations
        for (const [, translation] of Object.entries(term.translations)) {
            if (lowerText.includes(translation.toLowerCase())) {
                detected.push(term);
                break;
            }
        }
    }
    return detected;
}

/**
 * Translate text using the Patristic AI engine.
 * Sacred terms are locked to glossary translations — never altered by AI.
 *
 * @param {string} text - Source text
 * @param {string} sourceLang - ISO code (e.g., "el")
 * @param {string} targetLang - ISO code (e.g., "en")
 * @returns {{ translatedText, sacredTerms, vettingRequired, confidence, glossaryApplied }}
 */
export function translateText(text, sourceLang, targetLang) {
    if (!text || !sourceLang || !targetLang) {
        return { error: "Missing required parameters: text, sourceLang, targetLang" };
    }

    const srcLang = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang);
    const tgtLang = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang);
    if (!srcLang || !tgtLang) {
        return { error: `Unsupported language. Supported: ${SUPPORTED_LANGUAGES.map((l) => l.code).join(", ")}` };
    }

    // 1. Detect sacred terms
    const sacredTerms = detectSacredTerms(text);

    // 2. Build glossary-applied output
    let translatedText = text;
    const glossaryApplied = [];

    for (const term of sacredTerms) {
        const sourceForm = term.translations[sourceLang] || term.canonical;
        const targetForm = term.translations[targetLang] || term.canonical;

        if (translatedText.includes(sourceForm)) {
            translatedText = translatedText.replace(
                new RegExp(escapeRegex(sourceForm), "g"),
                `⸬${targetForm}⸬` // Sacred term markers
            );
            glossaryApplied.push({
                termId: term.id,
                from: sourceForm,
                to: targetForm,
                category: term.category,
            });
        }
    }

    // 3. Simulate AI translation for non-sacred segments
    //    (In production, this calls the actual LLM inference endpoint)
    if (sourceLang !== targetLang && glossaryApplied.length === 0) {
        translatedText = `[AI:${tgtLang.code}] ${text}`;
    }

    // 4. Determine vetting requirement
    const vettingRequired = sacredTerms.length > 0;
    const confidence = vettingRequired ? 0.85 : 0.95; // Sacred terms lower auto-confidence

    return {
        translatedText,
        sourceLang: srcLang,
        targetLang: tgtLang,
        sacredTerms: sacredTerms.map((t) => ({
            id: t.id,
            canonical: t.canonical,
            category: t.category,
            targetTranslation: t.translations[targetLang],
            note: t.note,
        })),
        glossaryApplied,
        vettingRequired,
        confidence,
    };
}

/**
 * Generate time-coded subtitles for a live stream.
 * Simulates real-time transcription + translation with sacred term enforcement.
 *
 * @param {string} streamId - Active stream ID
 * @param {string} targetLang - Target language code
 * @returns {Array<{ id, startTime, endTime, text, sacredTerms, vetted }>}
 */
export function generateSubtitles(streamId, targetLang = "en") {
    // Seed subtitle samples simulating a live liturgical broadcast
    const sampleCues = [
        { text: "Εὐλογημένη ἡ Βασιλεία τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος", offset: 0 },
        { text: "Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν — Κύριε ἐλέησον", offset: 8 },
        { text: "Ὑπὲρ τῆς ἄνωθεν εἰρήνης καὶ τῆς σωτηρίας τῶν ψυχῶν ἡμῶν", offset: 16 },
        { text: "Τὴν Θεοτόκον καὶ Μητέρα τοῦ Φωτὸς ἐν ὕμνοις τιμῶντες μεγαλύνωμεν", offset: 24 },
        { text: "Ὅσοι πιστοί, τὴν Θείαν Λειτουργίαν ἐν εἰρήνῃ προσέλθωμεν", offset: 32 },
    ];

    const now = Date.now();
    return sampleCues.map((cue, idx) => {
        const result = translateText(cue.text, "el", targetLang);
        return {
            id: `sub-${streamId}-${idx}`,
            startTime: (now / 1000 + cue.offset).toFixed(3),
            endTime: (now / 1000 + cue.offset + 7).toFixed(3),
            originalText: cue.text,
            text: result.translatedText || cue.text,
            sacredTerms: result.sacredTerms || [],
            vettingRequired: result.vettingRequired || false,
            vetted: false, // Requires Tier 1 approval
            streamId,
            targetLang,
        };
    });
}

// ── Glossary Access ──

/**
 * Get the full Sacred Glossary, optionally filtered by language.
 * @param {string} [langFilter] - Target language code to include only that translation
 */
export function getGlossary(langFilter) {
    return SACRED_GLOSSARY.map((term) => {
        const entry = {
            id: term.id,
            canonical: term.canonical,
            category: term.category,
            locked: term.locked,
            note: term.note,
        };
        if (langFilter && term.translations[langFilter]) {
            entry.translation = term.translations[langFilter];
            entry.language = langFilter;
        } else {
            entry.translations = { ...term.translations };
        }
        return entry;
    });
}

/**
 * Look up a single sacred term by ID or canonical form.
 */
export function lookupTerm(query) {
    return SACRED_GLOSSARY.find(
        (t) => t.id === query || t.canonical === query
    ) || null;
}

// ── Helper ──

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export { SACRED_GLOSSARY, VETTING_STATUS, GLOSSARY_LOCKED, VETTING_KEY_HOLDER };

/**
 * Directive 010: Engine deployment status.
 */
export function getEngineStatus() {
    return {
        engine: "Patristic AI Translation Engine",
        version: "1.0.0",
        glossaryLocked: GLOSSARY_LOCKED,
        glossaryTerms: SACRED_GLOSSARY.length,
        supportedLanguages: SUPPORTED_LANGUAGES.length,
        vettingKeyHolder: VETTING_KEY_HOLDER.authority,
        vettingQueueSize: vettingQueue.length,
        status: "deployed",
        mode: "production",
    };
}
