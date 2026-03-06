/**
 * THE LIVING LOGOS — Patristic AI Translation Engine
 * Phase Three: Production & AI Sovereignty
 *
 * Sacred Glossary:   Immutable theological term dictionary across 26 languages.
 * Translation:       MyMemory API (server-side) with Sacred Glossary enforcement.
 * Dogma-Vetting:     Tier 1 Editorial Board review queue for theological accuracy.
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
    { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
    { code: "ro", name: "Romanian", nativeName: "Română", flag: "🇷🇴" },
    { code: "sr", name: "Serbian", nativeName: "Српски", flag: "🇷🇸" },
    { code: "bg", name: "Bulgarian", nativeName: "Български", flag: "🇧🇬" },
    { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
    { code: "ka", name: "Georgian", nativeName: "ქართული", flag: "🇬🇪" },
    { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
    { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
    { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
    { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
    { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
    { code: "no", name: "Norwegian", nativeName: "Norsk", flag: "🇳🇴" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili", flag: "🇰🇪" },
    { code: "am", name: "Amharic", nativeName: "አማርኛ", flag: "🇪🇹" },
    { code: "zh", name: "Mandarin", nativeName: "中文", flag: "🇨🇳" },
    { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
    { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
    { code: "fa", name: "Persian", nativeName: "فارسی", flag: "🇮🇷" },
    { code: "he", name: "Hebrew", nativeName: "עברית", flag: "🇮🇱" },
    { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
    { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "tl", name: "Tagalog", nativeName: "Tagalog", flag: "🇵🇭" },
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
            el: "Θεοτόκος", en: "Theotokos (Mother of God)", ar: "والدة الإله",
            ru: "Богородица", ro: "Născătoare de Dumnezeu", sr: "Богородица",
            bg: "Богородица", tr: "Tanrıdoğuran", ka: "ღვთისმშობელი",
            fr: "Théotokos (Mère de Dieu)", de: "Gottesgebärerin", it: "Theotokos (Madre di Dio)",
            es: "Theotokos (Madre de Dios)", pt: "Theotokos (Mãe de Deus)", no: "Guds Moder",
            sw: "Mzazi wa Mungu", am: "እመ አምላክ", zh: "诞神女", hi: "ईश्वरजननी",
            ja: "テオトコス（神の母）", ko: "테오토코스 (하나님의 어머니)", fa: "مادر خدا",
            he: "אם האלוהים", ur: "والدۃ الٰہی", id: "Theotokos (Bunda Allah)", tl: "Theotokos (Ina ng Diyos)",
        }),
        note: "NEVER translate as merely 'Mother of Jesus'. The Christological title must be preserved.",
    },
    {
        id: "term-eucharist",
        canonical: "Εὐχαριστία",
        category: "Sacramental",
        locked: true,
        translations: Object.freeze({
            el: "Θεία Ευχαριστία", en: "Holy Eucharist", ar: "القربان المقدس",
            ru: "Святая Евхаристия", ro: "Sfânta Euharistie", sr: "Света Причест",
            bg: "Света Евхаристия", tr: "Kutsal Efkaristiya", ka: "ევქარისტია",
            fr: "Sainte Eucharistie", de: "Heilige Eucharistie", it: "Santa Eucaristia",
            es: "Santa Eucaristía", pt: "Sagrada Eucaristia", no: "Den Hellige Eukaristi",
            sw: "Ekaristi Takatifu", am: "ቅዱስ ቁርባን", zh: "圣餐仪式", hi: "पवित्र यूखरिस्ट",
            ja: "聖体礼儀", ko: "성체성사", fa: "عشای ربانی مقدس",
            he: "הקורבן הקדוש", ur: "مقدس قربان", id: "Ekaristi Suci", tl: "Banal na Eukaristiya",
        }),
        note: "Must always carry the 'Holy' / 'Sacred' prefix. Never reduce to 'communion' alone.",
    },
    {
        id: "term-chrismation",
        canonical: "Χρίσμα",
        category: "Sacramental",
        locked: true,
        translations: Object.freeze({
            el: "Χρίσμα", en: "Chrismation", ar: "الميرون",
            ru: "Миропомазание", ro: "Mirungere", sr: "Миропомазање",
            bg: "Миропомазание", tr: "Mür Sürme", ka: "მირონცხება",
            fr: "Chrismation", de: "Myronsalbung", it: "Crismazione",
            es: "Crismación", pt: "Crismação", no: "Krismering",
            sw: "Upako wa Krismasi", am: "ቅብዓት", zh: "傅膏礼", hi: "क्रिस्मेशन",
            ja: "塗油", ko: "도유성사", fa: "میرون",
            he: "משיחת שמן", ur: "تدہین", id: "Krismasi", tl: "Krismasyón",
        }),
        note: "Distinct from Western 'Confirmation'. Use the Orthodox term exclusively.",
    },
    {
        id: "term-homoousios",
        canonical: "ὁμοούσιος",
        category: "Trinitarian",
        locked: true,
        translations: Object.freeze({
            el: "ὁμοούσιος", en: "Consubstantial (of one essence)", ar: "مساوٍ في الجوهر",
            ru: "Единосущный", ro: "Deoființă", sr: "Једносушан",
            bg: "Единосъщен", tr: "Aynı Özden", ka: "ერთარსი",
            fr: "Consubstantiel", de: "Wesensgleich", it: "Consustanziale",
            es: "Consustancial", pt: "Consubstancial", no: "Vesenslik",
            sw: "Mwenye asili moja", am: "ሀገሩ ፡ ዘ ፡ ወልድ", zh: "同质", hi: "समसत्ता",
            ja: "同質", ko: "동일본질", fa: "هم‌ذات",
            he: "בן אותו עצם", ur: "ہم جوہر", id: "Sehakikat", tl: "Kasing-diwa",
        }),
        note: "Nicene Creed foundation. NEVER translate as 'similar in essence' (homoiousios heresy).",
    },
    {
        id: "term-theosis",
        canonical: "Θέωσις",
        category: "Soteriological",
        locked: true,
        translations: Object.freeze({
            el: "Θέωσις", en: "Theosis (Deification)", ar: "التأله",
            ru: "Обожение", ro: "Îndumnezeire", sr: "Обожење",
            bg: "Обожение", tr: "Tanrılaşma", ka: "განღმრთობა",
            fr: "Théosis (Déification)", de: "Theosis (Vergöttlichung)", it: "Theosis (Deificazione)",
            es: "Theosis (Deificación)", pt: "Theosis (Deificação)", no: "Guddommeliggjøring",
            sw: "Uungu (Theosis)", am: "መለኮታዊነት", zh: "成神", hi: "दैवीकरण",
            ja: "神化", ko: "신화 (테오시스)", fa: "تأله",
            he: "האלהה", ur: "تالہ", id: "Theosis (Pendewaan)", tl: "Theosis (Pagkadiyos)",
        }),
        note: "Central Orthodox soteriology. Never reduce to 'salvation' or 'sanctification' alone.",
    },
    {
        id: "term-hesychasm",
        canonical: "Ἡσυχασμός",
        category: "Mystical",
        locked: true,
        translations: Object.freeze({
            el: "Ἡσυχασμός", en: "Hesychasm", ar: "الهدوئية",
            ru: "Исихазм", ro: "Isihasm", sr: "Исихазам",
            bg: "Исихазъм", tr: "Hesikasm", ka: "ისიხაზმი",
            fr: "Hésychasme", de: "Hesychasmus", it: "Esicasmo",
            es: "Hesicasmo", pt: "Hesicasmo", no: "Hesykasme",
            sw: "Hesykasmu", am: "ሂሲካዝም", zh: "静修主义", hi: "हेसिकैज़म",
            ja: "ヘシカズム", ko: "헤시카즘", fa: "هسیکاسم",
            he: "הסיכאזם", ur: "ہیسی کازم", id: "Hesikasme", tl: "Hesikasmo",
        }),
        note: "The prayer practice of inner stillness. Preserve the technical term.",
    },
    {
        id: "term-pascha",
        canonical: "Πάσχα",
        category: "Liturgical",
        locked: true,
        translations: Object.freeze({
            el: "Πάσχα", en: "Pascha (Easter)", ar: "الفصح",
            ru: "Пасха", ro: "Paștele", sr: "Васкрс",
            bg: "Великден", tr: "Paskalya", ka: "აღდგომა",
            fr: "Pâques", de: "Pascha (Ostern)", it: "Pasqua",
            es: "Pascua", pt: "Páscoa", no: "Påske",
            sw: "Pasaka", am: "ፋሲካ", zh: "逾越节", hi: "पास्खा",
            ja: "パスハ（復活祭）", ko: "파스하 (부활절)", fa: "عید پاک",
            he: "פסחא", ur: "عید پاشکا", id: "Paskah", tl: "Paskuwa",
        }),
        note: "Always 'Pascha', never merely 'Easter'. The Resurrection feast.",
    },
    {
        id: "term-liturgy",
        canonical: "Λειτουργία",
        category: "Liturgical",
        locked: true,
        translations: Object.freeze({
            el: "Θεία Λειτουργία", en: "Divine Liturgy", ar: "القداس الإلهي",
            ru: "Божественная Литургия", ro: "Sfânta Liturghie", sr: "Света Литургија",
            bg: "Божествена Литургия", tr: "İlahi Liturji", ka: "საღვთო ლიტურგია",
            fr: "Divine Liturgie", de: "Göttliche Liturgie", it: "Divina Liturgia",
            es: "Divina Liturgia", pt: "Divina Liturgia", no: "Den Guddommelige Liturgi",
            sw: "Liturujia Takatifu", am: "ቅዱስ ቅዳሴ", zh: "圣礼仪", hi: "दिव्य पूजन विधि",
            ja: "聖体礼儀", ko: "성체 전례", fa: "مراسم عبادت الهی",
            he: "הליטורגיה האלוהית", ur: "الٰہی عبادت", id: "Liturgi Ilahi", tl: "Banal na Liturhiya",
        }),
        note: "Always prefixed with 'Divine' / 'Holy'. Never just 'service' or 'mass'.",
    },
    {
        id: "term-iconostasis",
        canonical: "Εἰκονοστάσιον",
        category: "Architectural",
        locked: true,
        translations: Object.freeze({
            el: "Εἰκονοστάσιον", en: "Iconostasis", ar: "الأيقونسطاس",
            ru: "Иконостас", ro: "Iconostas", sr: "Иконостас",
            bg: "Иконостас", tr: "Ikonostas", ka: "იკონოსტასი",
            fr: "Iconostase", de: "Ikonostase", it: "Iconostasi",
            es: "Iconostasio", pt: "Iconostase", no: "Ikonostas",
            sw: "Ikonostasi", am: "ኢኮኖስታስ", zh: "圣像屏", hi: "इकोनोस्टेसिस",
            ja: "イコノスタシス", ko: "이코노스타시스", fa: "ایکونوستاس",
            he: "איקונוסטאסיס", ur: "ایکونوسٹاسس", id: "Ikonostas", tl: "Ikonostasis",
        }),
        note: "The sacred screen. Never 'altar screen' or 'partition'.",
    },
    {
        id: "term-metropolitan",
        canonical: "Μητροπολίτης",
        category: "Hierarchical",
        locked: true,
        translations: Object.freeze({
            el: "Μητροπολίτης", en: "Metropolitan", ar: "المطران",
            ru: "Митрополит", ro: "Mitropolit", sr: "Митрополит",
            bg: "Митрополит", tr: "Metropolit", ka: "მიტროპოლიტი",
            fr: "Métropolite", de: "Metropolit", it: "Metropolita",
            es: "Metropolitano", pt: "Metropolita", no: "Metropolitt",
            sw: "Metropolitani", am: "ሜትሮፖሊታን", zh: "都主教", hi: "मेट्रोपॉलिटन",
            ja: "府主教", ko: "대주교", fa: "متروپولیت",
            he: "מטרופוליט", ur: "میٹروپولیٹن", id: "Metropolitan", tl: "Metropolitano",
        }),
        note: "Ecclesiastical rank. Always capitalized as a title.",
    },
    {
        id: "term-troparion",
        canonical: "Τροπάριον",
        category: "Hymnographic",
        locked: true,
        translations: Object.freeze({
            el: "Τροπάριον", en: "Troparion", ar: "الطروباريّة",
            ru: "Тропарь", ro: "Tropar", sr: "Тропар",
            bg: "Тропар", tr: "Troparion", ka: "ტროპარი",
            fr: "Tropaire", de: "Troparion", it: "Tropario",
            es: "Troparion", pt: "Tropário", no: "Troparion",
            sw: "Troparioni", am: "ትሮፓሪዮ", zh: "特罗帕里", hi: "ट्रोपैरियन",
            ja: "トロパリオン", ko: "트로파리온", fa: "تروپاریون",
            he: "טרופריון", ur: "تروپاریون", id: "Troparion", tl: "Troparion",
        }),
        note: "A short hymn. Preserve the liturgical music term.",
    },
    {
        id: "term-kontakion",
        canonical: "Κοντάκιον",
        category: "Hymnographic",
        locked: true,
        translations: Object.freeze({
            el: "Κοντάκιον", en: "Kontakion", ar: "القنداق",
            ru: "Кондак", ro: "Condac", sr: "Кондак",
            bg: "Кондак", tr: "Kontakion", ka: "კონტაკი",
            fr: "Kondakion", de: "Kontakion", it: "Contacio",
            es: "Kontakion", pt: "Kontákion", no: "Kontakion",
            sw: "Kontakioni", am: "ኮንታኪዮ", zh: "集祷颂", hi: "कोन्टैकियन",
            ja: "コンタキオン", ko: "콘타키온", fa: "کنتاکیون",
            he: "קונטקיון", ur: "کونتاکیون", id: "Kontakion", tl: "Kontakion",
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
//   DIRECTIVE 016: THEOLOGICAL SANITIZATION FILTER
//   Prevents non-Christian religious idioms from entering
//   the subtitle stream. Maps generic greetings to canonical
//   Christian forms.
// ══════════════════════════════════════════════════════════

const THEOLOGICAL_SANITIZATION_RULES = Object.freeze([
    // Islamic salutations → Christian canonical greetings
    { pattern: /\bpeace be upon (you|him|them)\b/gi, replacement: "Peace be with you all" },
    { pattern: /\bas-salamu alaykum\b/gi, replacement: "The peace of the Lord be with you" },
    { pattern: /\bsalaam alaikum\b/gi, replacement: "The peace of the Lord be with you" },
    { pattern: /\bالسلام عليكم\b/g, replacement: "السلام لجميعكم" }, // Arabic: canonical Christian peace
    { pattern: /\bعليه السلام\b/g, replacement: "" }, // Remove Islamic honorific
    { pattern: /\bصلى الله عليه وسلم\b/g, replacement: "" }, // Remove Islamic honorific
    { pattern: /\bsubhanallah\b/gi, replacement: "Glory to God" },
    { pattern: /\bمشاء الله\b/g, replacement: "المجد لله" },
    { pattern: /\bma sha allah\b/gi, replacement: "Glory to God" },
    { pattern: /\binshallah\b/gi, replacement: "God willing" },
    { pattern: /\bإن شاء الله\b/g, replacement: "بمشيئة الله" },
    { pattern: /\ballahu akbar\b/gi, replacement: "God is great" },
    { pattern: /\bالله أكبر\b/g, replacement: "الله عظيم" },
    // Buddhist/Hindu terms → neutral Christian equivalents
    { pattern: /\bnamaste\b/gi, replacement: "Peace be with you" },
    { pattern: /\bom\b/gi, replacement: "" }, // Remove mantra syllables
    { pattern: /\bkarma\b/gi, replacement: "divine providence" },
    // Generic "peace be upon you" (PBUH pattern) → Christian
    { pattern: /\(PBUH\)/gi, replacement: "" },
    { pattern: /\bpbuh\b/gi, replacement: "" },
]);

/**
 * Directive 016: Sanitize translation output to remove non-Christian
 * religious idioms and map generic greetings to canonical Christian forms.
 * @param {string} text - The translated text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeTheologicalOutput(text) {
    if (!text) return text;
    let sanitized = text;
    for (const rule of THEOLOGICAL_SANITIZATION_RULES) {
        sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }
    // Clean up double spaces from removals
    sanitized = sanitized.replace(/  +/g, " ").trim();
    return sanitized;
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
 * Directive 016: Output is sanitized for theological accuracy.
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

    // 3. Non-sacred segments: returned as-is.
    //    Real translation is performed server-side by MyMemory API
    //    in /api/ai/translate. This function only enforces the glossary.

    // 4. Directive 016: Sanitize for theological accuracy
    translatedText = sanitizeTheologicalOutput(translatedText);

    // 5. Determine vetting requirement
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
        sanitized: true, // Directive 016 flag
    };
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

// Directive 017: cleanTheology — public alias for the theological sanitization filter
export const cleanTheology = sanitizeTheologicalOutput;

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
