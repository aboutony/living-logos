import "./globals.css";

export const metadata = {
  title: "The Living Logos — Sovereign Orthodox Network",
  description:
    "The first sovereign, unified, and multilingual digital broadcast network for the Greek Orthodox Church. Live liturgical streams, Patristic AI translations, and a global network of Orthodox parishes.",
  keywords: [
    "Greek Orthodox",
    "Orthodox Church",
    "liturgy",
    "live stream",
    "Byzantine",
    "Ecumenical Patriarchate",
    "digital broadcast",
    "Patristic",
    "theological",
  ],
  metadataBase: new URL("https://living-logos.vercel.app"),
  openGraph: {
    title: "The Living Logos — Sovereign Orthodox Network",
    description:
      "The first sovereign digital broadcast network for the Greek Orthodox Church. Live liturgical streams with real-time Patristic AI translations.",
    url: "https://living-logos.vercel.app",
    siteName: "The Living Logos",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Living Logos — Sovereign Orthodox Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Living Logos — Sovereign Orthodox Network",
    description:
      "Live liturgical streams with real-time Patristic AI translations for the Greek Orthodox Church.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  verification: {},
  alternates: {
    canonical: "https://living-logos.vercel.app",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a1628",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="author" content="The Living Logos Network" />
        <meta name="application-name" content="The Living Logos" />
      </head>
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
