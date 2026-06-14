import type { Metadata, Viewport } from "next";
import "./globals.css";
import { APP_VERSION } from "@/lib/version";
import { getLocale } from "@/lib/i18n/server";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProviders } from "@/components/NotificationProviders";
import { ChunkLoadHandler } from "@/components/ChunkLoadHandler";
import { PwaSwRegister } from "@/components/PwaSwRegister";

// Origine canonique unique du site = apex blueprint-modular.com (décision UX/SEO).
// NEXT_PUBLIC_APP_URL peut pointer vers l'hôte de déploiement ; le défaut reste l'apex.
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://blueprint-modular.com";
const DEFAULT_DESC = "Briques Python/React pour vos interfaces métier. Sans HTML ni JavaScript.";
const FAVICON_QUERY = `?v=${process.env.NEXT_PUBLIC_FAVICON_V ?? APP_VERSION}`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "Blueprint Modular", template: "%s — Blueprint Modular" },
  description: DEFAULT_DESC,
  applicationName: "Blueprint Modular",
  manifest: "/manifest",
  // Pas de canonical global « fourre-tout » : il forçait chaque page (dont les
  // ~112 fiches composants) à pointer vers l'accueil. Chaque surface définit son
  // propre canonical (self-référentiel par défaut).
  icons: {
    icon: [
      { url: `/img/icon-pwa-192.png${FAVICON_QUERY}`, type: "image/png", sizes: "192x192" },
      { url: `/img/icon-pwa-512.png${FAVICON_QUERY}`, type: "image/png", sizes: "512x512" },
    ],
    apple: `/img/icon-pwa-512.png${FAVICON_QUERY}`,
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "BPM" },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Blueprint Modular",
    title: "Blueprint Modular",
    description: DEFAULT_DESC,
    url: BASE_URL,
    images: [{ url: "/img/og-cover.png", width: 1200, height: 630, alt: "Blueprint Modular" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blueprint Modular",
    description: DEFAULT_DESC,
    images: ["/img/og-cover.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link rel="icon" href={`/img/icon-pwa-192.png${FAVICON_QUERY}`} type="image/png" sizes="192x192" />
        <meta charSet="utf-8" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#ffffff" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('bpm-theme');document.documentElement.setAttribute('data-theme',t==='dark'?'dark':'light');var a=localStorage.getItem('bpm-accent-color');if(!a||a==='#1379e7'||a==='#00a3e2'){a='#048dc3';try{localStorage.setItem('bpm-accent-color','#048dc3');}catch(e){}}if(/^#[0-9A-Fa-f]{6}$/.test(a))document.documentElement.style.setProperty('--bpm-accent',a);})();`,
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Blueprint Modular",
              description: DEFAULT_DESC,
              url: BASE_URL,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
              inLanguage: "fr",
            }),
          }}
        />
        <a href="#main-content" className="skip-nav">Aller au contenu principal</a>
        <LocaleProvider initialLocale={locale}>
          <ThemeProvider>
            <AuthProvider>
              <NotificationProviders>
                <ChunkLoadHandler />
                <PwaSwRegister />
                {children}
              </NotificationProviders>
            </AuthProvider>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
