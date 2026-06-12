"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import DevisFacturationSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Devis / Facturation couvre le quotidien d&apos;une petite structure de services :
      créer un devis pour un client, le composer ligne par ligne (désignation, quantité, prix
      unitaire, remise optionnelle), suivre les totaux HT / TVA 20 % / TTC recalculés en direct,
      puis dérouler le cycle de vie — brouillon, envoyé au client, payé. Un devis payé est
      verrouillé ; l&apos;aperçu imprimable produit un document propre via l&apos;impression du
      navigateur.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (liste des devis avec{" "}
      <code>onRowClick</code>, lignes du devis, aperçu), <code>bpm.badge</code> (statuts),{" "}
      <code>bpm.input</code> / <code>bpm.numberInput</code> (formulaire de ligne),{" "}
      <code>bpm.modal</code> (aperçu imprimable, nouveau devis), <code>bpm.confirmModal</code>{" "}
      (suppression de ligne) et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Devis en cours", 2),
    bpm.metric("Montant TTC en attente", "5 944,80 €"),
    bpm.metric("Encaissé", "5 520,00 €"),
])

bpm.table(
    columns=[("numero", "Numéro"), ("client", "Client"), ("ttc", "Total TTC"), ("statut", "Statut")],
    data=devis,
    on_row_click=ouvrir_editeur,
)

bpm.button("Envoyer au client", on_click=envoyer)   # brouillon -> envoyé
bpm.button("Marquer payé", on_click=encaisser)      # envoyé -> payé (lecture seule)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Calculs
    </h3>
    <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Chaque ligne vaut <code>quantité × P.U. × (1 − remise/100)</code> ; le total HT est la somme
      des lignes, la TVA est appliquée à 20 % et le TTC en découle. Tout est recalculé à chaque
      ajout, modification ou suppression de ligne — aucun montant n&apos;est stocké en double.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (trois devis seedés, aucune API requise). En
      production, brancher la persistance sur votre base, l&apos;envoi sur votre service e-mail et
      la génération PDF sur l&apos;impression navigateur ou un moteur dédié. Voir la{" "}
      <Link href="/modules/devis-facturation/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour le modèle de données, la numérotation et le cycle de statuts.
    </p>
  </div>
);

export default function DevisFacturationModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Devis / Facturation
        </div>
        <h1>Devis / Facturation</h1>
        <p className="doc-description">
          Composez vos devis ligne par ligne (quantités, prix, remises), suivez les totaux HT /
          TVA / TTC en direct et déroulez le cycle brouillon → envoyé → payé, avec aperçu
          imprimable. Tout est manipulable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Métier</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/devis-facturation/simulateur"
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
          { label: "Simulateur", content: <DevisFacturationSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
