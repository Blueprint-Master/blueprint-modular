"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import MultiLangueSimulateur from "./simulateur-content";

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Multi-langue fournit un système i18n complet : dictionnaires de traduction par
      langue (FR, EN, ES), interpolation de variables ({"{prenom}"}), pluriels via{" "}
      <code>Intl.PluralRules</code>, formats de dates et de montants par locale
      (<code>Intl.DateTimeFormat</code>, <code>Intl.NumberFormat</code>) et repli automatique sur
      la langue de référence quand une clé manque. Le Simulateur applique tout cela à une
      mini-application de suivi des commandes : on bascule la langue et chaque texte, montant et
      date se retraduit instantanément.
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code> (langues, clés, couverture ES), <code>bpm.progress</code>{" "}
      (couverture par langue), <code>bpm.table</code> (commandes traduites avec{" "}
      <code>bpm.badge</code>, dictionnaire des clés), <code>bpm.message</code> (clés manquantes),{" "}
      <code>bpm.modal</code> + <code>bpm.input</code> (éditeur de traduction) et{" "}
      <code>bpm.toast</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Langues", 3),
    bpm.metric("Clés de traduction", 16),
    bpm.metric("Couverture ES", "81 %"),
])

# t() résout une clé dans la langue active, avec repli FR
bpm.title(t("app.titre"))                          # "Order tracking" en EN
bpm.text(t("message.bienvenue", prenom="Camille")) # interpolation
bpm.badge(t("commandes.nombre", count=3))          # pluriel one/other

bpm.progress(label="Español", value=81, max=100)
bpm.button("Traduire", on_click=ouvrir_editeur)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le simulateur fonctionne entièrement en local : dictionnaires seedés, traductions ajoutées en
      état React, choix de langue persisté en localStorage. En production, charger les
      dictionnaires depuis votre backend ou des fichiers JSON par locale. Voir la{" "}
      <Link href="/modules/multi-langue/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour la structure des dictionnaires, l&apos;interpolation, les pluriels et le repli.
    </p>
  </div>
);

export default function MultiLangueModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Multi-langue
        </div>
        <h1>Multi-langue</h1>
        <p className="doc-description">
          Dictionnaires FR/EN/ES, interpolation, pluriels, formats par locale et repli sur la
          langue de référence. Basculez la langue d&apos;une mini-application et complétez les
          traductions manquantes dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Intégrations &amp; technique</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/multi-langue/simulateur"
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
          { label: "Simulateur", content: <MultiLangueSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
