"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import NotificationsCibleesSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Notifications ciblées est un moteur de règles : à chaque événement métier
      (document validé, devis créé, ticket critique…) il évalue les règles actives — événement,
      condition optionnelle (ex. « montant &gt; 10 000 »), destinataires (équipe ou rôle), canaux —
      et envoie les notifications uniquement aux bonnes personnes, sur les bons canaux (in-app,
      e-mail, SMS). Le banc d&apos;essai intégré émet de vrais événements : les règles se
      déclenchent, le journal se remplit et les notifications in-app arrivent dans la cloche du
      header (module Notification).
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (statut et canaux rendus par{" "}
      <code>bpm.badge</code>, actions par <code>bpm.button</code>), <code>bpm.selectbox</code>,{" "}
      <code>bpm.input</code>, <code>bpm.checkbox</code> (multi-canaux),{" "}
      <code>bpm.confirmModal</code>, <code>bpm.message</code>, <code>bpm.activityFeed</code>{" "}
      (journal des déclenchements) et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Règles actives", 4),
    bpm.metric("Déclenchements (7 j)", 23),
])

bpm.table(
    columns=[("nom", "Règle"), ("destinataires", "Destinataires"), ("canaux", "Canaux")],
    data=regles_notification,
)

# Banc d'essai : émettre un événement et laisser le moteur évaluer les règles
bpm.button("Émettre l'événement", on_click=lambda: moteur.emettre("devis.cree", montant=12500))`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (règles seedées, aucune API requise). En
      production, brancher l&apos;émission d&apos;événements sur votre bus (webhooks, file de
      messages) et les canaux sur vos services d&apos;envoi. Voir la{" "}
      <Link href="/modules/notifications-ciblees/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de règle, les événements disponibles et les bonnes pratiques anti-spam.
    </p>
  </div>
);

export default function NotificationsCibleesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Notifications ciblées
        </div>
        <h1>Notifications ciblées</h1>
        <p className="doc-description">
          Moteur de règles événement → conditions → destinataires/canaux : notifiez la bonne équipe,
          sur le bon canal, uniquement quand c&apos;est pertinent. Émettez un événement dans le banc
          d&apos;essai et observez les règles se déclencher.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Processus &amp; workflow</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/notifications-ciblees/simulateur"
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
          { label: "Simulateur", content: <NotificationsCibleesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
