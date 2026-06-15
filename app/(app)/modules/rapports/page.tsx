"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import RapportsSimulateur from "./simulateur-content";
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
        {s.aboutText}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code> {s.and} <code>bpm.metric</code> ({s.compMetrics}),{" "}
        <code>bpm.selectbox</code> ({s.compSelectbox}), <code>bpm.lineChart</code> /{" "}
        <code>bpm.barChart</code> ({s.compCharts}), <code>bpm.table</code> ({s.compTablePrefix}{" "}
        <code>bpm.badge</code>, {s.compTableActions} <code>bpm.button</code>),{" "}
        <code>bpm.confirmModal</code> ({s.compConfirm}) {s.and} <code>bpm.toast</code> ({s.compToast}).
      </p>
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Rapports générés (30 j)", 2),
    bpm.metric("Modèles disponibles", 3),
])

modele = bpm.selectbox(options=modeles, label="Modèle de rapport")
periode = bpm.selectbox(options=["Année 2025", "S1 2025", "S2 2025"], label="Période")

bpm.button("Générer", on_click=generer_rapport)

bpm.lineChart(data=ca_mensuel)  # ou bpm.barChart pour les régions
bpm.table(
    columns=[("mois", "Mois"), ("ca2025", "CA 2025"), ("variation", "Variation N-1")],
    data=lignes_rapport,
)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.configText1}{" "}
        <Link href="/modules/rapports/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.configDocLink}
        </Link>{" "}
        {s.configText2}
      </p>
    </div>
  );
}

export default function RapportsModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={s.breadcrumbModule}
        title={s.moduleTitle}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/rapports/simulateur", label: s.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocContent /> },
          { label: s.tabSimulator, content: <RapportsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
