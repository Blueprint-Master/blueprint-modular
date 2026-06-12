"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowDiagram, CodeBlock } from "@/components/bpm";
import type { FlowDiagramState, FlowDiagramTransition } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const STATES: FlowDiagramState[] = [
  { value: "received", label: "Reçue", color: "info" },
  { value: "preparation", label: "Préparation", color: "default" },
  { value: "shipped", label: "Expédiée", color: "warning" },
  { value: "delivered", label: "Livrée", color: "success", terminal: true },
  { value: "cancelled", label: "Annulée", color: "error", terminal: true },
];

const TRANSITIONS: FlowDiagramTransition[] = [
  { from: "received", to: "preparation", label: "Valider" },
  { from: "preparation", to: "shipped", label: "Expédier" },
  { from: "shipped", to: "delivered", label: "Livrer" },
  { from: ["received", "preparation"], to: "cancelled", label: "Annuler" },
];

function pyState(s: FlowDiagramState): string {
  const parts = [`"value": "${s.value}"`, `"label": "${s.label}"`];
  if (s.color && s.color !== "default") parts.push(`"color": "${s.color}"`);
  if (s.terminal) parts.push(`"terminal": True`);
  return `{${parts.join(", ")}}`;
}

function pyTransition(t: FlowDiagramTransition): string {
  const from = Array.isArray(t.from)
    ? `[${t.from.map((f) => `"${f}"`).join(", ")}]`
    : `"${t.from}"`;
  return `{"from": ${from}, "to": "${t.to}", "label": "${t.label}"}`;
}

export default function DocFlowDiagramPage() {
  const [currentState, setCurrentState] = useState("received");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");

  const lines = [
    "bpm.flowDiagram(",
    "    states=[",
    ...STATES.map((s) => `        ${pyState(s)},`),
    "    ],",
    "    transitions=[",
    ...TRANSITIONS.map((t) => `        ${pyTransition(t)},`),
    "    ],",
  ];
  if (currentState) lines.push(`    current_state="${currentState}",`);
  if (direction !== "horizontal") lines.push(`    direction="${direction}",`);
  lines.push(")");
  const pythonCode = lines.join("\n");
  const { prev, next } = getPrevNext("flowdiagram");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.flowDiagram
        </div>
        <h1>bpm.flowDiagram</h1>
        <p className="doc-description">
          Diagramme d&apos;états et transitions interactif (SVG) : états colorés, états
          terminaux à double bordure, et flèches cliquables depuis l&apos;état courant.
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
            <FlowDiagram
              states={STATES}
              transitions={TRANSITIONS}
              currentState={currentState || undefined}
              direction={direction}
              onTransition={(_from, to) => setCurrentState(to)}
            />
            <p style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 8 }}>
              Cliquez sur une flèche partant de l&apos;état actif pour déclencher la transition.
            </p>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>currentState (état actif de la commande)</label>
            <select value={currentState} onChange={(e) => setCurrentState(e.target.value)}>
              {STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label} ({s.value})
                </option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "horizontal" | "vertical")}
            >
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
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
          <tr><td><code>states</code></td><td><code>&#123; value, label, color?, terminal? &#125;[]</code></td><td>—</td><td>Oui</td><td>Liste des états. <code>color</code> ∈ default | info | success | warning | error ; <code>terminal</code> ajoute une double bordure.</td></tr>
          <tr><td><code>transitions</code></td><td><code>&#123; from, to, label &#125;[]</code></td><td>—</td><td>Oui</td><td>Transitions entre états. <code>from</code> accepte une valeur ou un tableau de valeurs sources.</td></tr>
          <tr><td><code>currentState</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Valeur de l&apos;état actif (bordure accent + halo). Les transitions non atteignables sont grisées.</td></tr>
          <tr><td><code>onTransition</code></td><td><code>(from: string, to: string) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au clic sur une flèche partant de l&apos;état courant ; rend ces flèches cliquables.</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>horizontal</td><td>Non</td><td>Orientation du diagramme.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={`bpm.flowDiagram(
    states=[
        {"value": "draft", "label": "Brouillon"},
        {"value": "review", "label": "En relecture", "color": "info"},
        {"value": "published", "label": "Publié", "color": "success", "terminal": True},
    ],
    transitions=[
        {"from": "draft", "to": "review", "label": "Soumettre"},
        {"from": "review", "to": "published", "label": "Publier"},
        {"from": "review", "to": "draft", "label": "Renvoyer"},
    ],
    current_state="review",
)`}
        language="python"
      />
      <CodeBlock
        code={`bpm.flowDiagram(
    states=[
        {"value": "open", "label": "Ouvert", "color": "info"},
        {"value": "resolved", "label": "Résolu", "color": "success", "terminal": True},
        {"value": "closed", "label": "Fermé", "color": "error", "terminal": True},
    ],
    transitions=[
        {"from": "open", "to": "resolved", "label": "Résoudre"},
        {"from": ["open", "resolved"], "to": "closed", "label": "Fermer"},
    ],
    current_state="open",
    direction="vertical",
    on_transition=handle_transition,
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
