import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Démarrage",
  description: "Guide de démarrage Blueprint Modular : cas d'usage, installation et premier composant.",
};

export default function GettingStartedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
