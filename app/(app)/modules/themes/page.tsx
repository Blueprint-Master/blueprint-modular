"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import ThemesSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Thèmes / White-label fait porter le branding par l&apos;instance, pas par le code :
      chaque client (ou environnement) reçoit son thème — nom d&apos;application, couleur
      d&apos;accent, fond, surface, texte et rayon de bordure. Le studio permet de partir
      d&apos;un thème existant, de le personnaliser en direct dans un aperçu scopé, puis de
      l&apos;enregistrer, de le définir par défaut ou de l&apos;exporter en JSON pour le déployer.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Ce que couvre le simulateur
    </h3>
    <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
      <li>Quatre thèmes seedés : Blueprint (défaut), ACME Corp, Nordis Énergie, Contraste élevé.</li>
      <li>Aperçu live : barre d&apos;app (logo + nom), cartes KPI, bouton primaire, champ, badge — entièrement stylés par le thème sélectionné, sans toucher aux variables globales.</li>
      <li>Personnalisation : accent, fond, nom de l&apos;app, rayon de bordure (0–16 px).</li>
      <li>Actions réelles : enregistrer comme nouveau thème, définir par défaut, supprimer (avec confirmation), exporter en JSON (téléchargement).</li>
    </ul>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.panel</code>, <code>bpm.colorPicker</code>,{" "}
      <code>bpm.slider</code>, <code>bpm.input</code>, <code>bpm.badge</code>,{" "}
      <code>bpm.confirmModal</code> et <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

theme = bpm.theme.get("acme-corp")

bpm.input("Nom de l'app", value=theme.couleurApp, on_change=set_nom)
bpm.colorPicker("Couleur d'accent", value=theme.accent, on_change=set_accent)
bpm.colorPicker("Couleur de fond", value=theme.fond, on_change=set_fond)
bpm.slider("Rayon de bordure (px)", value=theme.rayon, min=0, max=16, on_change=set_rayon)

bpm.button("Enregistrer comme nouveau thème", on_click=enregistrer)
bpm.button("Définir par défaut", on_click=definir_defaut)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local (thèmes seedés, aucune API requise).
      L&apos;aperçu est scopé à son conteneur : il n&apos;écrit jamais dans les variables CSS
      globales du document, qui restent pilotées par le ThemeProvider de l&apos;application. Voir
      la{" "}
      <Link href="/modules/themes/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour les variables exposées, le modèle JSON et la résolution multi-tenant.
    </p>
  </div>
);

export default function ThemesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Thèmes
        </div>
        <h1>Thèmes / White-label</h1>
        <p className="doc-description">
          Studio de thème par instance ou client : nom d&apos;app, couleurs, rayon de bordure.
          Personnalisez avec un aperçu en direct, enregistrez, définissez par défaut, exportez en
          JSON — tout est testable dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Intégrations &amp; technique</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/themes/simulateur"
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
          { label: "Simulateur", content: <ThemesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
