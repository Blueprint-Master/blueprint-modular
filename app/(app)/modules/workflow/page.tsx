"use client";

import { Tabs, CodeBlock, Card, Button, Badge } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type HistoryEntry, type Segment } from "./strings";

// Demo data: structured history entry, resolved per locale at render time.
const OVERVIEW_HISTORY: HistoryEntry = {
  from: "brouillon",
  to: "validé",
  who: "Alice",
  when: new Date(new Date().getFullYear(), 1, 24),
};

function Rich({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((seg, i) =>
        seg.strong ? (
          <strong key={i}>{seg.text}</strong>
        ) : seg.code ? (
          <code key={i}>{seg.text}</code>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </>
  );
}

export default function WorkflowModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];

  const docContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutHeading}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <Rich segments={s.aboutBody} />
      </p>
      <CodeBlock code={'bpm.title("Workflow")\n# États : brouillon, validé, archivé. Transitions selon droits.'} language="python" />
    </>
  );

  const simuContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.simuHeading}</h2>
      <Card variant="outlined" title={s.documentTitle(42)}>
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{s.statusLabel}</span>
          <Badge variant="primary">{s.statusBadge["validé"]}</Badge>
          <Button size="small" variant="outline">{s.archiveButton}</Button>
        </div>
        <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          {s.overviewHistory(
            OVERVIEW_HISTORY.from,
            OVERVIEW_HISTORY.to,
            OVERVIEW_HISTORY.who,
            s.formatDateShort(OVERVIEW_HISTORY.when)
          )}
        </p>
      </Card>
    </>
  );

  return (
    <div className="doc-page">
      <ModulePageHeader
        modulesLabel={s.breadcrumbModules}
        breadcrumbCurrent={s.moduleName}
        title={s.moduleName}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/workflow/simulateur", label: s.openSimulator }]}
      />
      <Tabs tabs={[{ label: s.tabDocumentation, content: docContent }, { label: s.tabSimulator, content: simuContent }]} defaultTab={0} />
    </div>
  );
}
