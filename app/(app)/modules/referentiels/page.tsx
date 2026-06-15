"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ReferentielsSimulateur from "./simulateur-content";
import { STR } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.aboutBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      {locale === "en" ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.selectbox</code> (reference table picker),{" "}
          <code>bpm.table</code> with dynamic columns (status rendered with <code>bpm.badge</code>,
          actions with <code>bpm.button</code>), <code>bpm.input</code> (search and forms),{" "}
          <code>bpm.modal</code> (editing), <code>bpm.confirmModal</code> (deletion),{" "}
          <code>bpm.activityFeed</code> (history) and <code>bpm.toast</code>.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.selectbox</code> (choix du référentiel),{" "}
          <code>bpm.table</code> à colonnes dynamiques (statut rendu par <code>bpm.badge</code>,
          actions par <code>bpm.button</code>), <code>bpm.input</code> (recherche et formulaires),{" "}
          <code>bpm.modal</code> (édition), <code>bpm.confirmModal</code> (suppression),{" "}
          <code>bpm.activityFeed</code> (historique) et <code>bpm.toast</code>.
        </p>
      )}
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Référentiels", 4),
    bpm.metric("Entrées totales", 24),
    bpm.metric("Entrées inactives", 3),
])

ref = bpm.selectbox("Référentiel", options=["Devises", "Pays", "Taux de TVA", "Unités de mesure"])

bpm.table(
    columns=colonnes_du_referentiel(ref),   # colonnes propres à chaque table de codes
    data=entrees(ref),
)

bpm.button("Ajouter l'entrée", on_click=ajouter)
bpm.button("Exporter en CSV", on_click=exporter)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configTitle}
      </h3>
      {locale === "en" ? (
        <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          The simulator runs entirely locally (4 seeded reference tables, no API required). In
          production, plug the CRUD into your <code>reference_entries</code> table and broadcast
          changes to consuming applications. See the{" "}
          <Link href="/modules/referentiels/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
            documentation
          </Link>{" "}
          for the data model, governance and versioning.
        </p>
      ) : (
        <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Le simulateur fonctionne entièrement en local (4 référentiels seedés, aucune API requise).
          En production, brancher le CRUD sur votre table <code>reference_entries</code> et diffuser
          les changements aux applications consommatrices. Voir la{" "}
          <Link href="/modules/referentiels/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
            documentation
          </Link>{" "}
          pour le modèle de données, la gouvernance et le versionnage.
        </p>
      )}
    </div>
  );
}

export default function ReferentielsModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={s.moduleName}
        title={s.moduleName}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/referentiels/simulateur", label: s.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocContent /> },
          { label: s.tabSimulator, content: <ReferentielsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
