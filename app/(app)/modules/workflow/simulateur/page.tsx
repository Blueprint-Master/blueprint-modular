"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Badge, Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, CURRENT_USER, type Status, type HistoryEntry } from "../strings";

// Demo seed: structured entry (display resolved per locale at render time).
const SEED_HISTORY: HistoryEntry[] = [
  { from: "brouillon", to: "validé", who: "Alice", when: new Date(new Date().getFullYear(), 1, 24, 14, 0) },
];

export default function WorkflowSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  const [status, setStatus] = useState<Status>("validé");
  const [history, setHistory] = useState<HistoryEntry[]>(SEED_HISTORY);

  const transition = (to: Status) => {
    setHistory((prev) => [...prev, { from: status, to, who: CURRENT_USER, when: new Date() }]);
    setStatus(to);
  };

  const canValidate = status === "brouillon";
  const canArchive = status === "validé";

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> → <Link href="/modules/workflow">{s.moduleName}</Link> → {s.breadcrumbSimulator}
        </div>
        <h1>{s.simulatorTitle}</h1>
        <p className="doc-description">
          {s.simulatorDescription}
        </p>
      </div>

      <Panel variant="info" title={s.documentTitle(42)}>
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{s.statusLabel}</span>
          <Badge variant={status === "archivé" ? "default" : status === "validé" ? "primary" : "default"}>
            {s.statusBadge[status]}
          </Badge>
          {canValidate && (
            <Button size="small" variant="primary" onClick={() => transition("validé")}>
              {s.validateButton}
            </Button>
          )}
          {canArchive && (
            <Button size="small" variant="outline" onClick={() => transition("archivé")}>
              {s.archiveButton}
            </Button>
          )}
          {status === "archivé" && (
            <Button size="small" variant="secondary" onClick={() => setStatus("brouillon")}>
              {s.resetButton}
            </Button>
          )}
        </div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--bpm-text-primary)" }}>{s.historyHeading}</p>
        <ul className="text-sm list-disc pl-5 space-y-0.5" style={{ color: "var(--bpm-text-secondary)" }}>
          {history.map((h, i) => (
            <li key={i}>
              {s.historyLine(h.from, h.to, h.who === CURRENT_USER ? s.you : h.who, s.formatDateTime(h.when))}
            </li>
          ))}
        </ul>
      </Panel>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.backToModule}</Link>
      </p>
    </div>
  );
}
