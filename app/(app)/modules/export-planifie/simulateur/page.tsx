"use client";

import Link from "next/link";
import ExportPlanifieSimulateur from "../simulateur-content";

export default function ExportPlanifieSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/export-planifie">Export planifié</Link> → Simulateur
        </div>
        <h1>Simulateur — Export planifié</h1>
        <p className="doc-description">
          Quatre exports déjà planifiés (ventes, trésorerie, stocks, RH). Planifiez-en un nouveau,
          déclenchez un envoi manuel, suspendez ou supprimez : chaque action met à jour le tableau,
          les métriques et l&apos;historique.
        </p>
      </div>
      <ExportPlanifieSimulateur />
    </div>
  );
}
