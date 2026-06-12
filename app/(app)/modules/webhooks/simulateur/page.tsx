"use client";

import Link from "next/link";
import WebhooksSimulateur from "../simulateur-content";

export default function WebhooksSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/webhooks">Webhooks</Link> → Simulateur
        </div>
        <h1>Simulateur — Webhooks</h1>
        <p className="doc-description">
          Quatre webhooks déjà configurés (Slack, ERP, compta, CRM). Testez une livraison, créez un
          webhook avec validation de l&apos;URL, suspendez ou supprimez : chaque action met à jour le
          tableau, les métriques et le journal des livraisons.
        </p>
      </div>
      <WebhooksSimulateur />
    </div>
  );
}
