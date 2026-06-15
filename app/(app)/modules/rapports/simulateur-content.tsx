"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Badge, BarChart, Button, Card, ConfirmModal, LineChart, Metric, MetricRow, Selectbox, Table, useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { STR, type ModeleId, type ModuleStrings, type PeriodeId, type ServiceKey } from "./strings";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface GeneratedReport {
  id: string;
  modele: ModeleId;
  periode: PeriodeId;
  genereLe: string; // ISO
  auteur: string; // nom propre, ou sentinelle YOU_AUTHOR
}

interface ReportView {
  titre: string;
  metrics: { label: string; value: string }[];
  chart: ReactNode | null;
  columns: {
    key: string;
    label: string;
    align?: "left" | "center" | "right";
    render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  }[];
  rows: Record<string, unknown>[];
}

/* ------------------------------------------------------------------ */
/* Données seedées (100 % déterministes)                               */
/* ------------------------------------------------------------------ */

/** Sentinelle : auteur « moi », affiché « Vous »/"You" selon la locale. */
const YOU_AUTHOR = "__you__";

/** CA mensuel 2025 avec comparatif 2024 (montants en euros), indexé par mois (0 = janvier). */
const CA_MENSUEL: { ca2025: number; ca2024: number }[] = [
  { ca2025: 92400, ca2024: 86100 },
  { ca2025: 88150, ca2024: 83400 },
  { ca2025: 104300, ca2024: 97800 },
  { ca2025: 98700, ca2024: 95200 },
  { ca2025: 112450, ca2024: 103900 },
  { ca2025: 119800, ca2024: 108600 },
  { ca2025: 96200, ca2024: 92750 },
  { ca2025: 81500, ca2024: 79300 },
  { ca2025: 117300, ca2024: 110400 },
  { ca2025: 124900, ca2024: 114800 },
  { ca2025: 131600, ca2024: 121500 },
  { ca2025: 138250, ca2024: 127900 },
];

/** Commandes par région (noms propres conservés), détaillées par semestre (panier moyen en euros). */
const COMMANDES_REGION: {
  region: string;
  court: string;
  s1: { commandes: number; panier: number };
  s2: { commandes: number; panier: number };
}[] = [
  { region: "Île-de-France", court: "IDF", s1: { commandes: 1284, panier: 142.5 }, s2: { commandes: 1351, panier: 147.8 } },
  { region: "Auvergne-Rhône-Alpes", court: "ARA", s1: { commandes: 862, panier: 128.4 }, s2: { commandes: 917, panier: 131.2 } },
  { region: "Provence-Alpes-Côte d'Azur", court: "PACA", s1: { commandes: 612, panier: 133.7 }, s2: { commandes: 644, panier: 136.5 } },
  { region: "Nouvelle-Aquitaine", court: "NAQ", s1: { commandes: 541, panier: 119.6 }, s2: { commandes: 568, panier: 122.1 } },
  { region: "Occitanie", court: "OCC", s1: { commandes: 497, panier: 124.3 }, s2: { commandes: 523, panier: 126.9 } },
  { region: "Hauts-de-France", court: "HDF", s1: { commandes: 438, panier: 115.8 }, s2: { commandes: 452, panier: 118.4 } },
];

/** Effectifs par service (libellés bilingues via strings) : photo de fin de semestre + turnover semestriel (%). */
const EFFECTIFS_SERVICE: {
  service: ServiceKey;
  s1: { effectif: number; etp: number; turnover: number };
  s2: { effectif: number; etp: number; turnover: number };
}[] = [
  { service: "production", s1: { effectif: 64, etp: 61.5, turnover: 3.1 }, s2: { effectif: 66, etp: 63.0, turnover: 2.8 } },
  { service: "commercial", s1: { effectif: 28, etp: 27.0, turnover: 5.4 }, s2: { effectif: 30, etp: 29.0, turnover: 4.9 } },
  { service: "support", s1: { effectif: 19, etp: 17.5, turnover: 7.2 }, s2: { effectif: 21, etp: 19.0, turnover: 6.5 } },
  { service: "rnd", s1: { effectif: 23, etp: 22.5, turnover: 2.2 }, s2: { effectif: 24, etp: 23.5, turnover: 1.9 } },
  { service: "adminFinance", s1: { effectif: 14, etp: 13.2, turnover: 1.8 }, s2: { effectif: 14, etp: 13.2, turnover: 2.1 } },
];

/** Rapports déjà générés (timestamps figés : rendu identique serveur/client). */
const INITIAL_REPORTS: GeneratedReport[] = [
  {
    id: "rpt-2",
    modele: "ca-mensuel",
    periode: "annee-2025",
    genereLe: "2026-06-10T09:12:00",
    auteur: "Claire Morel",
  },
  {
    id: "rpt-1",
    modele: "commandes-region",
    periode: "s1-2025",
    genereLe: "2026-06-03T16:45:00",
    auteur: "Thomas Garnier",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers purs (déterministes : aucune horloge au render)             */
/* ------------------------------------------------------------------ */

function localeTag(loc: Locale): string {
  return loc === "fr" ? "fr-FR" : "en-GB";
}

function fmtInt(n: number, loc: Locale): string {
  return new Intl.NumberFormat(localeTag(loc), { maximumFractionDigits: 0 }).format(Math.round(n));
}

function fmtEuro(n: number, loc: Locale): string {
  return new Intl.NumberFormat(localeTag(loc), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtEuroDec(n: number, loc: Locale): string {
  return new Intl.NumberFormat(localeTag(loc), {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtDec(n: number, loc: Locale, decimals = 1): string {
  return new Intl.NumberFormat(localeTag(loc), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** "2026-06-10T09:12:00" → "10/06/2026 à 09:12" (fr) / "10/06/2026, 09:12" (en). */
function fmtIso(iso: string, loc: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const s = STR[loc];
  const date = d.toLocaleDateString(localeTag(loc));
  const time = d.toLocaleTimeString(localeTag(loc), { hour: "2-digit", minute: "2-digit" });
  return `${date}${s.dateTimeSep}${time}`;
}

/** Nom localisé d'un rapport : « Modèle — Période ». */
function reportName(report: Pick<GeneratedReport, "modele" | "periode">, loc: Locale): string {
  const s = STR[loc];
  return `${s.models[report.modele]} — ${s.periods[report.periode]}`;
}

/** Auteur affiché (sentinelle « moi » localisée, les noms propres restent tels quels). */
function authorLabel(auteur: string, s: ModuleStrings): string {
  return auteur === YOU_AUTHOR ? s.you : auteur;
}

function moisPourPeriode(periode: PeriodeId) {
  const indexed = CA_MENSUEL.map((m, idx) => ({ idx, ...m }));
  if (periode === "s1-2025") return indexed.slice(0, 6);
  if (periode === "s2-2025") return indexed.slice(6, 12);
  return indexed;
}

function regionsPourPeriode(periode: PeriodeId) {
  return COMMANDES_REGION.map((r) => {
    if (periode === "s1-2025") return { region: r.region, court: r.court, commandes: r.s1.commandes, panier: r.s1.panier };
    if (periode === "s2-2025") return { region: r.region, court: r.court, commandes: r.s2.commandes, panier: r.s2.panier };
    const commandes = r.s1.commandes + r.s2.commandes;
    const panier = (r.s1.commandes * r.s1.panier + r.s2.commandes * r.s2.panier) / commandes;
    return { region: r.region, court: r.court, commandes, panier };
  });
}

function servicesPourPeriode(periode: PeriodeId) {
  return EFFECTIFS_SERVICE.map((s) => {
    if (periode === "s1-2025") return { service: s.service, effectif: s.s1.effectif, etp: s.s1.etp, turnover: s.s1.turnover };
    if (periode === "s2-2025") return { service: s.service, effectif: s.s2.effectif, etp: s.s2.etp, turnover: s.s2.turnover };
    // Année : photo au 31 décembre + turnover annuel (somme des deux semestres).
    return { service: s.service, effectif: s.s2.effectif, etp: s.s2.etp, turnover: s.s1.turnover + s.s2.turnover };
  });
}

/** Construit l'aperçu complet (métriques, graphique, tableau) d'un rapport, dans la locale courante. */
function buildView(modele: ModeleId, periode: PeriodeId, loc: Locale): ReportView {
  const s = STR[loc];
  const titre = reportName({ modele, periode }, loc);

  if (modele === "ca-mensuel") {
    const mois = moisPourPeriode(periode);
    const total = mois.reduce((acc, m) => acc + m.ca2025, 0);
    const totalN1 = mois.reduce((acc, m) => acc + m.ca2024, 0);
    const meilleur = mois.reduce((best, m) => (m.ca2025 > best.ca2025 ? m : best), mois[0]);
    const variation = ((total - totalN1) / totalN1) * 100;
    return {
      titre,
      metrics: [
        { label: s.mCaTotal, value: fmtEuro(total, loc) },
        { label: s.mBestMonth, value: `${s.monthsFull[meilleur.idx]} (${fmtEuro(meilleur.ca2025, loc)})` },
        { label: s.mYoY, value: `${variation >= 0 ? "+" : ""}${fmtDec(variation, loc)} %` },
      ],
      chart: (
        <LineChart
          data={mois.map((m) => ({ x: s.monthsShort[m.idx], y: m.ca2025 }))}
          width={640}
          height={220}
          color="var(--bpm-accent-cyan, var(--bpm-accent))"
        />
      ),
      columns: [
        { key: "mois", label: s.colMonth },
        { key: "ca2025", label: s.colCa2025, align: "right", render: (v) => fmtEuro(v as number, loc) },
        { key: "ca2024", label: s.colCa2024, align: "right", render: (v) => fmtEuro(v as number, loc) },
        {
          key: "variation",
          label: s.colYoY,
          align: "right",
          render: (v) => {
            const n = v as number;
            return (
              <Badge variant={n >= 0 ? "success" : "error"}>
                {n >= 0 ? "+" : ""}
                {fmtDec(n, loc)} %
              </Badge>
            );
          },
        },
      ],
      rows: mois.map((m) => ({
        mois: s.monthsFull[m.idx],
        ca2025: m.ca2025,
        ca2024: m.ca2024,
        variation: ((m.ca2025 - m.ca2024) / m.ca2024) * 100,
      })),
    };
  }

  if (modele === "commandes-region") {
    const regions = regionsPourPeriode(periode);
    const totalCmd = regions.reduce((acc, r) => acc + r.commandes, 0);
    const panierGlobal = regions.reduce((acc, r) => acc + r.commandes * r.panier, 0) / totalCmd;
    const top = regions.reduce((best, r) => (r.commandes > best.commandes ? r : best), regions[0]);
    return {
      titre,
      metrics: [
        { label: s.mTotalOrders, value: fmtInt(totalCmd, loc) },
        { label: s.mAvgBasket, value: fmtEuroDec(panierGlobal, loc) },
        { label: s.mTopRegion, value: `${top.court} (${fmtInt(top.commandes, loc)} ${s.ordersAbbr})` },
      ],
      chart: (
        <BarChart
          data={regions.map((r) => ({ x: r.court, y: r.commandes }))}
          width={640}
          height={220}
          color="var(--bpm-accent-cyan, var(--bpm-accent))"
        />
      ),
      columns: [
        { key: "region", label: s.colRegion },
        { key: "commandes", label: s.colOrders, align: "right", render: (v) => fmtInt(v as number, loc) },
        { key: "panier", label: s.colBasket, align: "right", render: (v) => fmtEuroDec(v as number, loc) },
        { key: "caEstime", label: s.colEstimatedCa, align: "right", render: (v) => fmtEuro(v as number, loc) },
      ],
      rows: regions.map((r) => ({
        region: r.region,
        commandes: r.commandes,
        panier: r.panier,
        caEstime: r.commandes * r.panier,
      })),
    };
  }

  // effectifs-service
  const services = servicesPourPeriode(periode);
  const effectifTotal = services.reduce((acc, x) => acc + x.effectif, 0);
  const etpTotal = services.reduce((acc, x) => acc + x.etp, 0);
  const turnoverMoyen = services.reduce((acc, x) => acc + x.turnover * x.effectif, 0) / effectifTotal;
  return {
    titre,
    metrics: [
      { label: s.mHeadcount, value: `${fmtInt(effectifTotal, loc)} ${s.peopleUnit}` },
      { label: s.mFte, value: fmtDec(etpTotal, loc, 1) },
      { label: s.mAvgTurnover, value: `${fmtDec(turnoverMoyen, loc)} %` },
    ],
    chart: null,
    columns: [
      { key: "service", label: s.colService },
      { key: "effectif", label: s.colWorkforce, align: "right", render: (v) => fmtInt(v as number, loc) },
      { key: "etp", label: s.colFte, align: "right", render: (v) => fmtDec(v as number, loc, 1) },
      {
        key: "turnover",
        label: s.colTurnover,
        align: "right",
        render: (v) => {
          const n = v as number;
          return <Badge variant={n > 6 ? "warning" : "success"}>{fmtDec(n, loc)} %</Badge>;
        },
      },
    ],
    rows: services.map((x) => ({ ...x, service: s.services[x.service] })),
  };
}

/** Décimales CSV : virgule en français (Excel FR), point en anglais. */
function csvDec(n: number, decimals: number, loc: Locale): string {
  const fixed = n.toFixed(decimals);
  return loc === "fr" ? fixed.replace(".", ",") : fixed;
}

/** Construit le contenu CSV (séparateur « ; ») avec entêtes et libellés traduits à l'export. */
function buildCsv(modele: ModeleId, periode: PeriodeId, loc: Locale): string {
  const s = STR[loc];
  const lines: string[] = [];
  if (modele === "ca-mensuel") {
    lines.push(s.csvHeaderCa);
    for (const m of moisPourPeriode(periode)) {
      const variation = ((m.ca2025 - m.ca2024) / m.ca2024) * 100;
      lines.push(`${s.monthsFull[m.idx]};${m.ca2025};${m.ca2024};${csvDec(variation, 1, loc)}`);
    }
  } else if (modele === "commandes-region") {
    lines.push(s.csvHeaderRegion);
    for (const r of regionsPourPeriode(periode)) {
      lines.push(`${r.region};${r.commandes};${csvDec(r.panier, 2, loc)};${Math.round(r.commandes * r.panier)}`);
    }
  } else {
    lines.push(s.csvHeaderService);
    for (const x of servicesPourPeriode(periode)) {
      lines.push(
        `${s.services[x.service]};${x.effectif};${csvDec(x.etp, 1, loc)};${csvDec(x.turnover, 1, loc)}`
      );
    }
  }
  return lines.join("\r\n");
}

/* ------------------------------------------------------------------ */
/* Composant                                                           */
/* ------------------------------------------------------------------ */

export default function RapportsSimulateur() {
  const { showToast } = useToast();
  const { locale } = useI18n();
  const s = STR[locale];

  const [reports, setReports] = useState<GeneratedReport[]>(INITIAL_REPORTS);
  const [toDelete, setToDelete] = useState<GeneratedReport | null>(null);

  const [modele, setModele] = useState<string | null>(null);
  const [periode, setPeriode] = useState<string | null>("annee-2025");
  const [formError, setFormError] = useState(false);

  /** Rapport actuellement affiché dans la zone d'aperçu. */
  const [apercu, setApercu] = useState<GeneratedReport | null>(INITIAL_REPORTS[0]);

  const view = useMemo(
    () => (apercu ? buildView(apercu.modele, apercu.periode, locale) : null),
    [apercu, locale]
  );

  const modeleOptions = useMemo(
    () =>
      (Object.keys(s.models) as ModeleId[]).map((id) => ({
        value: id,
        label: s.models[id],
      })),
    [s]
  );

  const periodeOptions = useMemo(
    () =>
      (["annee-2025", "s1-2025", "s2-2025"] as PeriodeId[]).map((id) => ({
        value: id,
        label: s.periodOptions[id],
      })),
    [s]
  );

  const derniereGeneration = reports.length > 0 ? fmtIso(reports[0].genereLe, locale) : "—";

  const handleGenerate = () => {
    if (!modele || !periode) {
      setFormError(true);
      return;
    }
    setFormError(false);
    const m = modele as ModeleId;
    const p = periode as PeriodeId;
    const now = new Date(); // autorisé : handler d'événement uniquement
    const report: GeneratedReport = {
      id: `rpt-${now.getTime()}`,
      modele: m,
      periode: p,
      genereLe: now.toISOString(),
      auteur: YOU_AUTHOR,
    };
    setReports((prev) => [report, ...prev]);
    setApercu(report);
    showToast(
      s.toastGenerated(reportName(report, locale)),
      "success",
      5000,
      s.toastGeneratedTitle,
      s.toastSource,
      null
    );
  };

  const handleDownload = (report: GeneratedReport) => {
    const csv = buildCsv(report.modele, report.periode, locale);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const fileName = `rapport-${report.modele}-${report.periode}.csv`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(s.toastExport(fileName), "info", 4000, s.toastExportTitle, s.toastSource, null);
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setReports((prev) => prev.filter((r) => r.id !== toDelete.id));
    if (apercu && apercu.id === toDelete.id) setApercu(null);
    showToast(
      s.toastDeleted(reportName(toDelete, locale)),
      "info",
      4000,
      s.toastDeletedTitle,
      s.toastSource,
      null
    );
    setToDelete(null);
  };

  const reportColumns = [
    {
      key: "nom",
      label: s.colReport,
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.byAuthor(authorLabel(String(row.auteur), s))}
          </div>
        </div>
      ),
    },
    {
      key: "modele",
      label: s.colTemplate,
      render: (value: unknown) => <Badge variant="default">{s.models[value as ModeleId]}</Badge>,
    },
    {
      key: "periode",
      label: s.colPeriod,
      render: (value: unknown) => s.periods[value as PeriodeId],
    },
    {
      key: "genereLe",
      label: s.colGeneratedOn,
      render: (value: unknown) => fmtIso(String(value), locale),
    },
    {
      key: "id",
      label: s.colActions,
      render: (_: unknown, row: Record<string, unknown>) => {
        const report = row as unknown as GeneratedReport;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => setApercu(report)}>
              {s.buttonShow}
            </Button>
            <Button size="small" variant="secondary" onClick={() => handleDownload(report)}>
              {s.buttonDownloadCsv}
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(report)}>
              {s.buttonDelete}
            </Button>
          </div>
        );
      },
    },
  ];

  /** Lignes de l'historique avec nom localisé (recalculé à chaque changement de locale). */
  const reportRows = useMemo(
    () => reports.map((r) => ({ ...r, nom: reportName(r, locale) })),
    [reports, locale]
  );

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricGenerated30d} value={String(reports.length)} />
        <Metric label={s.metricTemplates} value={String(modeleOptions.length)} />
        <Metric label={s.metricLastGenerated} value={derniereGeneration} />
      </MetricRow>

      <Card variant="outlined" title={s.panelGenerate}>
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label={s.labelTemplate}
            options={modeleOptions}
            value={modele}
            onChange={setModele}
            placeholder={s.placeholderTemplate}
          />
          <Selectbox
            label={s.labelPeriod}
            options={periodeOptions}
            value={periode}
            onChange={setPeriode}
            placeholder={s.placeholderPeriod}
          />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {s.formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleGenerate}>
          {s.buttonGenerate}
        </Button>
      </Card>

      {view && apercu && (
        <Card variant="outlined" title={`${s.previewTitle} — ${view.titre}`}>
          <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.previewMeta(
              fmtIso(apercu.genereLe, locale),
              authorLabel(apercu.auteur, s),
              s.periods[apercu.periode]
            )}
          </p>
          <MetricRow>
            {view.metrics.map((m) => (
              <Metric key={m.label} label={m.label} value={m.value} />
            ))}
          </MetricRow>
          {view.chart && <div className="my-4">{view.chart}</div>}
          <Table columns={view.columns} data={view.rows} striped hover />
        </Card>
      )}

      <Card variant="outlined" title={s.panelHistory}>
        {reports.length > 0 ? (
          <Table columns={reportColumns} data={reportRows as unknown as Record<string, unknown>[]} striped hover />
        ) : (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.emptyHistory}
          </p>
        )}
      </Card>

      <ConfirmModal
        isOpen={toDelete !== null}
        title={s.confirmTitle}
        message={
          toDelete ? s.confirmMessage(reportName(toDelete, locale), fmtIso(toDelete.genereLe, locale)) : ""
        }
        confirmLabel={s.confirmLabel}
        cancelLabel={s.cancelLabel}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
