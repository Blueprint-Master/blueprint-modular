"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import TableauxDeBordSimulateur from "./simulateur-content";
import { STR, type ModuleStrings } from "./strings";

// Snippet python inchangé quelle que soit la locale.
const PYTHON_SNIPPET = `import bpm

# Chaque widget du catalogue rend un vrai composant bpm
bpm.metric("CA du mois", "142,5 k€", delta="+12,3 %")
bpm.line_chart(ventes_12_mois)          # 12 points mensuels
bpm.bar_chart(ca_par_region)            # 6 régions
bpm.table(columns=[("ref", "Réf."), ("nom", "Produit"), ("ca", "CA")], data=top_produits)
bpm.progress_ring(78, max=100)          # objectif trimestre
bpm.activity_feed(dernieres_commandes)  # 4 dernières commandes

# La disposition (ordre, taille, visibilité) est un simple JSON persisté
layout = [
    {"id": "metric-ca", "size": 1},
    {"id": "line-ventes", "size": 2},
]`;

function DocContent({ s }: { s: ModuleStrings }) {
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
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metric</code>, <code>bpm.lineChart</code>, <code>bpm.barChart</code>,{" "}
        <code>bpm.table</code>, <code>bpm.progressRing</code>, <code>bpm.activityFeed</code>,{" "}
        <code>bpm.panel</code> ({s.componentsLibrary}), <code>bpm.button</code> ({s.componentsToolbar}),{" "}
        <code>bpm.confirmModal</code> ({s.componentsReset}) {s.and} <code>bpm.toast</code>.
      </p>
      <CodeBlock code={PYTHON_SNIPPET} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.customizationTitle}
      </h3>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.customizationItems.map((item) => (
          <li key={item.strong}>
            <strong>{item.strong}</strong>
            {item.text}
          </li>
        ))}
      </ul>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.simNoteBeforeCode}
        <code>localStorage</code>
        {s.simNoteAfterCode}
        <Link href="/modules/tableaux-de-bord/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.simNoteLinkLabel}
        </Link>
        {s.simNoteEnd}
      </p>
    </div>
  );
}

export default function TableauxDeBordModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        modulesLabel={s.breadcrumbModules}
        breadcrumbCurrent={s.moduleTitle}
        title={s.moduleTitle}
        description={s.pageDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/tableaux-de-bord/simulateur", label: s.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocContent s={s} /> },
          { label: s.tabSimulator, content: <TableauxDeBordSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
