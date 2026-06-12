"use client";

import Link from "next/link";
import DevisFacturationSimulateur from "../simulateur-content";

export default function DevisFacturationSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/devis-facturation">Devis / Facturation</Link> → Simulateur
        </div>
        <h1>Simulateur — Devis / Facturation</h1>
        <p className="doc-description">
          Trois devis seedés (ACME en brouillon, Nordis envoyé, Globex payé). Sélectionnez un devis
          dans la liste, ajoutez ou modifiez des lignes, envoyez-le au client, marquez-le payé,
          ouvrez l&apos;aperçu imprimable : métriques et totaux sont recalculés à chaque action.
        </p>
      </div>
      <DevisFacturationSimulateur />
    </div>
  );
}
