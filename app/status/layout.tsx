import type { Metadata } from "next";
import { getDict } from "@/lib/i18n/server";

/**
 * Layout minimal de la page /status — publique, sans chrome (hors groupe
 * (public)/(site), donc pas de SiteNav/SiteFooter). Le layout racine fournit
 * déjà <html>/<body> et les providers ; on n'ajoute ici que les métadonnées.
 *
 * `noindex` assumé : la page est accessible par URL directe et via un lien
 * discret en pied de page, mais n'est pas indexée tant qu'il n'y a pas
 * d'utilisateurs (l'historique se constitue d'abord). Voir le message de commit
 * « unlisted, noindex ».
 */
export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDict();
  return {
    title: dict.status.metaTitle,
    description: dict.status.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
