"use client";

import { useState } from "react";
import Link from "next/link";
import { FlowDiagram, CodeBlock } from "@/components/bpm";
import type { FlowDiagramState, FlowDiagramTransition } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description:
    "Diagramme d'états et transitions interactif (SVG) : états colorés, états terminaux à double bordure, et flèches cliquables depuis l'état courant.",
  category: "Affichage de données",
  states: {
    received: "Reçue",
    preparation: "Préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
  },
  transitions: {
    validate: "Valider",
    ship: "Expédier",
    deliver: "Livrer",
    cancel: "Annuler",
  },
  hint: "Cliquez sur une flèche partant de l'état actif pour déclencher la transition.",
  currentStateControl: "currentState (état actif de la commande)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  props: {
    states: (
      <>
        Liste des états. <code>color</code> ∈ default | info | success | warning | error ;{" "}
        <code>terminal</code> ajoute une double bordure.
      </>
    ),
    transitions: (
      <>
        Transitions entre états. <code>from</code> accepte une valeur ou un tableau de valeurs
        sources.
      </>
    ),
    currentState:
      "Valeur de l'état actif (bordure accent + halo). Les transitions non atteignables sont grisées.",
    onTransition:
      "Callback au clic sur une flèche partant de l'état courant ; rend ces flèches cliquables.",
    direction: "Orientation du diagramme.",
    className: "Classes CSS additionnelles.",
  },
  examples: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  description:
    "Interactive state and transition diagram (SVG): colored states, double-bordered terminal states, and clickable arrows from the current state.",
  category: "Data display",
  states: {
    received: "Received",
    preparation: "Preparation",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  },
  transitions: {
    validate: "Validate",
    ship: "Ship",
    deliver: "Deliver",
    cancel: "Cancel",
  },
  hint: "Click an arrow leaving the active state to trigger the transition.",
  currentStateControl: "currentState (active state of the order)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  props: {
    states: (
      <>
        List of states. <code>color</code> ∈ default | info | success | warning | error;{" "}
        <code>terminal</code> adds a double border.
      </>
    ),
    transitions: (
      <>
        Transitions between states. <code>from</code> accepts a single value or an array of source
        values.
      </>
    ),
    currentState:
      "Value of the active state (accent border + halo). Unreachable transitions are dimmed.",
    onTransition:
      "Callback when an arrow leaving the current state is clicked; makes those arrows clickable.",
    direction: "Orientation of the diagram.",
    className: "Additional CSS classes.",
  },
  examples: "Examples",
};

const L = { fr, en };

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
  const { locale } = useI18n();
  const t = L[locale];
  const [currentState, setCurrentState] = useState("received");
  const [direction, setDirection] = useState<"horizontal" | "vertical">("horizontal");

  const states: FlowDiagramState[] = [
    { value: "received", label: t.states.received, color: "info" },
    { value: "preparation", label: t.states.preparation, color: "default" },
    { value: "shipped", label: t.states.shipped, color: "warning" },
    { value: "delivered", label: t.states.delivered, color: "success", terminal: true },
    { value: "cancelled", label: t.states.cancelled, color: "error", terminal: true },
  ];

  const transitions: FlowDiagramTransition[] = [
    { from: "received", to: "preparation", label: t.transitions.validate },
    { from: "preparation", to: "shipped", label: t.transitions.ship },
    { from: "shipped", to: "delivered", label: t.transitions.deliver },
    { from: ["received", "preparation"], to: "cancelled", label: t.transitions.cancel },
  ];

  const lines = [
    "bpm.flowDiagram(",
    "    states=[",
    ...states.map((s) => `        ${pyState(s)},`),
    "    ],",
    "    transitions=[",
    ...transitions.map((tr) => `        ${pyTransition(tr)},`),
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
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.flowDiagram
        </div>
        <h1>bpm.flowDiagram</h1>
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
            <FlowDiagram
              states={states}
              transitions={transitions}
              currentState={currentState || undefined}
              direction={direction}
              onTransition={(_from, to) => setCurrentState(to)}
            />
            <p style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 8 }}>
              {t.hint}
            </p>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.currentStateControl}</label>
            <select value={currentState} onChange={(e) => setCurrentState(e.target.value)}>
              {states.map((s) => (
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
          <tr><td><code>states</code></td><td><code>&#123; value, label, color?, terminal? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.props.states}</td></tr>
          <tr><td><code>transitions</code></td><td><code>&#123; from, to, label &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.props.transitions}</td></tr>
          <tr><td><code>currentState</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.props.currentState}</td></tr>
          <tr><td><code>onTransition</code></td><td><code>(from: string, to: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.props.onTransition}</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>horizontal</td><td>{t.no}</td><td>{t.props.direction}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.props.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
