"use client";

import Link from "next/link";
import AuditLogSimulateur from "../simulateur-content";

export default function AuditLogSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/audit-log">Audit / Log</Link> → Simulateur
        </div>
        <h1>Simulateur — Audit / Log</h1>
        <p className="doc-description">
          32 événements tracés sur 10 jours (créations, modifications, suppressions, connexions —
          5 acteurs). Combinez recherche plein texte, acteur, type d&apos;action et période,
          cliquez sur une ligne pour le détail complet (JSON brut inclus) et exportez la sélection
          en CSV.
        </p>
      </div>
      <AuditLogSimulateur />
    </div>
  );
}
