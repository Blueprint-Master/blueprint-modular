import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modules",
  description:
    "Modules Blueprint Modular — Auth, Wiki, IA, Analyse de documents, Base contractuelle, Veille et Notifications prêts à l'emploi.",
};

export default function ModulesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
