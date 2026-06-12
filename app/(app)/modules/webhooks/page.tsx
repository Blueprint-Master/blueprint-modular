"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import WebhooksSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Webhooks pousse vos événements métier (commande créée, seuil de stock atteint,
      facture payée…) vers des URLs externes : Slack, ERP, compta, CRM. Chaque webhook associe un
      événement déclencheur à une URL HTTPS et à un secret de signature HMAC ; la console suit le
      statut, le taux de succès et le journal des livraisons (code HTTP, durée). Tout reste
      pilotable : test manuel, suspension, reprise, suppression.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (statut et code HTTP rendus par{" "}
      <code>bpm.badge</code>, actions par <code>bpm.button</code>), <code>bpm.selectbox</code>{" "}
      (événement), <code>bpm.input</code> (validation https://), <code>bpm.confirmModal</code> et{" "}
      <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Webhooks actifs", 2),
    bpm.metric("Livraisons 24 h", 196),
    bpm.metric("Taux de succès global", "89,5 %"),
])

bpm.table(
    columns=[("evenement", "Webhook"), ("statut", "Statut"), ("tauxSucces", "Succès")],
    data=webhooks,
)

bpm.button("Créer le webhook", on_click=creer_webhook)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (données seedées, aucune API requise). En
      production, brancher la création sur votre bus d&apos;événements et l&apos;envoi sur un worker
      HTTP avec signature HMAC et retries exponentiels. Voir la{" "}
      <Link href="/modules/webhooks/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données, la signature et les points d&apos;intégration.
    </p>
  </div>
);

export default function WebhooksModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Webhooks
        </div>
        <h1>Webhooks</h1>
        <p className="doc-description">
          Émettez vos événements métier vers des URLs externes (Slack, ERP, compta, CRM) avec
          signature HMAC, journal des livraisons et retries. Testez, suspendez, supprimez : tout est
          visible dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Intégrations &amp; technique</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/webhooks/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Ouvrir le simulateur
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: "Documentation", content: docContent },
          { label: "Simulateur", content: <WebhooksSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
