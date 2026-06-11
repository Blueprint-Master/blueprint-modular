import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";

/**
 * Shell du site public (accueil, /components) : nav + footer communs.
 * Les pages démo de (public) restent hors de ce groupe, sans chrome.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-shell" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bpm-bg-primary)" }}>
      <SiteNav />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
