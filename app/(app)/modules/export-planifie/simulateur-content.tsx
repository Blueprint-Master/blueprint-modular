"use client";

import { useMemo, useState } from "react";
import { ActivityFeed, Badge, Button, Card, ConfirmModal, Input, Metric, MetricRow, Selectbox, Table, type ActivityItem, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  ACTIVITY_ACTIONS,
  FREQ_LABEL,
  REPORT_LABELS,
  STR,
  type Frequence,
  type L,
  type ReportKey,
} from "./strings";

type Format = "PDF" | "CSV";

interface PlannedExport {
  id: string;
  rapportKey: ReportKey;
  format: Format;
  frequence: Frequence;
  heure: string;
  destinataires: string[];
  actif: boolean;
  dernierEnvoi: L;
  prochainEnvoi: L;
  envois30j: number;
}

/** Entrée d'activité bilingue, ré-résolue au render selon la locale. */
interface LocalizedActivity {
  id: string;
  action: L;
  target: L;
  timestamp: string;
  color: "default" | "info" | "success" | "warning" | "error";
}

const HEURE_OPTIONS = ["06:30", "07:00", "08:00", "12:00", "18:00"].map((h) => ({ value: h, label: h }));

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: "PDF", label: "PDF" },
  { value: "CSV", label: "CSV" },
];

const DASH: L = { fr: "—", en: "—" };

/**
 * Jeu de démonstration déterministe (libellés relatifs figés : pas de Date.now()
 * au render, donc rendu identique serveur/client).
 */
const INITIAL_EXPORTS: PlannedExport[] = [
  {
    id: "exp-1",
    rapportKey: "ventes",
    format: "PDF",
    frequence: "weekly",
    heure: "08:00",
    destinataires: ["dir.commerciale@acme.fr", "ventes@acme.fr"],
    actif: true,
    dernierEnvoi: { fr: "lundi 08:00", en: "Monday 08:00" },
    prochainEnvoi: { fr: "lundi prochain 08:00", en: "next Monday 08:00" },
    envois30j: 4,
  },
  {
    id: "exp-2",
    rapportKey: "tresorerie",
    format: "CSV",
    frequence: "daily",
    heure: "06:30",
    destinataires: ["daf@acme.fr"],
    actif: true,
    dernierEnvoi: { fr: "ce matin 06:30", en: "this morning 06:30" },
    prochainEnvoi: { fr: "demain 06:30", en: "tomorrow 06:30" },
    envois30j: 22,
  },
  {
    id: "exp-3",
    rapportKey: "stocks",
    format: "PDF",
    frequence: "daily",
    heure: "07:00",
    destinataires: ["logistique@acme.fr", "achats@acme.fr", "supply@acme.fr"],
    actif: true,
    dernierEnvoi: { fr: "ce matin 07:00", en: "this morning 07:00" },
    prochainEnvoi: { fr: "demain 07:00", en: "tomorrow 07:00" },
    envois30j: 22,
  },
  {
    id: "exp-4",
    rapportKey: "rh",
    format: "CSV",
    frequence: "monthly",
    heure: "08:00",
    destinataires: ["rh@acme.fr", "paie@acme.fr"],
    actif: false,
    dernierEnvoi: { fr: "le 1ᵉʳ du mois 08:00", en: "on the 1st of the month 08:00" },
    prochainEnvoi: DASH,
    envois30j: 1,
  },
];

const INITIAL_ACTIVITY: LocalizedActivity[] = [
  {
    id: "h1",
    action: ACTIVITY_ACTIONS.sent,
    target: {
      fr: `${REPORT_LABELS.tresorerie.fr} (CSV) à 1 destinataire`,
      en: `${REPORT_LABELS.tresorerie.en} (CSV) to 1 recipient`,
    },
    timestamp: "2026-06-12T06:30:00",
    color: "success",
  },
  {
    id: "h2",
    action: ACTIVITY_ACTIONS.sent,
    target: {
      fr: `${REPORT_LABELS.stocks.fr} (PDF) à 3 destinataires`,
      en: `${REPORT_LABELS.stocks.en} (PDF) to 3 recipients`,
    },
    timestamp: "2026-06-12T07:00:00",
    color: "success",
  },
  {
    id: "h3",
    action: ACTIVITY_ACTIONS.sent,
    target: {
      fr: `${REPORT_LABELS.ventes.fr} (PDF) à 2 destinataires`,
      en: `${REPORT_LABELS.ventes.en} (PDF) to 2 recipients`,
    },
    timestamp: "2026-06-08T08:00:00",
    color: "success",
  },
  {
    id: "h4",
    action: ACTIVITY_ACTIONS.paused,
    target: {
      fr: `${REPORT_LABELS.rh.fr} (demande de la paie)`,
      en: `${REPORT_LABELS.rh.en} (payroll request)`,
    },
    timestamp: "2026-06-02T09:14:00",
    color: "warning",
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NEVER: L = { fr: "jamais", en: "never" };
const JUST_NOW: L = { fr: "à l'instant", en: "just now" };

/**
 * Prochaine occurrence calculée côté client (appelé uniquement dans un handler).
 * Retourne la paire FR/EN pour que le libellé suive la locale courante.
 */
function computeNextRun(frequence: Frequence, heure: string): L {
  const now = new Date();
  const next = new Date(now);
  const [h, m] = heure.split(":").map(Number);
  next.setHours(h, m, 0, 0);
  if (frequence === "daily") {
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequence === "weekly") {
    const delta = (8 - next.getDay()) % 7 || 7;
    next.setDate(next.getDate() + delta);
  } else {
    next.setMonth(next.getMonth() + 1, 1);
  }
  const opts = { weekday: "short", day: "2-digit", month: "2-digit" } as const;
  return {
    fr: `${next.toLocaleDateString("fr-FR", opts)} ${heure}`,
    en: `${next.toLocaleDateString("en-GB", opts)} ${heure}`,
  };
}

export default function ExportPlanifieSimulateur() {
  const { locale } = useI18n();
  const t = STR[locale];
  const { showToast } = useToast();
  const [exports, setExports] = useState<PlannedExport[]>(INITIAL_EXPORTS);
  const [activity, setActivity] = useState<LocalizedActivity[]>(INITIAL_ACTIVITY);
  const [toDelete, setToDelete] = useState<PlannedExport | null>(null);

  const [rapport, setRapport] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>("PDF");
  const [frequence, setFrequence] = useState<string | null>("weekly");
  const [heure, setHeure] = useState<string | null>("08:00");
  const [emails, setEmails] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const rapportOptions = useMemo(
    () =>
      (Object.keys(REPORT_LABELS) as ReportKey[]).map((key) => ({
        value: key,
        label: REPORT_LABELS[key][locale],
      })),
    [locale]
  );

  const freqOptions = useMemo(
    () => [
      { value: "daily", label: t.freqOptDaily },
      { value: "weekly", label: t.freqOptWeekly },
      { value: "monthly", label: t.freqOptMonthly },
    ],
    [t]
  );

  const stats = useMemo(() => {
    const actifs = exports.filter((e) => e.actif).length;
    const envois = exports.reduce((sum, e) => sum + e.envois30j, 0);
    const uniques = new Set(exports.flatMap((e) => e.destinataires)).size;
    return { actifs, envois, uniques };
  }, [exports]);

  /** Flux d'activité résolu dans la locale courante (y compris entrées dynamiques). */
  const activityItems = useMemo<ActivityItem[]>(
    () =>
      activity.map((a) => ({
        id: a.id,
        actor: t.schedulerActor,
        action: a.action[locale],
        target: a.target[locale],
        timestamp: a.timestamp,
        color: a.color,
      })),
    [activity, locale, t]
  );

  const pushActivity = (action: L, target: L, color: LocalizedActivity["color"]) => {
    setActivity((prev) => [
      { id: `h${Date.now()}`, action, target, timestamp: new Date().toISOString(), color },
      ...prev,
    ]);
  };

  const sendNow = (exp: PlannedExport) => {
    const label = REPORT_LABELS[exp.rapportKey];
    setExports((prev) =>
      prev.map((e) => (e.id === exp.id ? { ...e, dernierEnvoi: JUST_NOW, envois30j: e.envois30j + 1 } : e))
    );
    const n = exp.destinataires.length;
    pushActivity(
      ACTIVITY_ACTIONS.sentManual,
      {
        fr: `${label.fr} (${exp.format}) à ${n} destinataire(s)`,
        en: `${label.en} (${exp.format}) to ${n} recipient(s)`,
      },
      "info"
    );
    showToast(
      t.toastSentMsg(label[locale], exp.destinataires.join(", ")),
      "success",
      5000,
      t.toastSentTitle,
      t.toastSource,
      null
    );
  };

  const toggleActive = (exp: PlannedExport) => {
    const label = REPORT_LABELS[exp.rapportKey];
    const actif = !exp.actif;
    setExports((prev) =>
      prev.map((e) =>
        e.id === exp.id
          ? { ...e, actif, prochainEnvoi: actif ? computeNextRun(e.frequence, e.heure) : DASH }
          : e
      )
    );
    pushActivity(actif ? ACTIVITY_ACTIONS.resumed : ACTIVITY_ACTIONS.paused, label, actif ? "success" : "warning");
    showToast(
      actif ? t.toastResumedMsg(label[locale]) : t.toastPausedMsg(label[locale]),
      actif ? "success" : "warning",
      4000,
      actif ? t.toastResumedTitle : t.toastPausedTitle,
      t.toastSource,
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    const label = REPORT_LABELS[toDelete.rapportKey];
    setExports((prev) => prev.filter((e) => e.id !== toDelete.id));
    pushActivity(ACTIVITY_ACTIONS.deleted, label, "error");
    showToast(t.toastDeletedMsg(label[locale]), "info", 4000, t.toastDeletedTitle, t.toastSource, null);
    setToDelete(null);
  };

  const handleCreate = () => {
    if (!rapport || !frequence || !heure || !format) {
      setFormError(t.errMissingFields);
      return;
    }
    const list = emails
      .split(/[,;\s]+/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (list.length === 0) {
      setFormError(t.errNoRecipient);
      return;
    }
    const invalid = list.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setFormError(t.errInvalidEmails(invalid.join(", ")));
      return;
    }
    setFormError(null);
    const key = rapport as ReportKey;
    const label = REPORT_LABELS[key];
    const freq = frequence as Frequence;
    const next = computeNextRun(freq, heure);
    setExports((prev) => [
      {
        id: `exp-${Date.now()}`,
        rapportKey: key,
        format: format as Format,
        frequence: freq,
        heure,
        destinataires: list,
        actif: true,
        dernierEnvoi: NEVER,
        prochainEnvoi: next,
        envois30j: 0,
      },
      ...prev,
    ]);
    pushActivity(
      ACTIVITY_ACTIONS.scheduled,
      {
        fr: `${label.fr} (${format}, ${FREQ_LABEL[freq].fr.toLowerCase()} à ${heure})`,
        en: `${label.en} (${format}, ${FREQ_LABEL[freq].en.toLowerCase()} at ${heure})`,
      },
      "success"
    );
    showToast(
      t.toastScheduledMsg(label[locale], FREQ_LABEL[freq][locale].toLowerCase(), heure, next[locale]),
      "success",
      6000,
      t.toastScheduledTitle,
      t.toastSource,
      null
    );
    setRapport(null);
    setEmails("");
  };

  const columns = [
    {
      key: "rapportKey",
      label: t.colReport,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>
            {REPORT_LABELS[value as ReportKey][locale]}
          </div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {(row.destinataires as string[]).join(", ")}
          </div>
        </div>
      ),
    },
    {
      key: "format",
      label: t.colFormat,
      render: (value: unknown) => <Badge variant="default">{String(value)}</Badge>,
    },
    {
      key: "frequence",
      label: t.colFrequency,
      render: (value: unknown, row: Record<string, unknown>) => (
        <span>
          {FREQ_LABEL[value as Frequence][locale]} · {String(row.heure)}
        </span>
      ),
    },
    {
      key: "prochainEnvoi",
      label: t.colNextSend,
      render: (value: unknown) => <span>{(value as L)[locale]}</span>,
    },
    {
      key: "dernierEnvoi",
      label: t.colLastSend,
      render: (value: unknown) => <span>{(value as L)[locale]}</span>,
    },
    {
      key: "actif",
      label: t.colStatus,
      render: (value: unknown) =>
        value ? <Badge variant="success">{t.badgeActive}</Badge> : <Badge variant="default">{t.badgePaused}</Badge>,
    },
    {
      key: "id",
      label: t.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const exp = row as unknown as PlannedExport;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => sendNow(exp)}>
              {t.btnSend}
            </Button>
            <Button size="small" variant="secondary" onClick={() => toggleActive(exp)}>
              {exp.actif ? t.btnPause : t.btnResume}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(exp)}>
              {t.btnDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={t.metricActive} value={String(stats.actifs)} />
        <Metric label={t.metricSends30d} value={String(stats.envois)} />
        <Metric label={t.metricUniqueRecipients} value={String(stats.uniques)} />
      </MetricRow>

      <Card variant="outlined" title={t.panelScheduled}>
        <Table columns={columns} data={exports as unknown as Record<string, unknown>[]} striped hover />
      </Card>

      <Card variant="outlined" title={t.panelNew}>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox label={t.fieldReport} options={rapportOptions} value={rapport} onChange={setRapport} placeholder={t.phChooseReport} />
          <Selectbox label={t.fieldFormat} options={FORMAT_OPTIONS} value={format} onChange={setFormat} placeholder={t.phFormat} />
          <Selectbox label={t.fieldFrequency} options={freqOptions} value={frequence} onChange={setFrequence} placeholder={t.phFrequency} />
          <Selectbox label={t.fieldTime} options={HEURE_OPTIONS} value={heure} onChange={setHeure} placeholder={t.phTime} />
        </div>
        <div className="mt-3">
          <Input
            label={t.fieldRecipients}
            placeholder="daf@acme.fr, direction@acme.fr"
            value={emails}
            onChange={setEmails}
          />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-accent-red, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleCreate}>
          {t.btnSchedule}
        </Button>
      </Card>

      <Card variant="outlined" title={t.panelRecent}>
        <ActivityFeed activities={activityItems} maxItems={6} compact />
      </Card>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={t.confirmTitle}
        message={
          toDelete
            ? t.confirmMessage(REPORT_LABELS[toDelete.rapportKey][locale], toDelete.destinataires.length)
            : ""
        }
        confirmLabel={t.confirmLabel}
        cancelLabel={t.cancelLabel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
