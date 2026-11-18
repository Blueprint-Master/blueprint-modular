import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider } from "@/contexts/SidebarContext";

/**
 * Shell du site public. Planothèque (18/11/2026) : la vitrine et l'app parlent
 * la même langue — le MÊME rail que l'app à gauche (barre repliée), la nav du
 * site réduite à une ligne au-dessus du contenu. Les pages démo de (public)
 * restent hors de ce groupe, sans chrome.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="site-shell plano-site">
        <Sidebar />
        <div className="plano-site-column">
          <SiteNav />
          <main id="main-content" style={{ flex: 1 }}>
            {children}
          </main>
          <SiteFooter />
        </div>
      </div>
    </SidebarProvider>
  );
}
