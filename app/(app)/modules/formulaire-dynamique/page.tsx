"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import FormulaireDynamiqueSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Formulaire dynamique est un moteur de formulaires conditionnels piloté par un
      schéma JSON. Le cas métier : un guichet de demandes internes (congés, achat de matériel,
      accès applicatif) où les champs affichés dépendent du type de demande et des réponses déjà
      saisies. Le formulaire n&apos;est pas codé en dur : un renderer générique parcourt le schéma,
      mappe chaque <code>fieldType</code> vers un composant bpm et applique les règles{" "}
      <code>visibleIf</code> en direct — un congé « sans solde » fait apparaître une justification
      requise, un achat de plus de 1 000 € exige une validation directeur, un profil admin impose
      un motif et une durée limitée.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.selectbox</code>, <code>bpm.input</code>, <code>bpm.textarea</code>,{" "}
      <code>bpm.checkbox</code>, <code>bpm.radioGroup</code> et <code>bpm.dateInput</code> pour les
      champs ; <code>bpm.message</code> pour les avertissements conditionnels ;{" "}
      <code>bpm.panel</code> + <code>bpm.labelValue</code> pour le récapitulatif ;{" "}
      <code>bpm.table</code> + <code>bpm.badge</code> pour les demandes soumises ;{" "}
      <code>bpm.jsonViewer</code> pour le schéma ; <code>bpm.metricRow</code> et{" "}
      <code>bpm.toast</code> pour le suivi.
    </p>
    <CodeBlock
      code={`import bpm

schema = load_form_schema("achat-materiel")  # le schéma JSON pilote tout

for field in schema["fields"]:
    if not visible(field, values):          # règle visibleIf évaluée en direct
        continue
    if field["type"] == "select":
        bpm.selectbox(field["label"], options=field["options"])
    elif field["type"] == "textarea":
        bpm.textarea(field["label"])
    elif field["type"] == "date":
        bpm.dateInput(field["label"])

bpm.button("Soumettre la demande", on_click=valider_et_soumettre)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local : trois schémas seedés, validation par champ et
      tableau des demandes en état React. En production, les schémas sont servis par une API et
      versionnés ; le renderer reste identique. Voir la{" "}
      <Link href="/modules/formulaire-dynamique/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour la spécification complète du schéma (types de champs, conditions, validation).
    </p>
  </div>
);

export default function FormulaireDynamiqueModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Formulaire dynamique
        </div>
        <h1>Formulaire dynamique</h1>
        <p className="doc-description">
          Moteur de formulaires conditionnels piloté par un schéma JSON : les champs, les règles de
          visibilité et la validation changent selon le type de demande. Testez les trois
          formulaires du guichet interne dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Métier</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/formulaire-dynamique/simulateur"
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
          { label: "Simulateur", content: <FormulaireDynamiqueSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
