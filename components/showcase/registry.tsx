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
import { LiveGauge, Metric, Progress, ProgressRing } from "@/components/bpm";

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
];
