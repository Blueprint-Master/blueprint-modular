"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusTracker, CodeBlock } from "@/components/bpm";
import type { StatusTrackerStage } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description:
    "Suivi de statut réel d'un objet métier : barre de progression et étapes completed / current / pending / error, avec date, acteur et description.",
  category: "Affichage de données",
  stages: [
    { label: "Commande reçue", actor: "Boutique en ligne" },
    { label: "Paiement validé", actor: "Service paiement" },
    { label: "Préparation", actor: "Entrepôt de Lyon" },
    { label: "Expédition", actor: "Transporteur Colis Express" },
    { label: "Livraison", actor: "Livreur" },
  ],
  currentStageControl: (max: number) => `Étape courante (index 0 à ${max})`,
  errorControl: 'Incident sur l’étape courante (status="error")',
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  props: {
    stages: (
      <>
        Étapes du suivi. <code>status</code> ∈ completed | current | pending | error.{" "}
        <code>date</code> (ISO) est affichée en relatif (« il y a 2 h ») si récente.
      </>
    ),
    direction: (
      <>
        Orientation. En vertical, <code>actor</code> et <code>description</code> sont affichés.
      </>
    ),
    compact: "Affichage condensé (pastilles + libellés) en horizontal.",
    className: "Classes CSS additionnelles.",
  },
  examples: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  description:
    "Real-life status tracking for a business object: progress bar and completed / current / pending / error stages, with date, actor and description.",
  category: "Data display",
  stages: [
    { label: "Order received", actor: "Online store" },
    { label: "Payment confirmed", actor: "Payment service" },
    { label: "Preparation", actor: "Lyon warehouse" },
    { label: "Shipping", actor: "Colis Express carrier" },
    { label: "Delivery", actor: "Delivery driver" },
  ],
  currentStageControl: (max: number) => `Current stage (index 0 to ${max})`,
  errorControl: 'Issue on the current stage (status="error")',
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  props: {
    stages: (
      <>
        Stages of the tracker. <code>status</code> ∈ completed | current | pending | error.{" "}
        <code>date</code> (ISO) is displayed as relative time when recent.
      </>
    ),
    direction: (
      <>
        Orientation. In vertical mode, <code>actor</code> and <code>description</code> are
        displayed.
      </>
    ),
    compact: "Condensed display (dots + labels) in horizontal mode.",
    className: "Additional CSS classes.",
  },
  examples: "Examples",
};

const L = { fr, en };

const STAGE_DATES = [
  "2026-06-08T09:12:00",
  "2026-06-08T09:14:00",
  "2026-06-09T14:30:00",
  "2026-06-10T08:05:00",
  "2026-06-12T11:00:00",
];

export default function DocStatusTrackerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [currentIndex, setCurrentIndex] = useState(2);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [compact, setCompact] = useState(false);
  const [errorOnCurrent, setErrorOnCurrent] = useState(false);

  const stageDefs = t.stages.map((s, i) => ({ ...s, date: STAGE_DATES[i] }));
  const maxIndex = stageDefs.length - 1;
  const index = Math.min(Math.max(currentIndex, 0), maxIndex);

  const stages: StatusTrackerStage[] = stageDefs.map((s, i) => {
    const status: StatusTrackerStage["status"] =
      i < index ? "completed" : i === index ? (errorOnCurrent ? "error" : "current") : "pending";
    return {
      label: s.label,
      status,
      date: i <= index ? s.date : undefined,
      actor: i <= index ? s.actor : undefined,
    };
  });

  const stagesArg = stages.map((s) => `("${s.label}", "${s.status}")`).join(", ");
  const parts = [`stages=[${stagesArg}]`];
  if (direction !== "vertical") parts.push(`direction="${direction}"`);
  if (compact) parts.push("compact=True");
  const pythonCode = `bpm.status_tracker(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("statustracker");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.statusTracker
        </div>
        <h1>bpm.statusTracker</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <StatusTracker stages={stages} direction={direction} compact={compact} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.currentStageControl(maxIndex)}</label>
            <input
              type="number"
              min={0}
              max={maxIndex}
              value={index}
              onChange={(e) =>
                setCurrentIndex(Math.min(maxIndex, Math.max(0, Number(e.target.value) || 0)))
              }
            />
          </div>
          <div className="sandbox-control-group">
            <label>direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "horizontal" | "vertical")}
            >
              <option value="vertical">vertical</option>
              <option value="horizontal">horizontal</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />{" "}
              compact
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={errorOnCurrent}
                onChange={(e) => setErrorOnCurrent(e.target.checked)}
              />{" "}
              {t.errorControl}
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>stages</code></td><td><code>&#123; label, status, date?, actor?, description? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.props.stages}</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>horizontal</td><td>{t.no}</td><td>{t.props.direction}</td></tr>
          <tr><td><code>compact</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.props.compact}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.props.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={'bpm.status_tracker(stages=[("Dossier créé", "completed"), ("Pièces vérifiées", "current"), ("Signature", "pending"), ("Clôturé", "pending")])'}
        language="python"
      />
      <CodeBlock
        code={'bpm.status_tracker(stages=[("Reçue", "completed"), ("Préparation", "completed"), ("Expédition", "current"), ("Livraison", "pending")], direction="horizontal", compact=True)'}
        language="python"
      />
      <CodeBlock
        code={`bpm.status_tracker(
    stages=[
        {"label": "Demande envoyée", "status": "completed", "date": "2026-06-10T09:00:00", "actor": "Sophie Leroy"},
        {"label": "Analyse du dossier", "status": "error", "date": "2026-06-11T16:20:00", "actor": "Service conformité", "description": "Justificatif de domicile illisible."},
        {"label": "Décision", "status": "pending"},
    ],
)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
