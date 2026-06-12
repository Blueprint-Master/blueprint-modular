"use client";

import { useState } from "react";
import Link from "next/link";
import { ApprovalFlow, CodeBlock } from "@/components/bpm";
import type { ApprovalStep } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const INITIAL_STEPS: ApprovalStep[] = [
  {
    id: "1",
    approver: "Sophie Leroy",
    role: "Demandeur",
    status: "approved",
    date: "2026-06-10T09:15:00",
    comment: "Devis n° DV-2026-0481 — 12 400 € HT.",
  },
  { id: "2", approver: "Karim Benali", role: "Manager", status: "pending" },
  { id: "3", approver: "Claire Moreau", role: "DAF", status: "pending" },
];

export default function DocApprovalFlowPage() {
  const [steps, setSteps] = useState<ApprovalStep[]>(INITIAL_STEPS);
  const [direction, setDirection] = useState<"auto" | "horizontal" | "vertical">("auto");
  const [showCommentInput, setShowCommentInput] = useState(true);

  const decide = (stepId: string, status: "approved" | "rejected", comment?: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, status, comment: comment ?? s.comment, date: new Date().toISOString() }
          : s
      )
    );
  };

  const stepsArg = steps
    .map((s) => `("${s.approver}", "${s.role ?? ""}", "${s.status}")`)
    .join(", ");
  const parts = [`steps=[${stepsArg}]`];
  if (direction !== "auto") parts.push(`direction="${direction}"`);
  const pythonCode = `bpm.approval_flow(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("approvalflow");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.approvalFlow
        </div>
        <h1>bpm.approvalFlow</h1>
        <p className="doc-description">
          Flux de validation multi-étapes (approuvé / en attente / rejeté) : chaque
          approbateur peut approuver ou rejeter l&apos;étape en cours avec un commentaire.
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
            <ApprovalFlow
              steps={steps}
              direction={direction === "auto" ? undefined : direction}
              showCommentInput={showCommentInput}
              onApprove={(id, comment) => decide(id, "approved", comment)}
              onReject={(id, comment) => decide(id, "rejected", comment)}
            />
            <p style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 12 }}>
              Validation du devis DV-2026-0481 : utilisez les boutons Approuver / Rejeter
              de l&apos;étape en attente pour faire avancer le circuit.
            </p>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "auto" | "horizontal" | "vertical")}
            >
              <option value="auto">auto (horizontal si &lt; 5 étapes)</option>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={showCommentInput}
                onChange={(e) => setShowCommentInput(e.target.checked)}
              />{" "}
              showCommentInput
            </label>
          </div>
          <div className="sandbox-control-group">
            <button type="button" onClick={() => setSteps(INITIAL_STEPS)}>
              Réinitialiser le circuit
            </button>
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
          <tr><td><code>steps</code></td><td><code>&#123; id, approver, role?, status, comment?, date?, avatar? &#125;[]</code></td><td>—</td><td>Oui</td><td>Étapes du circuit. <code>status</code> ∈ pending | approved | rejected | skipped.</td></tr>
          <tr><td><code>onApprove</code></td><td><code>(stepId: string, comment?: string) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback d&apos;approbation de l&apos;étape en attente ; affiche le bouton « Approuver ».</td></tr>
          <tr><td><code>onReject</code></td><td><code>(stepId: string, comment?: string) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback de rejet de l&apos;étape en attente ; affiche le bouton « Rejeter ».</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>auto</td><td>Non</td><td>Orientation. Par défaut : horizontal si moins de 5 étapes, vertical sinon.</td></tr>
          <tr><td><code>showCommentInput</code></td><td><code>boolean</code></td><td>true</td><td>Non</td><td>Affiche le champ commentaire sous l&apos;étape en attente (transmis aux callbacks).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={'bpm.approval_flow(steps=[("Sophie Leroy", "Demandeur", "approved"), ("Karim Benali", "Manager", "pending"), ("Claire Moreau", "DAF", "pending")])'}
        language="python"
      />
      <CodeBlock
        code={`bpm.approval_flow(
    steps=[
        {"id": "1", "approver": "Marie Dupont", "role": "Cheffe de projet", "status": "approved", "comment": "Budget conforme."},
        {"id": "2", "approver": "Jean Martin", "role": "Direction", "status": "rejected", "comment": "Montant à revoir."},
    ],
    direction="vertical",
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
