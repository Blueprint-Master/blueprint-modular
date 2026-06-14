"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Table, Badge, Button } from "@/components/bpm";
import type { LineWithMetrics } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { exportLinesCSV } from "../demo-export";
import { STR } from "../strings";

function statusVariant(status: string): "success" | "warning" | "error" {
  if (status === "active") return "success";
  if (status === "maintenance") return "warning";
  return "error";
}

export function DemoLinesClient({
  lines,
  period,
}: {
  lines: LineWithMetrics[];
  period: DemoPeriod;
}) {
  const { locale } = useI18n();
  const t = STR[locale];
  const router = useRouter();

  const handleRowClick = useCallback(
    (row: Record<string, unknown>) => {
      const code = row.codeForLink as string;
      if (code) router.push(`/demo/production/lines/${code}?period=${period}`);
    },
    [period, router]
  );

  const handleExportCSV = useCallback(() => {
    exportLinesCSV(lines, period);
  }, [lines, period]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const tableData = lines.map((l) => ({
    name: l.name,
    code: l.code,
    status: l.status,
    todayTRS: l.todayTRS,
    todayAvailability: l.todayAvailability,
    todayPerformance: l.todayPerformance,
    todayQuality: l.todayQuality,
    activeSessions: l.activeSessions,
    codeForLink: l.code,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="small" onClick={handleExportCSV}>
          {t.exportCSV}
        </Button>
        <Button variant="outline" size="small" onClick={handlePrint}>
          {t.exportPDF}
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table
          columns={[
            { key: "name", label: t.colLine },
            { key: "code", label: t.colCode },
            {
              key: "status",
              label: t.colStatus,
              render: (_, row) => (
                <Badge variant={statusVariant(String(row.status))}>
                  {String(row.status)}
                </Badge>
              ),
            },
            {
              key: "todayTRS",
              label: t.colTRS,
              render: (_, row) => (
                <div className="flex items-center gap-2">
                  <span>{Number(row.todayTRS).toFixed(1)} %</span>
                  <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "var(--bpm-bg-secondary)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Number(row.todayTRS))}%`,
                        background: Number(row.todayTRS) >= 80 ? "var(--bpm-accent-mint)" : Number(row.todayTRS) >= 70 ? "orange" : "#dc2626",
                      }}
                    />
                  </div>
                </div>
              ),
            },
            { key: "todayAvailability", label: t.colAvailability, decimals: 1 },
            { key: "todayPerformance", label: t.colPerformance, decimals: 1 },
            { key: "todayQuality", label: t.colQuality, decimals: 1 },
            { key: "activeSessions", label: t.colSessions },
          ]}
          data={tableData}
          defaultSortColumn="todayTRS"
          defaultSortDirection="desc"
          minWidth={800}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}
