import "./globals.css";

export const metadata = {
  title: "The Living Logos — Sovereign Orthodox Network",
  description:
    "The first sovereign, unified, and multilingual digital broadcast network for the Greek Orthodox Church. A Satellite in the Palm.",
  keywords: [
    "Greek Orthodox",
    "liturgy",
    "live stream",
    "Byzantine",
    "Ecumenical Patriarchate",
    "digital broadcast",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

/* ──────────────────────────────────────────────
   Client Shell — manages theme + nav state
   ────────────────────────────────────────────── */
import ClientShell from "./ClientShell";
