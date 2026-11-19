"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/bpm/Button";
import { Table, type TableColumn } from "@/components/bpm/Table";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Snapshot = { items: Record<string, unknown>[]; history: Record<string, unknown>[]; reports?: string[] };
type Module = "webhooks" | "export-planifie";

export function WorkerConsole({ module }: { module: Module }) {
  const { locale } = useI18n();
  const t = (fr: string, en: string) => locale === "fr" ? fr : en;
  const hooks = module === "webhooks";
  const endpoint = "/api/module-workers/" + module;
  const [data, setData] = useState<Snapshot | null>(null);
  const [failure, setFailure] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const keys = useRef(new Map<string, string>());
  const pendingRead = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    pendingRead.current?.abort();
    const controller = new AbortController();
    pendingRead.current = controller;
    try {
      const response = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
      const body = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok) throw new Error(body.error);
      setData(body);
      setFailure("");
    } catch (e) {
      if (!controller.signal.aborted) {
        setData(null);
        setFailure(e instanceof Error ? e.message : "unavailable");
      }
    }
  }, [endpoint]);

  useEffect(() => {
    void refresh();
    return () => pendingRead.current?.abort();
  }, [refresh]);

  async function mutate(command: Record<string, unknown>, success: string) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setNotice("");
    const fingerprint = JSON.stringify(command);
    const unique = command.action === "add" || command.action === "send";
    if (unique && !keys.current.has(fingerprint)) keys.current.set(fingerprint, crypto.randomUUID());
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unique ? { ...command, requestId: keys.current.get(fingerprint) } : command),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      keys.current.delete(fingerprint);
      setNotice(success);
      await refresh();
    } catch (e) {
      const reason = e instanceof Error ? e.message : "unavailable";
      if (reason === "login" || reason === "forbidden") setData(null);
      setFailure(reason);
    } finally {
      setBusy(false);
      locked.current = false;
    }
  }

  function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void mutate({
      action: "add", file: form.get("file"), frequency: form.get("frequency"), hour: form.get("hour"),
      zone: String(form.get("zone")).trim(), recipients: String(form.get("recipients")).split(",").map(v => v.trim()),
    }, t("Planification enregistrée.", "Schedule saved."));
  }

  const states: Record<string, string> = {
    accepted: t("Acceptée", "Accepted"), http_error: t("Refus HTTP", "HTTP rejection"),
    configuration_error: t("Configuration invalide", "Invalid configuration"),
    transport_error: t("Échec de connexion", "Connection failure"), interrupted: t("Interrompue", "Interrupted"),
    sent: t("Accepté par le relais SMTP", "Accepted by SMTP relay"), sending: t("En cours", "Sending"),
    pending: t("En attente", "Pending"), uncertain: t("Réception à vérifier", "Acknowledgement uncertain"),
    cancelled: t("Annulé", "Cancelled"), failed: t("Échec", "Failed"),
    daily: t("Chaque jour", "Daily"), weekly: t("Chaque lundi", "Every Monday"), monthly: t("Le 1ᵉʳ du mois", "First of each month"),
  };
  const date = (value: unknown) => typeof value === "number" ? new Date(value * 1000).toLocaleString(locale) : "—";
  const state = (value: unknown) => states[String(value)] ?? String(value);
  const col = (key: string, label: string, render?: TableColumn["render"]): TableColumn => ({ key, label, render });
  const items = hooks ? [
    col("id", t("Intégration", "Integration")), col("event", t("Événement", "Event")),
    col("failures", t("Échecs consécutifs", "Consecutive failures")),
  ] : [
    col("report", t("Rapport", "Report"), (v, row) => v + "." + row.format),
    col("recipients", t("Destinataires", "Recipients")),
    col("frequency", t("Fréquence", "Frequency"), (v, r) => [state(v), r.hour, r.zone].join(" · ")),
    col("due", t("Prochain envoi", "Next delivery"), (v, r) => r.active ? date(v) : "—"),
  ];
  items.push(col("status", t("État", "Status"), (_, r) => (hooks ? !r.paused : r.active) ? t("Actif", "Active") : t("Suspendu", "Paused")));
  items.push(col("actions", "Actions", (_, r) => {
    const active = hooks ? !r.paused : !!r.active;
    return <div className="flex gap-2">
      <Button size="sm" variant="secondary" disabled={busy} onClick={() => void mutate({ action: active ? "pause" : "resume", id: r.id },
        t("État enregistré.", "Status saved."))}>{active ? t("Suspendre", "Pause") : t("Reprendre", "Resume")}</Button>
      {!hooks && <Button size="sm" variant="outline" disabled={busy} onClick={() => void mutate({ action: "send", id: r.id },
        t("Envoi en file d’attente.", "Delivery queued."))}>{t("Envoyer maintenant", "Send now")}</Button>}
    </div>;
  }));
  const history = hooks ? [
    col("started", "Date", date), col("hook", t("Intégration", "Integration")), col("event_id", t("Événement", "Event ID")),
    col("outcome", t("Résultat", "Result"), state), col("http_code", "HTTP"),
  ] : [
    col("updated", "Date", date), col("report", t("Rapport", "Report"), (v, r) => v + "." + r.format),
    col("recipient", t("Destinataire", "Recipient")), col("status", t("Résultat", "Result"), state),
    col("detail", t("Détail", "Detail")), col("attempts", t("Tentatives", "Attempts")), col("run_id", t("Référence", "Run ID")),
  ];
  history.push(col("retry", t("Prochaine tentative", "Next attempt"), date));
  const errors: Record<string, string> = {
    login: t("Connectez-vous pour consulter les opérations.", "Sign in to view operations."),
    forbidden: t("Cet espace est réservé aux administrateurs de l’installation.", "Installation administrators can access these operations."),
    unconfigured: t("La base du worker doit être raccordée à cette installation.", "Connect the worker database to this installation."),
    invalid: t("Vérifiez les valeurs saisies et que la ligne existe toujours.", "Check your entries and that the record still exists."),
  };
  const field = "rounded border border-[var(--bpm-border)] bg-[var(--bpm-surface)] px-2 py-1";
  return <section className="space-y-4 py-4">
    {failure && <p role="alert">{errors[failure] ?? t("Worker inaccessible. Réessayez après vérification du service.", "Worker unavailable. Check the service and retry.")}</p>}
    {failure === "login" && <Link className="underline" href={"/login?callbackUrl=" + encodeURIComponent("/modules/" + module)}>{t("Se connecter", "Sign in")}</Link>}
    {notice && <p role="status">{notice}</p>}
    <Button size="sm" variant="secondary" disabled={busy} onClick={() => void refresh()}>{t("Actualiser", "Refresh")}</Button>
    {!data && !failure && <p role="status">{t("Chargement…", "Loading…")}</p>}
    {data && <>
      {!hooks && (data.reports?.length ? <form onSubmit={schedule} className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1">{t("Rapport", "Report")}<select className={field} name="file">{data.reports.map(file => <option key={file}>{file}</option>)}</select></label>
        <label className="grid gap-1">{t("Fréquence", "Frequency")}<select className={field} name="frequency">{["daily","weekly","monthly"].map(v => <option key={v} value={v}>{state(v)}</option>)}</select></label>
        <label className="grid gap-1">{t("Heure locale", "Local time")}<input className={field} name="hour" type="time" defaultValue="08:00" required /></label>
        <label className="grid gap-1">{t("Fuseau horaire", "Time zone")}<input className={field} name="zone" defaultValue="Europe/Paris" required /></label>
        <label className="grid gap-1">{t("Destinataires (séparés par des virgules)", "Recipients (comma-separated)")}<input className={field} name="recipients" type="email" multiple required /></label>
        <Button type="submit" disabled={busy}>{t("Planifier", "Schedule")}</Button>
      </form> : <p>{t("Aucun rapport configuré pour la planification.", "No reports configured for scheduling.")}</p>)}
      <h2 className="font-semibold">{hooks ? t("Abonnements", "Subscriptions") : t("Planifications", "Schedules")}</h2>
      <Table columns={items} data={data.items} keyColumn="id" trackContext={false} emptyMessage={t("Aucune configuration enregistrée.", "No configuration saved.")} />
      <h2 className="font-semibold">{hooks ? t("100 dernières tentatives", "Latest 100 attempts") : t("100 derniers reçus", "Latest 100 receipts")}</h2>
      <Table columns={history} data={data.history} trackContext={false} emptyMessage={t("Aucune livraison enregistrée.", "No deliveries recorded.")} />
    </>}
  </section>;
}
