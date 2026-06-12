"use client";

import Link from "next/link";
import TachesSimulateur from "../simulateur-content";

export default function TachesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">Tâches</Link> →
          Simulateur
        </div>
        <h1>Simulateur — Tâches</h1>
        <p className="doc-description">
          Huit tâches du sprint en cours (équipe produit, référence au 12/06/2026). Créez une
          tâche, faites-la avancer (« Démarrer », « Terminer »), modifiez l&apos;assigné ou
          l&apos;échéance, supprimez : métriques, compteurs et badges « En retard » se mettent à
          jour en direct. Les filtres statut, assigné et recherche se combinent.
        </p>
      </div>
      <TachesSimulateur />
    </div>
  );
}
