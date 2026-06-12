"use client";

import Link from "next/link";
import TableauxDeBordSimulateur from "../simulateur-content";

export default function TableauxDeBordSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/tableaux-de-bord">Tableaux de bord</Link> → Simulateur
        </div>
        <h1>Simulateur — Tableaux de bord</h1>
        <p className="doc-description">
          Cinq widgets affichés par défaut, huit au catalogue. Cliquez sur « Personnaliser » pour
          réordonner (↑ / ↓), redimensionner (⤢, 1 ou 2 colonnes), masquer ou ajouter des widgets
          depuis la bibliothèque. Votre disposition est sauvegardée localement et restaurée à la
          prochaine visite.
        </p>
      </div>
      <TableauxDeBordSimulateur />
    </div>
  );
}
