import { NextResponse } from "next/server";

/**
 * POST /api/ai/transcribe
 *
 * Directive 011: Internal Audio Sovereignty — Server-Side Transcription
 *
 * Receives audio data captured from the internal audio buffer
 * (NOT from a microphone) and returns transcribed text.
 *
 * Architecture: This endpoint is designed to be pluggable.
 * Current: Simulated transcription engine for demonstration
 * Future: Plug in Google Cloud Speech-to-Text, OpenAI Whisper, or AssemblyAI
 *
 * Body: {
 *   audioData: string (base64 encoded audio chunk),
 *   format: string (e.g. "webm", "ogg", "wav"),
 *   sourceLang: string (e.g. "el", "en", "ar"),
 *   streamId: string (stream identifier for context)
 * }
 *
 * Response: {
 *   success: boolean,
 *   transcript: string,
 *   confidence: number,
 *   engine: string
 * }
 */

// Simulated liturgical transcription fragments — these represent what a real
// speech-to-text engine would return from a Greek Orthodox liturgical stream.
// In production, audioData would be sent to Google STT / Whisper / AssemblyAI.
const LITURGICAL_TRANSCRIPTS = {
    el: [
        "Κύριε ἐλέησον",
        "Ὑπὲρ τῆς ἄνωθεν εἰρήνης",
        "Εὐλογημένη ἡ Βασιλεία τοῦ Πατρός",
        "Δόξα σοι, Κύριε, δόξα σοι",
        "Ἅγιος ὁ Θεός, Ἅγιος Ἰσχυρός",
        "Τὸν Σταυρόν σου προσκυνοῦμεν",
        "Σοφία· Ὀρθοί",
        "Εἰρήνη πᾶσι",
        "Δεῦτε προσκυνήσωμεν",
        "Πάτερ ἡμῶν ὁ ἐν τοῖς οὐρανοῖς",
        "Ἀμήν",
        "Χριστὸς Ἀνέστη ἐκ νεκρῶν",
        "Τὴν Θεοτόκον καὶ Μητέρα τοῦ Φωτός",
    ],
    en: [
        "Lord have mercy",
        "For the peace from above",
        "Blessed is the Kingdom of the Father",
        "Glory to You, O Lord, glory to You",
        "Holy God, Holy Mighty",
        "We venerate Your Cross",
        "Wisdom, arise",
        "Peace be unto all",
        "Come let us worship",
        "Our Father who art in heaven",
        "Amen",
        "Christ is risen from the dead",
        "The Theotokos and Mother of the Light",
    ],
    ar: [
        "يا رب ارحم",
        "من أجل السلام الذي من العلاء",
        "مباركة مملكة الآب",
        "المجد لك يا رب المجد لك",
        "قدوس الله، قدوس القوي",
        "لصليبك نسجد",
        "الحكمة، فلنستقم",
        "السلام لجميعكم",
        "هلموا لنسجد",
        "أبانا الذي في السماوات",
        "آمين",
        "المسيح قام من بين الأموات",
        "والدة الإله وأم النور",
    ],
};

// Track transcript position per stream for sequential playback
const streamPositions = new Map();

export async function POST(request) {
    try {
        const body = await request.json();
        const { audioData, format, sourceLang, streamId } = body;

        if (!audioData) {
            return NextResponse.json(
                { success: false, error: "audioData is required" },
                { status: 400 }
            );
        }

        const lang = sourceLang || "el";
        const transcripts = LITURGICAL_TRANSCRIPTS[lang] || LITURGICAL_TRANSCRIPTS.el;

        // Get the current position for this stream
        const key = `${streamId || "default"}-${lang}`;
        const currentPos = streamPositions.get(key) || 0;
        const nextPos = (currentPos + 1) % transcripts.length;
        streamPositions.set(key, nextPos);

        // Simulate processing delay proportional to audio chunk size
        const audioSize = audioData.length;
        const processingDelay = Math.min(100, Math.max(20, audioSize / 1000));
        await new Promise((r) => setTimeout(r, processingDelay));

        return NextResponse.json({
            success: true,
            transcript: transcripts[currentPos],
            confidence: 0.92 + Math.random() * 0.07,
            engine: "Sovereign Transcription Engine v1.0",
            source: "internal-audio-buffer",
            micRequired: false,
            chunkSize: audioSize,
            format: format || "webm",
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Transcription failed: " + err.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/ai/transcribe
 * Returns engine status and capabilities.
 */
export async function GET() {
    return NextResponse.json({
        engine: "Sovereign Transcription Engine v1.0",
        status: "operational",
        source: "internal-audio-buffer",
        microphoneRequired: false,
        supportedFormats: ["webm", "ogg", "wav", "mp4"],
        note: "Directive 011: Internal Audio Sovereignty — No microphone, no external noise, pure digital stream processing.",
        pluggableBackends: [
            "Google Cloud Speech-to-Text",
            "OpenAI Whisper",
            "AssemblyAI",
            "Mozilla DeepSpeech",
        ],
    });
}
