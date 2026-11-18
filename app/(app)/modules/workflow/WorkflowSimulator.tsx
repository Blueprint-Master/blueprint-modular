"use client";

import { useState } from "react";
import { Badge, Button, Card } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { nextStatus } from "@/lib/workflow/transitions";
import { STR, CURRENT_USER, type Status, type HistoryEntry } from "./strings";

interface DemoState {
  status: Status;
  history: HistoryEntry[];
}

export function WorkflowSimulator() {
  const { locale } = useI18n();
  const s = STR[locale];
  const [{ status, history }, setWorkflow] = useState<DemoState>(() => ({
    status: "validé",
    history: [{ from: "brouillon", to: "validé", who: "Alice", when: new Date(2026, 1, 24, 14) }],
  }));

  const transition = (to: Status) => {
    const when = new Date();
    setWorkflow(current => {
      if (current.status !== status || nextStatus[current.status] !== to) return current;
      return { status: to, history: [...current.history, { from: current.status, to, who: CURRENT_USER, when }] };
    });
  };

  return (
      <Card variant="outlined" title={s.documentTitle(42)}>
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{s.statusLabel}</span>
          <Badge variant={status === "archivé" ? "default" : status === "validé" ? "primary" : "default"}>
            {s.statusBadge[status]}
          </Badge>
          {nextStatus[status] === "validé" && (
            <Button size="small" variant="primary" onClick={() => transition("validé")}>
              {s.validateButton}
            </Button>
          )}
          {nextStatus[status] === "archivé" && (
            <Button size="small" variant="outline" onClick={() => transition("archivé")}>
              {s.archiveButton}
            </Button>
          )}
          {status === "archivé" && (
            <Button size="small" variant="secondary" onClick={() => setWorkflow({ status: "brouillon", history: [] })}>
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
      </Card>
  );
}
