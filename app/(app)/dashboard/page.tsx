import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Tableau de bord Blueprint Modular — installez le package Python BPM et accédez à vos composants, modules et sandbox en un clic.",
};

export default function DashboardPage() {
  return <div className="min-h-[50vh]" style={{ background: "var(--bpm-bg-primary)" }} />;
}
