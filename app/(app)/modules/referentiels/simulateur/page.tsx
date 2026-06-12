"use client";

import Link from "next/link";
import ReferentielsSimulateur from "../simulateur-content";

export default function ReferentielsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/referentiels">Référentiels</Link> → Simulateur
        </div>
        <h1>Simulateur — Référentiels</h1>
        <p className="doc-description">
          Quatre tables de codes seedées (devises, pays, taux de TVA, unités de mesure).
          Ajoutez une entrée, modifiez-la, désactivez-la, exportez le référentiel en CSV :
          chaque action met à jour le tableau, les métriques et l&apos;historique. La suppression
          est refusée si l&apos;entrée est encore utilisée (ex. EUR).
        </p>
      </div>
      <ReferentielsSimulateur />
    </div>
  );
}
