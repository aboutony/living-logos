"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Interactive 3D Globe — Global Aggregator Map
 * Renders live-stream "pulses" worldwide using globe.gl.
 * Features: "Follow the Sun" terminator, click-to-select, tier-based styling.
 *
 * KEY FIX: Globe.gl is mounted into a separate inner div to avoid
 * React DOM hydration conflicts (removeChild errors).
 */
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

        let sunInterval;
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
                globe
                    .pointsData(streams)
                    .pointAltitude((d) => (d.isLive ? 0.06 : 0.02))
                    .pointRadius((d) => (d.isLive ? 0.6 : 0.3))
                    .pointColor((d) => {
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
              border: 1px solid rgba(212, 168, 83, 0.3);
              border-radius: 10px;
              padding: 12px 16px;
              font-family: Inter, sans-serif;
              color: #EAEAF2;
              max-width: 260px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
            ">
              <div style="font-weight: 700; font-size: 14px; margin-bottom: 4px;">
                ${d.isLive ? '<span style="color: #C62828;">● </span>' : ""}${d.name}
              </div>
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

                // — Rings (pulse) for live streams —
                const liveStreams = streams.filter((s) => s.isLive);
                globe
                    .ringsData(liveStreams)
                    .ringLat((d) => d.lat)
                    .ringLng((d) => d.lng)
                    .ringColor(() => () => "rgba(212, 168, 83, 0.35)")
                    .ringMaxRadius(3)
                    .ringPropagationSpeed(1.5)
                    .ringRepeatPeriod(2000);

                // — Initial camera angle —
                globe.pointOfView({ lat: 35, lng: 25, altitude: 2.2 }, 1000);

                // — Auto-rotate —
                globe.controls().autoRotate = true;
                globe.controls().autoRotateSpeed = 0.3;
                globe.controls().enableZoom = true;

                globeInstanceRef.current = globe;
                setIsLoaded(true);

                // — Follow the Sun —
                sunInterval = setInterval(() => {
                    const hour = new Date().getUTCHours();
                    const sunLng = 30 - hour * 15;
                    globe.pointOfView(
                        { lat: 30, lng: sunLng > 180 ? sunLng - 360 : sunLng },
                        3000
                    );
                }, 60000);

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
            if (sunInterval) clearInterval(sunInterval);
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
        globe.ringsData(liveStreams);
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
