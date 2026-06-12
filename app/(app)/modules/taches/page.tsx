"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import TachesSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module <strong>Tâches</strong> est un gestionnaire de tâches d&apos;équipe complet :
      création, assignation à un membre, échéance avec détection automatique du retard, priorité
      et cycle de statuts (À faire → En cours → Terminé). Il peut être utilisé en standalone ou
      relié à un autre module (projet, livrable, ticket).
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Concepts
    </h3>
    <ul className="list-disc pl-5 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      <li>
        <strong style={{ color: "var(--bpm-text-primary)" }}>Tâche</strong> : titre, description
        courte, assigné, échéance (date), priorité (haute / normale / basse), statut.
      </li>
      <li>
        <strong style={{ color: "var(--bpm-text-primary)" }}>Statuts</strong> : À faire, En cours,
        Terminé — avancement en un clic (« Démarrer », « Terminer »).
      </li>
      <li>
        <strong style={{ color: "var(--bpm-text-primary)" }}>Retard</strong> : échéance antérieure
        à la date du jour et statut différent de Terminé → badge rouge « En retard ».
      </li>
      <li>
        <strong style={{ color: "var(--bpm-text-primary)" }}>Filtres combinés</strong> : statut
        (avec compteurs), assigné et recherche plein texte se cumulent.
      </li>
    </ul>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (échéance, priorité et statut rendus par{" "}
      <code>bpm.badge</code>, actions par <code>bpm.button</code>), <code>bpm.selectbox</code>,{" "}
      <code>bpm.input</code> (recherche et date), <code>bpm.modal</code> (création / édition),{" "}
      <code>bpm.confirmModal</code> (suppression) et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`# Exemple Python (bpm) — gestionnaire de tâches
import bpm

bpm.metricRow([
    bpm.metric("À faire", 4),
    bpm.metric("En cours", 3),
    bpm.metric("En retard", 2),
])

bpm.table(
    columns=[
        {"key": "titre", "label": "Tâche"},
        {"key": "assigne", "label": "Assigné"},
        {"key": "echeance", "label": "Échéance"},
        {"key": "priorite", "label": "Priorité"},
        {"key": "statut", "label": "Statut"},
    ],
    data=taches,
)

bpm.button("Nouvelle tâche", on_click=ouvrir_modale_creation)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (8 tâches seedées, aucune API requise). En
      production, brancher les actions (création, avancement, suppression) sur votre API CRUD et
      persister les tâches en base. Voir la{" "}
      <Link href="/modules/taches/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données, les transitions d&apos;état et les règles de retard.
    </p>
  </div>
);

export default function TachesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Tâches
        </div>
        <h1>Tâches</h1>
        <p className="doc-description">
          Gestionnaire de tâches d&apos;équipe : création, assignation, échéances avec détection du
          retard, priorités et avancement des statuts. Testez tout dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Processus &amp; workflow</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/taches/simulateur"
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
          { label: "Simulateur", content: <TachesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
