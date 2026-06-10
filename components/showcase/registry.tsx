"use client";

/**
 * Registre des exemples d'élévation — pilote la section « Élévation » de /components.
 *
 * Chaque composant bpm.* traité par le run d'élévation enregistre ici :
 *  - un exemple par défaut (rendu inchangé, preuve de non-régression visuelle),
 *  - un exemple déviant (context fourni → le jugement est révélé),
 *  - un exemple trajectoire (v(t) → niveau + tendance), pour les instruments.
 *
 * La page /components itère sur ce registre : pas de page à la main par composant.
 */
import React from "react";
import { AnomalyAlert, AreaChart, BarChart, HighlightBox, LabelValue, LineChart, LiveChart, LiveGauge, MachineStatus, Metric, Progress, ProgressRing, Rating, ScatterChart, Sparkline, StatusBox } from "@/components/bpm";

/** Série temps réel de démonstration (fenêtre de 2 min, dérive sous le repère). */
function liveDemoData(drift: number[]): { timestamp: number; value: number }[] {
  const now = Date.now();
  return drift.map((v, i) => ({ timestamp: now - (drift.length - 1 - i) * 10000, value: v }));
}

/** Trajectoire de démonstration : dégradation régulière sur 6 périodes. */
const TRAJ_DOWN = [
  { t: 1, v: 118 },
  { t: 2, v: 112 },
  { t: 3, v: 105 },
  { t: 4, v: 97 },
  { t: 5, v: 88 },
  { t: 6, v: 81 },
];

export type ShowcaseClass = "INSTRUMENT" | "DATA" | "STRUCTURAL" | "INTERACTIF";

export interface ShowcaseExample {
  /** Nom court : "défaut" | "déviant" | "trajectoire" | libre. */
  name: string;
  /** Ce que l'exemple démontre. */
  note?: string;
  render: () => React.ReactNode;
}

export interface ShowcaseEntry {
  /** Clé bpm.* (ex. "metric"). */
  key: string;
  class: ShowcaseClass;
  examples: ShowcaseExample[];
}

export const SHOWCASE: ShowcaseEntry[] = [
  // Les entrées sont ajoutées composant par composant pendant la phase 2.
  {
    key: "metric",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "appel historique, rendu inchangé",
        render: () => <Metric label="Chiffre d'affaires" value={125000} delta="+12%" />,
      },
      {
        name: "déviant",
        note: "context { reference: 150000, higher_is_better } → écart défavorable révélé",
        render: () => (
          <Metric
            label="Chiffre d'affaires"
            value={125000}
            context={{ reference: 150000, direction: "higher_is_better" }}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "value = v(t) → dernier point + tendance ↘ + sparkline",
        render: () => (
          <Metric
            label="Taux de service (%)"
            value={TRAJ_DOWN}
            currency=""
            context={{ reference: 100, direction: "higher_is_better", comparisonFrame: [98, 101, 99, 100, 102] }}
          />
        ),
      },
    ],
  },
  {
    key: "progressRing",
    class: "INSTRUMENT",
    examples: [
      { name: "défaut", note: "rendu historique inchangé", render: () => <ProgressRing value={75} /> },
      {
        name: "déviant",
        note: "context { reference: 90, higher_is_better } → anneau rouge (écart défavorable)",
        render: () => <ProgressRing value={55} context={{ reference: 90, direction: "higher_is_better" }} />,
      },
      {
        name: "trajectoire",
        note: "v(t) descendante → flèche de tendance ↘ au centre",
        render: () => (
          <ProgressRing
            value={[
              { t: 1, v: 92 },
              { t: 2, v: 80 },
              { t: 3, v: 64 },
            ]}
            context={{ reference: 90, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "progress",
    class: "INSTRUMENT",
    examples: [
      { name: "défaut", note: "rendu historique inchangé", render: () => <Progress value={0.74} label="TRS" /> },
      {
        name: "déviant",
        note: "context { reference: 0.8, higher_is_better } → barre rouge + écart révélé",
        render: () => (
          <Progress value={0.62} label="TRS" context={{ reference: 0.8, direction: "higher_is_better" }} />
        ),
      },
      {
        name: "trajectoire",
        note: "v(t) en amélioration → barre verte, tendance ↗",
        render: () => (
          <Progress
            value={[
              { t: 1, v: 0.55 },
              { t: 2, v: 0.71 },
              { t: 3, v: 0.86 },
            ]}
            label="TRS"
            context={{ reference: 0.8, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "liveGauge",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé (zones seuil)",
        render: () => <LiveGauge value={62} warningAbove={70} criticalAbove={90} label="CPU %" />,
      },
      {
        name: "déviant",
        note: "context { reference: 60, lower_is_better } → valeur jugée défavorable",
        render: () => (
          <LiveGauge value={85} label="Latence (ms)" context={{ reference: 60, direction: "lower_is_better" }} />
        ),
      },
      {
        name: "trajectoire",
        note: "v(t) montante & lower_is_better → tendance ↘ (worsening) révélée",
        render: () => (
          <LiveGauge
            value={[
              { t: 1, v: 40 },
              { t: 2, v: 55 },
              { t: 3, v: 72 },
            ]}
            label="Latence (ms)"
            context={{ reference: 60, direction: "lower_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "sparkline",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé (couleur pilotée par trend)",
        render: () => <Sparkline values={[10, 15, 12, 18, 22]} trend="up" />,
      },
      {
        name: "déviant",
        note: "context → couleur jugée + ligne de repère pointillée",
        render: () => (
          <Sparkline
            values={[105, 102, 98, 92, 85]}
            context={{ reference: 100, direction: "higher_is_better" }}
            width={160}
            height={48}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "points v(t) explicites (t non régulier) → tendance jugée",
        render: () => (
          <Sparkline
            values={[]}
            points={[
              { t: 0, v: 40 },
              { t: 10, v: 44 },
              { t: 40, v: 58 },
              { t: 60, v: 66 },
            ]}
            context={{ reference: 50, direction: "higher_is_better" }}
            width={160}
            height={48}
          />
        ),
      },
    ],
  },
  {
    key: "statusBox",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => <StatusBox label="Synchronisation CRM" state="complete" />,
      },
      {
        name: "déviant",
        note: "value + context → verdict écart révélé, bordure jugée",
        render: () => (
          <StatusBox
            label="File d'attente"
            state="running"
            value={340}
            context={{ reference: 200, direction: "lower_is_better" }}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "v(t) en baisse & lower_is_better → tendance ↗ (improving)",
        render: () => (
          <StatusBox
            label="File d'attente"
            state="running"
            value={[
              { t: 1, v: 410 },
              { t: 2, v: 300 },
              { t: 3, v: 180 },
            ]}
            context={{ reference: 200, direction: "lower_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "highlightBox",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => <HighlightBox value={1} label="DAILY" title="Objectif quotidien" rtbPoints={["Point 1", "Point 2"]} />,
      },
      {
        name: "déviant",
        note: "measure + context → barre colorée par le verdict + ligne d'écart",
        render: () => (
          <HighlightBox
            value={2}
            label="KPI"
            title="Taux de conversion"
            measure={3.1}
            context={{ reference: 4.5, direction: "higher_is_better" }}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "measure = v(t) → tendance jugée dans la ligne de verdict",
        render: () => (
          <HighlightBox
            value={3}
            label="KPI"
            title="Taux de conversion"
            measure={[
              { t: 1, v: 4.8 },
              { t: 2, v: 4.2 },
              { t: 3, v: 3.1 },
            ]}
            context={{ reference: 4.5, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "labelValue",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => <LabelValue label="Référence" value="REF-001" copyable />,
      },
      {
        name: "déviant",
        note: "valeur numérique + context → couleur jugée + suffixe ▼",
        render: () => (
          <LabelValue label="Stock" value={12} context={{ reference: 50, direction: "higher_is_better" }} />
        ),
      },
      {
        name: "trajectoire",
        note: "trajectory v(t) → tendance jugée en suffixe",
        render: () => (
          <LabelValue
            label="Stock"
            value={12}
            trajectory={[
              { t: 1, v: 44 },
              { t: 2, v: 28 },
              { t: 3, v: 12 },
            ]}
            context={{ reference: 50, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "anomalyAlert",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé (severity manuelle)",
        render: () => <AnomalyAlert expected="100 kg" actual="85 kg" severity="warning" />,
      },
      {
        name: "déviant",
        note: "context → gravité auto-dérivée de interpret().severity + verdict",
        render: () => (
          <AnomalyAlert
            expected={100}
            actual={55}
            context={{ reference: 100, direction: "higher_is_better", comparisonFrame: [97, 99, 102, 101, 98] }}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "history v(t) → tendance dans le verdict",
        render: () => (
          <AnomalyAlert
            expected={100}
            actual={55}
            history={[
              { t: 1, v: 96 },
              { t: 2, v: 80 },
              { t: 3, v: 55 },
            ]}
            context={{ reference: 100, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "machineStatus",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé (LED animée)",
        render: () => <MachineStatus title="Machine A" state="running" detail="Lot #1234" />,
      },
      {
        name: "déviant",
        note: "value (cadence) + context → verdict + bordure jugée",
        render: () => (
          <MachineStatus
            title="Machine A"
            state="running"
            value={42}
            context={{ reference: 60, direction: "higher_is_better" }}
          />
        ),
      },
      {
        name: "trajectoire",
        note: "v(t) en chute → tendance ↘ révélée alors que la LED est verte",
        render: () => (
          <MachineStatus
            title="Machine A"
            state="running"
            value={[
              { t: 1, v: 64 },
              { t: 2, v: 55 },
              { t: 3, v: 42 },
            ]}
            context={{ reference: 60, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "lineChart",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => (
          <LineChart data={[{ x: 0, y: 10 }, { x: 1, y: 25 }, { x: 2, y: 18 }, { x: 3, y: 30 }]} width={320} height={120} />
        ),
      },
      {
        name: "déviant + trajectoire",
        note: "context → repère pointillé, série jugée (sous le repère et en baisse → rouge)",
        render: () => (
          <LineChart
            data={[{ x: 0, y: 95 }, { x: 1, y: 88 }, { x: 2, y: 80 }, { x: 3, y: 71 }]}
            width={320}
            height={120}
            context={{ reference: 100, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "areaChart",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => (
          <AreaChart data={[{ x: 1, y: 10 }, { x: 2, y: 25 }, { x: 3, y: 18 }]} width={320} height={120} />
        ),
      },
      {
        name: "déviant + trajectoire",
        note: "context lower_is_better, série montante → aire rouge + repère",
        render: () => (
          <AreaChart
            data={[{ x: 1, y: 40 }, { x: 2, y: 52 }, { x: 3, y: 67 }, { x: 4, y: 80 }]}
            width={320}
            height={120}
            context={{ reference: 50, direction: "lower_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "barChart",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => (
          <BarChart data={[{ x: "Jan", y: 100 }, { x: "Fév", y: 150 }, { x: "Mar", y: 120 }]} width={320} height={120} />
        ),
      },
      {
        name: "déviant + trajectoire",
        note: "context → chaque barre jugée individuellement (vert/rouge) + repère pointillé",
        render: () => (
          <BarChart
            data={[{ x: "Jan", y: 110 }, { x: "Fév", y: 95 }, { x: "Mar", y: 80 }, { x: "Avr", y: 70 }]}
            width={320}
            height={120}
            context={{ reference: 100, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "scatterChart",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé",
        render: () => (
          <ScatterChart data={[{ x: 1, y: 10 }, { x: 2, y: 25 }, { x: 3, y: 18 }]} width={320} height={120} />
        ),
      },
      {
        name: "déviant + anomalie",
        note: "context → points jugés individuellement, outlier >2σ cerclé, repère pointillé",
        render: () => (
          <ScatterChart
            data={[
              { x: 1, y: 101 }, { x: 2, y: 99 }, { x: 3, y: 102 }, { x: 4, y: 98 },
              { x: 5, y: 100 }, { x: 6, y: 62 },
            ]}
            width={320}
            height={120}
            context={{ reference: 100, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "liveChart",
    class: "INSTRUMENT",
    examples: [
      {
        name: "défaut",
        note: "rendu historique inchangé (seuils manuels)",
        render: () => (
          <LiveChart data={liveDemoData([42, 45, 44, 47, 43])} thresholds={[{ value: 50 }]} width={320} height={120} />
        ),
      },
      {
        name: "déviant + trajectoire",
        note: "context → fenêtre jugée : courbe rouge, repère pointillé, verdict sous le graphique",
        render: () => (
          <LiveChart
            data={liveDemoData([95, 90, 84, 77, 70])}
            width={320}
            height={120}
            context={{ reference: 100, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
  {
    key: "rating",
    class: "INSTRUMENT",
    examples: [
      { name: "défaut", note: "rendu historique inchangé", render: () => <Rating value={3} /> },
      {
        name: "déviant",
        note: "cible 4.0 → étoiles rouges + écart révélé",
        render: () => <Rating value={2} context={{ reference: 4, direction: "higher_is_better" }} />,
      },
      {
        name: "trajectoire",
        note: "history v(t) en baisse → tendance ↘",
        render: () => (
          <Rating
            value={2}
            history={[
              { t: 1, v: 4.2 },
              { t: 2, v: 3.1 },
              { t: 3, v: 2.0 },
            ]}
            context={{ reference: 4, direction: "higher_is_better" }}
          />
        ),
      },
    ],
  },
];
