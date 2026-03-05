"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interactive 3D Globe — Global Aggregator Map
 * Directive 014: HQ Anchoring & Parish Relocation
 *
 * Features:
 * - "Introductory Revolution": Single smooth 360° rotation on page load.
 * - HQ Auto-Stop: After revolution, globe anchors to Living Logos HQ.
 * - HQ Visuals: Deep Royal Gold pin with distinct pulse animation.
 * - User Sovereignty: All auto-rotation ceases after HQ anchor. Full manual control.
 * - Tier-based styling: Gold (Tier 1), Silver (Tier 2), Bronze (Tier 3).
 *
 * KEY FIX: Globe.gl is mounted into a separate inner div to avoid
 * React DOM hydration conflicts (removeChild errors).
 */

// — Directive 014: HQ Coordinates (Ecumenical Patriarchate — The Phanar) —
const HQ_LAT = 41.0283;
const HQ_LNG = 28.9514;
const HQ_ALTITUDE = 1.8;

// — Deep Royal Gold for HQ —
const HQ_POINT_COLOR = "#B8860B";
const HQ_RING_COLOR = "rgba(184, 134, 11, 0.60)";

export default function Globe({ streams = [], onSelectStream }) {
    const mountRef = useRef(null);
    const globeInstanceRef = useRef(null);
    const initedRef = useRef(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    // Initialize globe once
    useEffect(() => {
        if (initedRef.current || !mountRef.current) return;
        initedRef.current = true;

        let revolutionFrame;
        let handleResize;

        async function initGlobe() {
            try {
                const GlobeModule = (await import("globe.gl")).default;

                const mount = mountRef.current;
                if (!mount) return;

                const globe = GlobeModule()(mount)
                    .globeImageUrl(
                        "//unpkg.com/three-globe/example/img/earth-night.jpg"
                    )
                    .bumpImageUrl(
                        "//unpkg.com/three-globe/example/img/earth-topology.png"
                    )
                    .backgroundImageUrl(
                        "//unpkg.com/three-globe/example/img/night-sky.png"
                    )
                    .showAtmosphere(true)
                    .atmosphereColor("rgba(212, 168, 83, 0.15)")
                    .atmosphereAltitude(0.2)
                    .width(mount.clientWidth)
                    .height(mount.clientHeight);

                // — Point markers for each stream —
                // Directive 014: HQ gets unique Deep Royal Gold + larger radius
                globe
                    .pointsData(streams)
                    .pointAltitude((d) => {
                        if (d.isHQ) return 0.1;
                        return d.isLive ? 0.06 : 0.02;
                    })
                    .pointRadius((d) => {
                        if (d.isHQ) return 0.9;
                        return d.isLive ? 0.6 : 0.3;
                    })
                    .pointColor((d) => {
                        if (d.isHQ) return HQ_POINT_COLOR;
                        if (!d.isLive) return "rgba(158, 158, 158, 0.5)";
                        if (d.authority?.level === 1) return "#F0C75E";
                        if (d.authority?.level === 2) return "#C0C0C0";
                        return "#CD7F32";
                    })
                    .pointLabel(
                        (d) => `
            <div style="
              background: rgba(10, 14, 39, 0.92);
              backdrop-filter: blur(12px);
              border: 1px solid ${d.isHQ ? 'rgba(184, 134, 11, 0.6)' : 'rgba(212, 168, 83, 0.3)'};
              border-radius: 10px;
              padding: 12px 16px;
              font-family: Inter, sans-serif;
              color: #EAEAF2;
              max-width: 260px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            ">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
                ${d.isHQ ? '<span style="color: #B8860B;">⛪ </span>' : d.isLive ? '<span style="color: #C62828;">● </span>' : ""}${d.name}
              </div>
              ${d.isHQ ? '<div style="font-size: 11px; color: #B8860B; margin-bottom: 4px; font-weight: 600;">☦ Living Logos Headquarters</div>' : ''}
              <div style="font-size: 12px; color: #9A9ABF; margin-bottom: 6px;">${d.location}</div>
              <div style="display: flex; gap: 8px; font-size: 11px;">
                <span style="background: rgba(212,168,83,0.15); padding: 2px 8px; border-radius: 99px; color: #D4A853;">${d.language}</span>
                <span style="background: rgba(255,255,255,0.06); padding: 2px 8px; border-radius: 99px; color: #9A9ABF;">${typeof d.rite === "string" ? d.rite.split(" of ").pop().split(" ").slice(0, 3).join(" ") : "Liturgy"}</span>
              </div>
              ${d.isLive
                                ? `<div style="margin-top: 6px; font-size: 11px; color: #8BC34A;">${d.viewerCount?.toLocaleString() || 0} watching</div>`
                                : ""
                            }
            </div>
          `
                    )
                    .onPointClick((point) => {
                        if (onSelectStream) onSelectStream(point);
                    });

                // — Rings (pulse): HQ gets unique Deep Royal Gold pulse —
                // Directive 014: Three tiers of pulse — HQ (royal), Pinned/Tier1 (gold), Standard (dim gold)
                const liveStreams = streams.filter((s) => s.isLive);
                const pinnedStreams = streams.filter((s) => s.pinned || s.authority?.level === 1);
                const ringStreams = [
                    // HQ always pulses with unique animation
                    ...streams.filter((s) => s.isHQ).map((s) => ({ ...s, _pulseType: "hq" })),
                    // Pinned/Tier 1 pulse (excluding HQ to avoid duplicates)
                    ...pinnedStreams.filter((s) => !s.isHQ).map((s) => ({ ...s, _pulseType: "pinned" })),
                    // Standard live pulse (non-pinned, non-Tier1)
                    ...liveStreams.filter((s) => !s.pinned && !s.isHQ && s.authority?.level !== 1).map((s) => ({ ...s, _pulseType: "standard" })),
                ];
                globe
                    .ringsData(ringStreams)
                    .ringLat((d) => d.lat)
                    .ringLng((d) => d.lng)
                    .ringColor((d) => () => {
                        if (d._pulseType === "hq") return HQ_RING_COLOR;
                        if (d._pulseType === "pinned") return "rgba(240, 199, 94, 0.50)";
                        return "rgba(212, 168, 83, 0.35)";
                    })
                    .ringMaxRadius((d) => {
                        if (d._pulseType === "hq") return 7;
                        if (d._pulseType === "pinned") return 5;
                        return 3;
                    })
                    .ringPropagationSpeed((d) => {
                        if (d._pulseType === "hq") return 3.5;
                        if (d._pulseType === "pinned") return 2.5;
                        return 1.5;
                    })
                    .ringRepeatPeriod((d) => {
                        if (d._pulseType === "hq") return 800;
                        if (d._pulseType === "pinned") return 1200;
                        return 2000;
                    });

                // — Directive 014: Disable ALL auto-rotation —
                globe.controls().autoRotate = false;
                globe.controls().autoRotateSpeed = 0;
                globe.controls().enableZoom = true;

                globeInstanceRef.current = globe;
                setIsLoaded(true);

                // ═══════════════════════════════════════════════════════
                // DIRECTIVE 014: "Introductory Revolution"
                // Single smooth 360° rotation → auto-stop at HQ
                // ═══════════════════════════════════════════════════════

                // Set initial POV
                const startLat = 20;
                const startLng = HQ_LNG - 180; // Start 180° away from HQ
                const startAlt = 2.5;
                globe.pointOfView({ lat: startLat, lng: startLng, altitude: startAlt }, 0);

                const REVOLUTION_DURATION = 6000; // 6 seconds for the full revolution
                const ANCHOR_DURATION = 1500;     // 1.5 seconds to ease into HQ
                const revolutionStart = performance.now();

                function easeInOutCubic(t) {
                    return t < 0.5
                        ? 4 * t * t * t
                        : 1 - Math.pow(-2 * t + 2, 3) / 2;
                }

                function animateRevolution(now) {
                    const elapsed = now - revolutionStart;
                    const progress = Math.min(elapsed / REVOLUTION_DURATION, 1);
                    const eased = easeInOutCubic(progress);

                    // Rotate 360° from startLng
                    const currentLng = startLng + (360 * eased);
                    // Gradually change latitude towards HQ
                    const currentLat = startLat + (HQ_LAT - startLat) * eased;
                    // Gradually lower altitude towards HQ viewing altitude
                    const currentAlt = startAlt + (HQ_ALTITUDE - startAlt) * eased;

                    globe.pointOfView(
                        { lat: currentLat, lng: currentLng, altitude: currentAlt },
                        0 // Instant update — we drive the animation ourselves
                    );

                    if (progress < 1) {
                        revolutionFrame = requestAnimationFrame(animateRevolution);
                    } else {
                        // Revolution complete → Anchor smoothly to HQ
                        globe.pointOfView(
                            { lat: HQ_LAT, lng: HQ_LNG, altitude: HQ_ALTITUDE },
                            ANCHOR_DURATION
                        );
                        // User Sovereignty: No further auto-movement.
                        // controls.autoRotate remains false.
                    }
                }

                // Start the revolution after a short delay for the globe to render
                setTimeout(() => {
                    revolutionFrame = requestAnimationFrame(animateRevolution);
                }, 800);

                // — Resize handler —
                handleResize = () => {
                    if (mount && globe) {
                        globe.width(mount.clientWidth);
                        globe.height(mount.clientHeight);
                    }
                };
                window.addEventListener("resize", handleResize);
            } catch (err) {
                console.error("Globe init error:", err);
                setError(err.message);
            }
        }

        initGlobe();

        return () => {
            if (revolutionFrame) cancelAnimationFrame(revolutionFrame);
            if (handleResize) window.removeEventListener("resize", handleResize);
            if (globeInstanceRef.current) {
                globeInstanceRef.current._destructor?.();
                globeInstanceRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update globe data when streams change
    useEffect(() => {
        const globe = globeInstanceRef.current;
        if (!globe || !streams.length) return;

        globe.pointsData(streams);

        const liveStreams = streams.filter((s) => s.isLive);
        const pinnedStreams = streams.filter((s) => s.pinned || s.authority?.level === 1);
        const ringStreams = [
            ...streams.filter((s) => s.isHQ).map((s) => ({ ...s, _pulseType: "hq" })),
            ...pinnedStreams.filter((s) => !s.isHQ).map((s) => ({ ...s, _pulseType: "pinned" })),
            ...liveStreams.filter((s) => !s.pinned && !s.isHQ && s.authority?.level !== 1).map((s) => ({ ...s, _pulseType: "standard" })),
        ];
        globe.ringsData(ringStreams);
    }, [streams]);

    return (
        <div className="globe-wrapper">
            {/* Globe.gl mounts directly into this div — no React children inside */}
            <div className="globe-mount" ref={mountRef} />

            {/* React-managed overlays are siblings, not children of the mount */}
            {!isLoaded && !error && (
                <div className="globe-overlay">
                    <div className="globe-loading-icon">☦</div>
                    <p>Initializing Global Map...</p>
                </div>
            )}
            {error && (
                <div className="globe-overlay">
                    <p>Globe visualization requires WebGL.</p>
                    <p className="text-muted">{error}</p>
                </div>
            )}

            <style jsx>{`
        .globe-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse at center, #0a0e27 0%, #060918 100%);
          touch-action: pan-x pan-y;
          -webkit-user-select: none;
          user-select: none;
        }
        .globe-mount {
          position: absolute;
          inset: 0;
          z-index: 1;
          touch-action: none;
        }
        .globe-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          font-size: var(--text-sm);
          gap: 12px;
          z-index: 2;
          pointer-events: none;
        }
        .globe-loading-icon {
          font-size: 48px;
          animation: iconGlow 2s ease-in-out infinite;
        }
      `}</style>
        </div >
    );
}
