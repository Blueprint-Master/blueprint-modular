"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BarChart, Button, Card, Input, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { ReportRow } from "@/lib/reports/snapshots";

type Snapshot = { id: string; source: "documents" | "contracts"; since: string; through: string; rows: ReportRow[] };
const copy = {
  fr: { title: "Mes rapports", source: "Source", documents: "Documents", contracts: "Contrats", since: "Du (UTC)", through: "Au (UTC)", generate: "Générer le rapport", history: "Historique", empty: "Aucun rapport enregistré.", zero: "Aucun enregistrement sur cette période.", login: "Se connecter", error: "Impossible de charger les rapports.", invalid: "Vérifiez les dates du rapport.", csv: "Télécharger le CSV" },
  en: { title: "My reports", source: "Source", documents: "Documents", contracts: "Contracts", since: "From (UTC)", through: "To (UTC)", generate: "Generate report", history: "History", empty: "No saved reports.", zero: "No records in this period.", login: "Sign in", error: "Could not load reports.", invalid: "Check the report dates.", csv: "Download CSV" },
};

export default function ReportWorkspace() {
  const { locale } = useI18n();
  const t = copy[locale];
  const [reports, setReports] = useState<Snapshot[]>([]);
  const [selected, setSelected] = useState<Snapshot | null>(null);
  const [source, setSource] = useState<Snapshot["source"]>("documents");
  const [since, setSince] = useState("");
  const [through, setThrough] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "saving" | "login" | "error">("loading");
  const [invalid, setInvalid] = useState(false);
  const retry = useRef<{ key: string; id: string } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const today = new Date().toISOString().slice(0, 10);
    setSince(today.slice(0, 8) + "01");
    setThrough(today);
    fetch("/api/reports", { signal: controller.signal }).then(async response => {
      if (response.status === 401) { setState("login"); return; }
      if (!response.ok) throw new Error();
      const rows: Snapshot[] = await response.json();
      if (controller.signal.aborted) return;
      setReports(rows);
      setSelected(rows[0] ?? null);
      setState("ready");
    }).catch(() => { if (!controller.signal.aborted) setState("error"); });
    return () => controller.abort();
  }, []);

  async function generate() {
    if (!since || !through || since > through) { setInvalid(true); return; }
    const key = [source, since, through].join("|");
    if (retry.current?.key !== key) retry.current = { key, id: crypto.randomUUID() };
    setInvalid(false);
    setState("saving");
    try {
      const response = await fetch("/api/reports", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: retry.current.id, source, since, through }) });
      if (response.status === 401) { setState("login"); return; }
      if (!response.ok) throw new Error();
      const report: Snapshot = await response.json();
      retry.current = null;
      setReports(all => [report, ...all.filter(other => other.id !== report.id)]);
      setSelected(report);
      setState("ready");
    } catch { setState("error"); }
  }

  const title = (r: Snapshot) => `${t[r.source]} · ${r.since.slice(0,10)} – ${r.through.slice(0,10)}`;
  return <div className="doc-page space-y-4">
    <h1>{t.title}</h1>
    {state === "login" ? <Link href="/login?callbackUrl=%2Fmodules%2Frapports%2Fespace">{t.login}</Link> : <>
      <Card title={t.source}>
        <Selectbox label={t.source} options={["documents", "contracts"].map(value => ({ value, label: t[value as Snapshot["source"]] }))} value={source} onChange={value => setSource(value === "contracts" ? value : "documents")} />
        <Input type="date" label={t.since} value={since} onChange={setSince} />
        <Input type="date" label={t.through} value={through} onChange={setThrough} />
        <Button disabled={state === "loading" || state === "saving"} onClick={generate}>{t.generate}</Button>
        {invalid && <p role="alert">{t.invalid}</p>}
        {state === "error" && <p role="alert">{t.error}</p>}
      </Card>
      <Card title={t.history}>
        {state === "ready" && !reports.length && <p>{t.empty}</p>}
        {reports.map(report => <Button key={report.id} variant="ghost" onClick={() => setSelected(report)}>{title(report)}</Button>)}
      </Card>
      {selected && <Card title={title(selected)}>
        {selected.rows.length ? <><BarChart data={selected.rows.map(row => ({ x: row.status, y: row.count }))} />
          <ul>{selected.rows.map(row => <li key={row.status}>{row.status} · {row.count}</li>)}</ul></> : <p>{t.zero}</p>}
        <a href={`/api/reports/${selected.id}?format=csv`}>{t.csv}</a>
      </Card>}
    </>}
  </div>;
}
