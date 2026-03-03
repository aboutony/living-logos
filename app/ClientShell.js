"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Globe, Radio, CalendarDays, Wallet, Menu, X } from "lucide-react";

/**
 * ClientShell — Directive 005: Absolute Mobile-First
 *
 *   Header (64px):  Logo (left) + Theme Toggle + Hamburger (right)
 *   Bottom Bar (72px): Map · Live · Schedule · Wallet (Lucide icons)
 *   Drawer: Full navigation (slides from right)
 *
 * Viewports < 768px: NO text links in header. Bottom bar is primary nav.
 */

const BOTTOM_TABS = [
    { href: "/", label: "Map", Icon: Globe },
    { href: "/watch", label: "Live", Icon: Radio },
    { href: "/schedule", label: "Schedule", Icon: CalendarDays },
    { href: "/wallet", label: "Wallet", Icon: Wallet },
];

const DRAWER_LINKS = [
    { href: "/", label: "Global Map", icon: "🌍" },
    { href: "/watch", label: "Live Now", icon: "📡" },
    { href: "/newsroom", label: "Newsroom", icon: "🎙️" },
    { href: "/broadcaster", label: "Broadcaster", icon: "📊" },
    { href: "/schedule", label: "Schedule", icon: "📅" },
    { href: "/wallet", label: "Wallet", icon: "🔐" },
    { href: "/library", label: "Library", icon: "📚" },
];

export default function ClientShell({ children }) {
    const [theme, setTheme] = useState("dark");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const pathname = usePathname();

    /* ── Theme persistence ── */
    useEffect(() => {
        const stored = localStorage.getItem("ll-theme");
        if (stored === "light" || stored === "dark") {
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("ll-theme", next);
    }, [theme]);

    /* ── Drawer lifecycle ── */
    useEffect(() => { setDrawerOpen(false); }, [pathname]);
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape") setDrawerOpen(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    return (
        <>
            {/* ═══════════════════════════════════════
          HEADER — 64px Sanctuary
          Logo (left) + Theme Toggle + Hamburger (right)
          ═══════════════════════════════════════ */}
            <header className="header-bar" role="banner">
                <a href="/" className="nav-logo">
                    <span className="nav-logo-icon">☦</span>
                    <span className="nav-logo-text">Living Logos</span>
                </a>
                <div className="header-right">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        title={theme === "dark" ? "Liturgical White" : "Night Vigil"}
                    >
                        {theme === "dark" ? "☀️" : "🌙"}
                    </button>
                    <button
                        className="hamburger-btn"
                        onClick={() => setDrawerOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={24} strokeWidth={2} />
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════
          SIDE DRAWER
          ═══════════════════════════════════════ */}
            <div
                className={`drawer-backdrop ${drawerOpen ? "open" : ""}`}
                onClick={() => setDrawerOpen(false)}
            />
            <aside
                className={`drawer-panel ${drawerOpen ? "open" : ""}`}
                role="dialog"
                aria-label="Navigation"
            >
                <div className="drawer-header">
                    <span className="drawer-title">☦ Navigation</span>
                    <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                        <X size={20} strokeWidth={2} />
                    </button>
                </div>
                <nav className="drawer-nav">
                    {DRAWER_LINKS.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={`drawer-link ${pathname === link.href ? "active" : ""}`}
                        >
                            <span className="drawer-link-icon">{link.icon}</span>
                            <span>{link.label}</span>
                        </a>
                    ))}
                </nav>
                <div className="drawer-footer">
                    <div className="footer-badge" style={{ margin: 0 }}>
                        <span>🛡️</span>
                        <span>Sovereign · Ad-Free · One Doctrine</span>
                    </div>
                </div>
            </aside>

            {/* ═══════════════════════════════════════
          MAIN CONTENT
          ═══════════════════════════════════════ */}
            <main className="main">{children}</main>

            {/* ═══════════════════════════════════════
          BOTTOM BAR — 72px Thumb-Zone Navigation
          4 equally spaced Lucide icons
          ═══════════════════════════════════════ */}
            <nav className="bottom-bar" role="navigation" aria-label="Primary navigation">
                {BOTTOM_TABS.map(({ href, label, Icon }) => (
                    <a
                        key={href}
                        href={href}
                        className={`bottom-tab ${pathname === href ? "active" : ""}`}
                    >
                        <Icon size={24} strokeWidth={1.8} />
                        <span className="bottom-tab-label">{label}</span>
                    </a>
                ))}
            </nav>

            {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
            <footer className="footer">
                <div className="container">
                    <p>
                        <span className="cross-ornament">☦</span>
                        &nbsp; The Living Logos Network &nbsp;
                        <span className="cross-ornament">☦</span>
                    </p>
                    <p style={{ marginTop: "var(--space-sm)" }}>
                        Sovereign · Ad-Free · One Doctrine
                    </p>
                    <div className="footer-badge">
                        <span>🛡️</span>
                        <span>Zero secular advertisements · Zero third-party algorithms</span>
                    </div>
                </div>
            </footer>
        </>
    );
}
