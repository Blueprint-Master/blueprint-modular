"use client";

import { Tabs, CodeBlock } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, SAMPLE_POSTITS, type ColumnId } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{t.aboutHeading}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {t.aboutBefore}<strong>{t.aboutStrong}</strong>{t.aboutAfter}
      </p>
      <CodeBlock code={'# bpm — tableau blanc : post-it par colonnes\nbpm.title("Rétro")\n# Conteneur épuré (sans bpm.panel) : zone idées + colonnes + formulaire'} language="python" />
    </>
  );
}

function SimuContent() {
  const { locale } = useI18n();
  const t = STR[locale];
  const cols: { id: ColumnId; color: string; bg: string }[] = [
    { id: "bien", color: "#166534", bg: "rgba(34,197,94,0.15)" },
    { id: "ameliorer", color: "#b45309", bg: "rgba(251,146,60,0.2)" },
    { id: "action", color: "#1e40af", bg: "rgba(59,130,246,0.15)" },
  ];
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>{t.simuIntro}</p>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
        <div className="px-4 py-2 border-b text-sm font-semibold" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)", color: "var(--bpm-text-primary)" }}>
          {t.previewHeading}
        </div>
        <div className="p-4 grid gap-4" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          {cols.map((col) => (
            <div key={col.id} className="rounded-lg border min-h-[100px]" style={{ borderColor: col.color + "44", background: col.bg }}>
              <div className="px-3 py-2 rounded-t-lg font-semibold text-sm text-center" style={{ background: col.color, color: "#fff" }}>{t.columnLabels[col.id]}</div>
              <div className="p-2 space-y-2">
                {SAMPLE_POSTITS.filter((s) => s.column === col.id).map((s, i) => (
                  <div key={i} className="p-2 rounded border text-sm min-h-[48px]" style={{ background: "#fefce8", borderColor: "var(--bpm-border)", color: "var(--bpm-text-primary)" }}>{s.content[locale]}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 border-t text-xs" style={{ borderColor: "var(--bpm-border)", color: "var(--bpm-text-secondary)" }}>
          {t.previewFooter}
        </div>
      </div>
    </>
  );
}

export default function TableauBlancModulePage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={t.moduleName}
        title={t.moduleName}
        description={t.moduleDescription}
        category={t.categoryBadge}
        links={[{ href: "/modules/tableau-blanc/simulateur", label: t.openSimulator }]}
      />
      <Tabs tabs={[{ label: t.tabDocumentation, content: <DocContent /> }, { label: t.tabSimulator, content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
