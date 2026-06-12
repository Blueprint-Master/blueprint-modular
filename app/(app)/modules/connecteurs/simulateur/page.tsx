"use client";

import Link from "next/link";
import ConnecteursSimulateur from "../simulateur-content";

export default function ConnecteursSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/connecteurs">Connecteurs</Link> → Simulateur
        </div>
        <h1>Simulateur — Connecteurs</h1>
        <p className="doc-description">
          Quatre connecteurs déjà configurés (ERP, banque, datawarehouse, CRM). Testez une
          connexion, lancez une synchronisation, corrigez l&apos;identifiant refusé du
          datawarehouse, ajoutez un connecteur ou supprimez-en un : chaque action met à jour le
          tableau, les métriques et le journal.
        </p>
      </div>
      <ConnecteursSimulateur />
    </div>
  );
}
