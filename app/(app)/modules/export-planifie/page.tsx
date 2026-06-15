"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ExportPlanifieSimulateur from "./simulateur-content";
import { STR, type ModuleStrings } from "./strings";

function DocContent({ t }: { t: ModuleStrings }) {
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.aboutHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {t.aboutBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.componentsHeading}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code> ({t.compsTableParen1}{" "}
        <code>bpm.badge</code>, {t.compsTableParen2} <code>bpm.button</code>),{" "}
        <code>bpm.selectbox</code>, <code>bpm.input</code> ({t.compsInputParen}),{" "}
        <code>bpm.confirmModal</code>, <code>bpm.activityFeed</code> {t.andWord}{" "}
        <code>bpm.toast</code>.
      </p>
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Exports actifs", 3),
    bpm.metric("Envois — 30 derniers jours", 49),
])

bpm.table(
    columns=[("rapport", "Rapport"), ("frequence", "Fréquence"), ("prochainEnvoi", "Prochain envoi")],
    data=exports_planifies,
)

bpm.button("Planifier l'export", on_click=planifier)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.configHeading}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.configBody1}{" "}
        <Link href="/modules/export-planifie/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {t.configLinkLabel}
        </Link>{" "}
        {t.configBody2}
      </p>
    </div>
  );
}

export default function ExportPlanifieModulePage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={t.moduleTitle}
        title={t.moduleTitle}
        description={t.moduleDescription}
        category={t.categoryBadge}
        links={[{ href: "/modules/export-planifie/simulateur", label: t.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: t.docLabel, content: <DocContent t={t} /> },
          { label: t.simLabel, content: <ExportPlanifieSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
