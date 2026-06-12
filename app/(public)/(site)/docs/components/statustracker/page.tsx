"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusTracker, CodeBlock } from "@/components/bpm";
import type { StatusTrackerStage } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const STAGE_DEFS = [
  { label: "Commande reçue", date: "2026-06-08T09:12:00", actor: "Boutique en ligne" },
  { label: "Paiement validé", date: "2026-06-08T09:14:00", actor: "Service paiement" },
  { label: "Préparation", date: "2026-06-09T14:30:00", actor: "Entrepôt de Lyon" },
  { label: "Expédition", date: "2026-06-10T08:05:00", actor: "Transporteur Colis Express" },
  { label: "Livraison", date: "2026-06-12T11:00:00", actor: "Livreur" },
];

export default function DocStatusTrackerPage() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [compact, setCompact] = useState(false);
  const [errorOnCurrent, setErrorOnCurrent] = useState(false);

  const maxIndex = STAGE_DEFS.length - 1;
  const index = Math.min(Math.max(currentIndex, 0), maxIndex);

  const stages: StatusTrackerStage[] = STAGE_DEFS.map((s, i) => {
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
          <Link href="/docs/components">Composants</Link> → bpm.statusTracker
        </div>
        <h1>bpm.statusTracker</h1>
        <p className="doc-description">
          Suivi de statut réel d&apos;un objet métier : barre de progression et étapes
          completed / current / pending / error, avec date, acteur et description.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
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
            <label>Étape courante (index 0 à {maxIndex})</label>
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
              Incident sur l&apos;étape courante (status=&quot;error&quot;)
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>stages</code></td><td><code>&#123; label, status, date?, actor?, description? &#125;[]</code></td><td>—</td><td>Oui</td><td>Étapes du suivi. <code>status</code> ∈ completed | current | pending | error. <code>date</code> (ISO) est affichée en relatif (« il y a 2 h ») si récente.</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>horizontal</td><td>Non</td><td>Orientation. En vertical, <code>actor</code> et <code>description</code> sont affichés.</td></tr>
          <tr><td><code>compact</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affichage condensé (pastilles + libellés) en horizontal.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
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
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
