/**
 * Layout minimal pour les routes publiques (démo, landing).
 * Pas de NextAuth ni sidebar app — contenu seul.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
