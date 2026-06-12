"use client";

import Link from "next/link";
import ThemesSimulateur from "../simulateur-content";

export default function ThemesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/themes">Thèmes</Link> → Simulateur
        </div>
        <h1>Simulateur — Thèmes / White-label</h1>
        <p className="doc-description">
          Quatre thèmes seedés (Blueprint, ACME Corp, Nordis Énergie, Contraste élevé).
          Sélectionnez-en un, personnalisez accent, fond, nom d&apos;app et rayon de bordure :
          l&apos;aperçu scopé se met à jour en direct. Enregistrez, définissez par défaut,
          supprimez ou exportez en JSON.
        </p>
      </div>
      <ThemesSimulateur />
    </div>
  );
}
