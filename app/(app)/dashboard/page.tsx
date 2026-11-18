import { PlanoHome } from "@/components/plano/PlanoHome";
import { StartBuildingBlock } from "@/components/StartBuildingBlock";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil",
  description:
    "Tableau de bord Blueprint Modular — installez le package Python BPM et accédez à vos composants, modules et sandbox en un clic.",
  alternates: { canonical: "https://app.blueprint-modular.com/dashboard" },
};

export default function DashboardPage() {
  return (
    <>
      <PlanoHome />
      <div className="doc-page plano-dashboard-install" data-page-description="Tableau de bord Blueprint Modular — installation du package Python BPM, accès aux composants, modules et sandbox.">
        <StartBuildingBlock />
      </div>
    </>
  );
}
