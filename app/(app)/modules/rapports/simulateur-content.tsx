"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  BarChart,
  Button,
  ConfirmModal,
  LineChart,
  Metric,
  MetricRow,
  Panel,
  Selectbox,
  Table,
  useToast,
} from "@/components/bpm";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ModeleId = "ca-mensuel" | "commandes-region" | "effectifs-service";
type PeriodeId = "annee-2025" | "s1-2025" | "s2-2025";

interface GeneratedReport {
  id: string;
  nom: string;
  modele: ModeleId;
  periode: PeriodeId;
  genereLe: string; // ISO
  auteur: string;
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

const MODELE_LABEL: Record<ModeleId, string> = {
  "ca-mensuel": "Chiffre d'affaires mensuel",
  "commandes-region": "Commandes par région",
  "effectifs-service": "Effectifs par service",
};

const PERIODE_LABEL: Record<PeriodeId, string> = {
  "annee-2025": "Année 2025",
  "s1-2025": "S1 2025",
  "s2-2025": "S2 2025",
};

const MODELE_OPTIONS = (Object.keys(MODELE_LABEL) as ModeleId[]).map((id) => ({
  value: id,
  label: MODELE_LABEL[id],
}));

const PERIODE_OPTIONS: { value: PeriodeId; label: string }[] = [
  { value: "annee-2025", label: "Année 2025" },
  { value: "s1-2025", label: "S1 2025 (janvier–juin)" },
  { value: "s2-2025", label: "S2 2025 (juillet–décembre)" },
];

/** CA mensuel 2025 avec comparatif 2024 (montants en euros). */
const CA_MENSUEL: { mois: string; court: string; ca2025: number; ca2024: number }[] = [
  { mois: "Janvier", court: "Jan", ca2025: 92400, ca2024: 86100 },
  { mois: "Février", court: "Fév", ca2025: 88150, ca2024: 83400 },
  { mois: "Mars", court: "Mar", ca2025: 104300, ca2024: 97800 },
  { mois: "Avril", court: "Avr", ca2025: 98700, ca2024: 95200 },
  { mois: "Mai", court: "Mai", ca2025: 112450, ca2024: 103900 },
  { mois: "Juin", court: "Juin", ca2025: 119800, ca2024: 108600 },
  { mois: "Juillet", court: "Juil", ca2025: 96200, ca2024: 92750 },
  { mois: "Août", court: "Août", ca2025: 81500, ca2024: 79300 },
  { mois: "Septembre", court: "Sep", ca2025: 117300, ca2024: 110400 },
  { mois: "Octobre", court: "Oct", ca2025: 124900, ca2024: 114800 },
  { mois: "Novembre", court: "Nov", ca2025: 131600, ca2024: 121500 },
  { mois: "Décembre", court: "Déc", ca2025: 138250, ca2024: 127900 },
];

/** Commandes par région, détaillées par semestre (panier moyen en euros). */
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

/** Effectifs par service : photo de fin de semestre + turnover semestriel (%). */
const EFFECTIFS_SERVICE: {
  service: string;
  s1: { effectif: number; etp: number; turnover: number };
  s2: { effectif: number; etp: number; turnover: number };
}[] = [
  { service: "Production", s1: { effectif: 64, etp: 61.5, turnover: 3.1 }, s2: { effectif: 66, etp: 63.0, turnover: 2.8 } },
  { service: "Commercial", s1: { effectif: 28, etp: 27.0, turnover: 5.4 }, s2: { effectif: 30, etp: 29.0, turnover: 4.9 } },
  { service: "Support client", s1: { effectif: 19, etp: 17.5, turnover: 7.2 }, s2: { effectif: 21, etp: 19.0, turnover: 6.5 } },
  { service: "Recherche & développement", s1: { effectif: 23, etp: 22.5, turnover: 2.2 }, s2: { effectif: 24, etp: 23.5, turnover: 1.9 } },
  { service: "Administration & finance", s1: { effectif: 14, etp: 13.2, turnover: 1.8 }, s2: { effectif: 14, etp: 13.2, turnover: 2.1 } },
];

/** Rapports déjà générés (timestamps figés : rendu identique serveur/client). */
const INITIAL_REPORTS: GeneratedReport[] = [
  {
    id: "rpt-2",
    nom: "Chiffre d'affaires mensuel — Année 2025",
    modele: "ca-mensuel",
    periode: "annee-2025",
    genereLe: "2026-06-10T09:12:00",
    auteur: "Claire Morel",
  },
  {
    id: "rpt-1",
    nom: "Commandes par région — S1 2025",
    modele: "commandes-region",
    periode: "s1-2025",
    genereLe: "2026-06-03T16:45:00",
    auteur: "Thomas Garnier",
  },
];

/* ------------------------------------------------------------------ */
/* Helpers purs (déterministes : aucune horloge au render)             */
/* ------------------------------------------------------------------ */

function fmtInt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmtEuro(n: number): string {
  return `${fmtInt(n)} €`;
}

function fmtDec(n: number, decimals = 1): string {
  return n.toFixed(decimals).replace(".", ",");
}

/** "2026-06-10T09:12:00" → "10/06/2026 à 09:12" (parsing pur, sans Date). */
function fmtIso(iso: string): string {
  const [date, time] = iso.split("T");
  if (!date || !time) return iso;
  const [y, m, d] = date.split("-");
  return `${d}/${m}/${y} à ${time.slice(0, 5)}`;
}

function moisPourPeriode(periode: PeriodeId) {
  if (periode === "s1-2025") return CA_MENSUEL.slice(0, 6);
  if (periode === "s2-2025") return CA_MENSUEL.slice(6, 12);
  return CA_MENSUEL;
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

/** Construit l'aperçu complet (métriques, graphique, tableau) d'un rapport. */
function buildView(modele: ModeleId, periode: PeriodeId): ReportView {
  const titre = `${MODELE_LABEL[modele]} — ${PERIODE_LABEL[periode]}`;

  if (modele === "ca-mensuel") {
    const mois = moisPourPeriode(periode);
    const total = mois.reduce((s, m) => s + m.ca2025, 0);
    const totalN1 = mois.reduce((s, m) => s + m.ca2024, 0);
    const meilleur = mois.reduce((best, m) => (m.ca2025 > best.ca2025 ? m : best), mois[0]);
    const variation = ((total - totalN1) / totalN1) * 100;
    return {
      titre,
      metrics: [
        { label: "CA total de la période", value: fmtEuro(total) },
        { label: "Meilleur mois", value: `${meilleur.mois} (${fmtEuro(meilleur.ca2025)})` },
        { label: "Variation vs 2024", value: `${variation >= 0 ? "+" : ""}${fmtDec(variation)} %` },
      ],
      chart: (
        <LineChart
          data={mois.map((m) => ({ x: m.court, y: m.ca2025 }))}
          width={640}
          height={220}
          color="var(--bpm-accent-cyan, var(--bpm-accent))"
        />
      ),
      columns: [
        { key: "mois", label: "Mois" },
        { key: "ca2025", label: "CA 2025", align: "right", render: (v) => fmtEuro(v as number) },
        { key: "ca2024", label: "CA 2024", align: "right", render: (v) => fmtEuro(v as number) },
        {
          key: "variation",
          label: "Variation N-1",
          align: "right",
          render: (v) => {
            const n = v as number;
            return (
              <Badge variant={n >= 0 ? "success" : "error"}>
                {n >= 0 ? "+" : ""}
                {fmtDec(n)} %
              </Badge>
            );
          },
        },
      ],
      rows: mois.map((m) => ({
        mois: m.mois,
        ca2025: m.ca2025,
        ca2024: m.ca2024,
        variation: ((m.ca2025 - m.ca2024) / m.ca2024) * 100,
      })),
    };
  }

  if (modele === "commandes-region") {
    const regions = regionsPourPeriode(periode);
    const totalCmd = regions.reduce((s, r) => s + r.commandes, 0);
    const panierGlobal = regions.reduce((s, r) => s + r.commandes * r.panier, 0) / totalCmd;
    const top = regions.reduce((best, r) => (r.commandes > best.commandes ? r : best), regions[0]);
    return {
      titre,
      metrics: [
        { label: "Commandes totales", value: fmtInt(totalCmd) },
        { label: "Panier moyen global", value: `${fmtDec(panierGlobal, 2)} €` },
        { label: "Région la plus active", value: `${top.court} (${fmtInt(top.commandes)} cmd)` },
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
        { key: "region", label: "Région" },
        { key: "commandes", label: "Commandes", align: "right", render: (v) => fmtInt(v as number) },
        { key: "panier", label: "Panier moyen", align: "right", render: (v) => `${fmtDec(v as number, 2)} €` },
        { key: "caEstime", label: "CA estimé", align: "right", render: (v) => fmtEuro(v as number) },
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
  const effectifTotal = services.reduce((s, x) => s + x.effectif, 0);
  const etpTotal = services.reduce((s, x) => s + x.etp, 0);
  const turnoverMoyen = services.reduce((s, x) => s + x.turnover * x.effectif, 0) / effectifTotal;
  return {
    titre,
    metrics: [
      { label: "Effectif total", value: `${fmtInt(effectifTotal)} pers.` },
      { label: "ETP total", value: fmtDec(etpTotal, 1) },
      { label: "Turnover moyen", value: `${fmtDec(turnoverMoyen)} %` },
    ],
    chart: null,
    columns: [
      { key: "service", label: "Service" },
      { key: "effectif", label: "Effectif", align: "right", render: (v) => fmtInt(v as number) },
      { key: "etp", label: "ETP", align: "right", render: (v) => fmtDec(v as number, 1) },
      {
        key: "turnover",
        label: "Turnover",
        align: "right",
        render: (v) => {
          const n = v as number;
          return <Badge variant={n > 6 ? "warning" : "success"}>{fmtDec(n)} %</Badge>;
        },
      },
    ],
    rows: services.map((s) => ({ ...s })),
  };
}

/** Construit le contenu CSV (séparateur « ; », compatible Excel FR). */
function buildCsv(modele: ModeleId, periode: PeriodeId): string {
  const lines: string[] = [];
  if (modele === "ca-mensuel") {
    lines.push("Mois;CA 2025 (EUR);CA 2024 (EUR);Variation N-1 (%)");
    for (const m of moisPourPeriode(periode)) {
      const variation = ((m.ca2025 - m.ca2024) / m.ca2024) * 100;
      lines.push(`${m.mois};${m.ca2025};${m.ca2024};${variation.toFixed(1).replace(".", ",")}`);
    }
  } else if (modele === "commandes-region") {
    lines.push("Région;Commandes;Panier moyen (EUR);CA estimé (EUR)");
    for (const r of regionsPourPeriode(periode)) {
      lines.push(
        `${r.region};${r.commandes};${r.panier.toFixed(2).replace(".", ",")};${Math.round(r.commandes * r.panier)}`
      );
    }
  } else {
    lines.push("Service;Effectif;ETP;Turnover (%)");
    for (const s of servicesPourPeriode(periode)) {
      lines.push(
        `${s.service};${s.effectif};${s.etp.toFixed(1).replace(".", ",")};${s.turnover.toFixed(1).replace(".", ",")}`
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

  const [reports, setReports] = useState<GeneratedReport[]>(INITIAL_REPORTS);
  const [toDelete, setToDelete] = useState<GeneratedReport | null>(null);

  const [modele, setModele] = useState<string | null>(null);
  const [periode, setPeriode] = useState<string | null>("annee-2025");
  const [formError, setFormError] = useState<string | null>(null);

  /** Rapport actuellement affiché dans la zone d'aperçu. */
  const [apercu, setApercu] = useState<GeneratedReport | null>(INITIAL_REPORTS[0]);

  const view = useMemo(() => (apercu ? buildView(apercu.modele, apercu.periode) : null), [apercu]);

  const derniereGeneration = reports.length > 0 ? fmtIso(reports[0].genereLe) : "—";

  const handleGenerate = () => {
    if (!modele || !periode) {
      setFormError("Choisissez un modèle de rapport et une période.");
      return;
    }
    setFormError(null);
    const m = modele as ModeleId;
    const p = periode as PeriodeId;
    const now = new Date(); // autorisé : handler d'événement uniquement
    const report: GeneratedReport = {
      id: `rpt-${now.getTime()}`,
      nom: `${MODELE_LABEL[m]} — ${PERIODE_LABEL[p]}`,
      modele: m,
      periode: p,
      genereLe: now.toISOString(),
      auteur: "Vous",
    };
    setReports((prev) => [report, ...prev]);
    setApercu(report);
    showToast(
      `« ${report.nom} » généré : aperçu mis à jour, export CSV disponible dans la liste.`,
      "success",
      5000,
      "Rapport généré",
      "Rapports",
      null
    );
  };

  const handleDownload = (report: GeneratedReport) => {
    const csv = buildCsv(report.modele, report.periode);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${report.modele}-${report.periode}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast(
      `Fichier « rapport-${report.modele}-${report.periode}.csv » téléchargé.`,
      "info",
      4000,
      "Export CSV",
      "Rapports",
      null
    );
  };

  const confirmDelete = () => {
    if (!toDelete) return;
    setReports((prev) => prev.filter((r) => r.id !== toDelete.id));
    if (apercu && apercu.id === toDelete.id) setApercu(null);
    showToast(`Rapport « ${toDelete.nom} » supprimé.`, "info", 4000, "Rapport supprimé", "Rapports", null);
    setToDelete(null);
  };

  const reportColumns = [
    {
      key: "nom",
      label: "Rapport",
      render: (value: unknown, row: Record<string, unknown>) => (
        <div>
          <div style={{ color: "var(--bpm-text-primary)", fontWeight: 500 }}>{String(value)}</div>
          <div className="text-xs" style={{ color: "var(--bpm-text-secondary)" }}>
            par {String(row.auteur)}
          </div>
        </div>
      ),
    },
    {
      key: "modele",
      label: "Modèle",
      render: (value: unknown) => <Badge variant="default">{MODELE_LABEL[value as ModeleId]}</Badge>,
    },
    {
      key: "periode",
      label: "Période",
      render: (value: unknown) => PERIODE_LABEL[value as PeriodeId],
    },
    {
      key: "genereLe",
      label: "Généré le",
      render: (value: unknown) => fmtIso(String(value)),
    },
    {
      key: "id",
      label: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const report = row as unknown as GeneratedReport;
        return (
          <div className="flex flex-wrap gap-2">
            <Button size="small" variant="secondary" onClick={() => setApercu(report)}>
              Afficher
            </Button>
            <Button size="small" variant="secondary" onClick={() => handleDownload(report)}>
              Télécharger CSV
            </Button>
            <Button size="small" variant="destructive" onClick={() => setToDelete(report)}>
              Supprimer
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Rapports générés (30 j)" value={String(reports.length)} />
        <Metric label="Modèles disponibles" value={String(MODELE_OPTIONS.length)} />
        <Metric label="Dernière génération" value={derniereGeneration} />
      </MetricRow>

      <Panel variant="info" title="Générer un rapport">
        <div className="grid gap-3 md:grid-cols-2">
          <Selectbox
            label="Modèle de rapport"
            options={MODELE_OPTIONS}
            value={modele}
            onChange={setModele}
            placeholder="Choisir un modèle"
          />
          <Selectbox
            label="Période"
            options={PERIODE_OPTIONS}
            value={periode}
            onChange={setPeriode}
            placeholder="Choisir une période"
          />
        </div>
        {formError && (
          <p className="mt-2 text-sm" style={{ color: "var(--bpm-error, #dc2626)" }}>
            {formError}
          </p>
        )}
        <Button className="mt-4" onClick={handleGenerate}>
          Générer
        </Button>
      </Panel>

      {view && apercu && (
        <Panel variant="info" title={`Aperçu — ${view.titre}`}>
          <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Généré le {fmtIso(apercu.genereLe)} par {apercu.auteur} · période : {PERIODE_LABEL[apercu.periode]}
          </p>
          <MetricRow>
            {view.metrics.map((m) => (
              <Metric key={m.label} label={m.label} value={m.value} />
            ))}
          </MetricRow>
          {view.chart && <div className="my-4">{view.chart}</div>}
          <Table columns={view.columns} data={view.rows} striped hover />
        </Panel>
      )}

      <Panel variant="info" title="Rapports générés">
        {reports.length > 0 ? (
          <Table columns={reportColumns} data={reports as unknown as Record<string, unknown>[]} striped hover />
        ) : (
          <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
            Aucun rapport pour l&apos;instant : choisissez un modèle et une période ci-dessus, puis cliquez
            sur « Générer ».
          </p>
        )}
      </Panel>

      <ConfirmModal
        isOpen={toDelete !== null}
        title="Supprimer le rapport"
        message={
          toDelete
            ? `« ${toDelete.nom} » (généré le ${fmtIso(toDelete.genereLe)}) sera retiré de la liste. Cette action est immédiate.`
            : ""
        }
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
