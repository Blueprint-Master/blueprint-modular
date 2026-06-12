"use client";

import Link from "next/link";
import RapportsSimulateur from "../simulateur-content";

export default function RapportsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/rapports">Rapports</Link> →
          Simulateur
        </div>
        <h1>Simulateur — Rapports</h1>
        <p className="doc-description">
          Trois modèles prêts à l&apos;emploi (CA mensuel, commandes par région, effectifs par
          service) et deux rapports déjà générés. Choisissez un modèle et une période — le filtre
          s&apos;applique vraiment aux données —, générez, consultez l&apos;aperçu (métriques,
          graphique, tableau) et téléchargez le CSV.
        </p>
      </div>
      <RapportsSimulateur />
    </div>
  );
}
