"use client";

import { useState } from "react";

/**
 * SyncOverlay — Bilingual liturgical text overlay
 * Transparent text layer synchronized to the video playback.
 * Displays Greek (original) + selected translation side by side.
 */

const SAMPLE_LITURGY_TEXT = [
    {
        time: 0,
        greek: "Εὐλογημένη ἡ Βασιλεία τοῦ Πατρὸς καὶ τοῦ Υἱοῦ καὶ τοῦ Ἁγίου Πνεύματος",
        english: "Blessed is the Kingdom of the Father, and of the Son, and of the Holy Spirit",
        arabic: "مباركة مملكة الآب والابن والروح القدس",
    },
    {
        time: 15,
        greek: "Ἐν εἰρήνῃ τοῦ Κυρίου δεηθῶμεν.",
        english: "In peace, let us pray to the Lord.",
        arabic: "بسلام إلى الرب نطلب.",
    },
    {
        time: 30,
        greek: "Ὑπὲρ τῆς ἄνωθεν εἰρήνης καὶ τῆς σωτηρίας τῶν ψυχῶν ἡμῶν",
        english: "For the peace from above, and for the salvation of our souls",
        arabic: "من أجل السلام الذي من العلى وخلاص نفوسنا",
    },
    {
        time: 45,
        greek: "Ὑπὲρ τῆς εἰρήνης τοῦ σύμπαντος κόσμου",
        english: "For the peace of the whole world",
        arabic: "من أجل سلام كل العالم",
    },
    {
        time: 60,
        greek: "Κύριε, ἐλέησον.",
        english: "Lord, have mercy.",
        arabic: " يا رب ارحم.",
    },
    {
        time: 75,
        greek: "Σοφία. Ὀρθοί.",
        english: "Wisdom! Attend!",
        arabic: "الحكمة. فلنستقم.",
    },
    {
        time: 90,
        greek: "Δεῦτε, προσκυνήσωμεν καὶ προσπέσωμεν Χριστῷ.",
        english: "Come, let us worship and fall down before Christ.",
        arabic: "هلمّوا لنسجد ونركع أمام المسيح.",
    },
    {
        time: 105,
        greek: "Ἅγιος ὁ Θεός, Ἅγιος Ἰσχυρός, Ἅγιος Ἀθάνατος, ἐλέησον ἡμᾶς.",
        english: "Holy God, Holy Mighty, Holy Immortal, have mercy on us.",
        arabic: "قدوس الله، قدوس القوي، قدوس الذي لا يموت، ارحمنا.",
    },
];

const TRANSLATION_LANGUAGES = [
    { code: "english", label: "English" },
    { code: "arabic", label: "العربية" },
];

export default function SyncOverlay({ isVisible = true, currentTime = 0 }) {
    const [targetLang, setTargetLang] = useState("english");
    const [opacity, setOpacity] = useState(0.85);
    const [fontSize, setFontSize] = useState(16);

    // Find the current liturgical text based on playback time
    const currentText =
        [...SAMPLE_LITURGY_TEXT]
            .reverse()
            .find((t) => currentTime >= t.time) || SAMPLE_LITURGY_TEXT[0];

    if (!isVisible) return null;

    return (
        <div className="sync-overlay" style={{ opacity }}>
            {/* Controls */}
            <div className="sync-controls">
                <button
                    className="sync-btn"
                    onClick={() => setOpacity((prev) => Math.max(0.3, prev - 0.15))}
                    title="Decrease opacity"
                >
                    ◐
                </button>
                <button
                    className="sync-btn"
                    onClick={() => setOpacity((prev) => Math.min(1, prev + 0.15))}
                    title="Increase opacity"
                >
                    ◑
                </button>
                <button
                    className="sync-btn"
                    onClick={() => setFontSize((prev) => Math.max(12, prev - 2))}
                    title="Smaller text"
                >
                    A-
                </button>
                <button
                    className="sync-btn"
                    onClick={() => setFontSize((prev) => Math.min(24, prev + 2))}
                    title="Larger text"
                >
                    A+
                </button>
                <select
                    className="sync-lang-select"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                >
                    {TRANSLATION_LANGUAGES.map((l) => (
                        <option key={l.code} value={l.code}>
                            {l.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Bilingual Text */}
            <div className="sync-text" style={{ fontSize: `${fontSize}px` }}>
                <p className="sync-greek">{currentText.greek}</p>
                <div className="sync-divider" />
                <p className="sync-translation">{currentText[targetLang] || currentText.english}</p>
            </div>

            <style jsx>{`
        .sync-overlay {
          position: absolute;
          bottom: 60px;
          left: 16px;
          right: 16px;
          background: rgba(6, 9, 24, 0.80);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(212, 168, 83, 0.20);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          transition: opacity var(--duration-normal) var(--ease-out);
          z-index: 10;
          animation: fadeIn 0.4s var(--ease-out);
        }
        .sync-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          flex-wrap: wrap;
        }
        .sync-btn {
          padding: 6px 12px;
          font-size: 13px;
          min-width: 36px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--duration-fast);
        }
        .sync-btn:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.10);
        }
        .sync-btn:active {
          transform: scale(0.92);
        }
        .sync-lang-select {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          padding: 6px 10px;
          font-size: 13px;
          min-height: 36px;
        }
        .sync-lang-select option {
          background: var(--color-deep-navy);
        }
        .sync-text {
          text-align: center;
          line-height: 1.7;
        }
        .sync-greek {
          font-family: var(--font-serif);
          color: var(--color-gold-bright);
          font-style: italic;
          margin-bottom: 8px;
        }
        .sync-divider {
          width: 40px;
          height: 1px;
          background: rgba(212, 168, 83, 0.30);
          margin: 0 auto 8px;
        }
        .sync-translation {
          color: var(--text-primary);
          font-weight: 400;
        }
        @media (max-width: 480px) {
          .sync-overlay {
            left: 8px;
            right: 8px;
            bottom: 50px;
            padding: 12px;
          }
          .sync-btn {
            min-width: 40px;
            min-height: 40px;
          }
          .sync-lang-select {
            min-height: 40px;
          }
        }
      `}</style>
        </div>
    );
}
