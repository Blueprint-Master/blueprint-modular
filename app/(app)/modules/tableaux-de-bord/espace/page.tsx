"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart, Button, Card, Metric, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { ReportRow } from "@/lib/reports/snapshots";

type Widget = { reportId: string; display: "chart" | "total" };
type Layout = { revision: number; widgets: Widget[] };
type Report = { id: string; source: "documents" | "contracts"; since: string; through: string; createdAt: string; rows: ReportRow[] };
const strings = {
  fr: { title: "Mon tableau de bord", reports: "Mes rapports", source: "Rapport", add: "Ajouter", chart: "Graphique", total: "Total", up: "Monter", remove: "Retirer", empty: "Créez un rapport pour alimenter le tableau de bord.", login: "Se connecter", conflict: "Le tableau a été modifié dans une autre session. La dernière version a été chargée.", failure: "Impossible de charger ou d’enregistrer le tableau.", retry: "Recharger", documents: "Documents", contracts: "Contrats" },
  en: { title: "My dashboard", reports: "My reports", source: "Report", add: "Add", chart: "Chart", total: "Total", up: "Move up", remove: "Remove", empty: "Create a report to populate the dashboard.", login: "Sign in", conflict: "Another session changed the dashboard. The latest version has been loaded.", failure: "Could not load or save the dashboard.", retry: "Reload", documents: "Documents", contracts: "Contracts" },
};

export default function DashboardWorkspace() {
  const { locale } = useI18n();
  const t = strings[locale];
  const [layout, setLayout] = useState<Layout>({ revision: 0, widgets: [] });
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, select] = useState<string | null>(null);
  const [mode, setMode] = useState<Widget["display"]>("chart");
  const [state, setState] = useState<"loading" | "ready" | "busy" | "login" | "error" | "conflict">("loading");
  const read = useCallback(async (conflict = false, signal?: AbortSignal) => {
    try {
      const [dashboard, source] = await Promise.all([fetch("/api/dashboards/personal", { signal }), fetch("/api/reports", { signal })]);
      if (dashboard.status === 401 || source.status === 401) { setState("login"); return; }
      if (!dashboard.ok || !source.ok) throw new Error();
      const [saved, available] = await Promise.all([dashboard.json(), source.json()]);
      if (signal?.aborted) return;
      setLayout(saved);
      setReports(available);
      setState(conflict ? "conflict" : "ready");
    } catch { if (!signal?.aborted) setState("error"); }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void read(false, controller.signal);
    return () => controller.abort();
  }, [read]);
  async function save(widgets: Widget[]) {
    setState("busy");
    try {
      const response = await fetch("/api/dashboards/personal", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revision: layout.revision, widgets }) });
      if (response.status === 409) { await read(true); return; }
      if (response.status === 401) { setState("login"); return; }
      if (!response.ok) throw new Error();
      setLayout(await response.json());
      select(null);
      setState("ready");
    } catch { setState("error"); }
  }
  const label = (r: Report) => `${t[r.source]} · ${r.since.slice(0, 10)} – ${r.through.slice(0, 10)} · ${new Date(r.createdAt).toLocaleString(locale)}`;
  const editable = state === "ready" || state === "conflict";
  const available = reports.filter(r => !layout.widgets.some(w => w.reportId === r.id));
  return <div className="doc-page space-y-4">
    <h1>{t.title}</h1>
    {state === "login" ? <Link href="/login?callbackUrl=%2Fmodules%2Ftableaux-de-bord%2Fespace">{t.login}</Link> : <>
      <Link href="/modules/rapports/espace">{t.reports}</Link>
      {state === "conflict" && <p role="alert">{t.conflict}</p>}
      {state === "error" && <p role="alert">{t.failure} <Button onClick={() => read()}>{t.retry}</Button></p>}
      {editable && !reports.length && <p>{t.empty}</p>}
      {available.length > 0 && <Card title={t.source}>
        <Selectbox label={t.source} options={available.map(r => ({ value: r.id, label: label(r) }))} value={selected} onChange={select} />
        <Selectbox label={t.chart} options={[{ value: "chart", label: t.chart }, { value: "total", label: t.total }]} value={mode} onChange={v => setMode(v === "total" ? v : "chart")} />
        <Button disabled={!editable || !selected} onClick={() => selected && save([...layout.widgets, { reportId: selected, display: mode }])}>{t.add}</Button>
      </Card>}
      {layout.widgets.map((widget, index) => {
        const report = reports.find(r => r.id === widget.reportId);
        if (!report) return null;
        return <Card key={report.id} title={label(report)}>
          {widget.display === "chart" && report.rows.length ? <BarChart data={report.rows.map(r => ({ x: r.status, y: r.count }))} />
            : <Metric label={t.total} value={report.rows.reduce((sum, row) => sum + row.count, 0)} />}
          {index > 0 && <Button disabled={!editable} onClick={() => {
            const order = layout.widgets.slice();
            [order[index - 1], order[index]] = [order[index], order[index - 1]];
            void save(order);
          }}>{t.up}</Button>}
          <Button disabled={!editable} onClick={() => save(layout.widgets.filter(w => w.reportId !== report.id))}>{t.remove}</Button>
        </Card>;
      })}
    </>}
  </div>;
}
