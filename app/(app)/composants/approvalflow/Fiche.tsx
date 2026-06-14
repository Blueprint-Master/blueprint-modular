"use client";

import { useState } from "react";
import Link from "next/link";
import { ApprovalFlow, CodeBlock } from "@/components/bpm";
import type { ApprovalStep } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description:
    "Flux de validation multi-étapes (approuvé / en attente / rejeté) : chaque approbateur peut approuver ou rejeter l'étape en cours avec un commentaire.",
  category: "Affichage de données",
  roles: { "1": "Demandeur", "2": "Manager", "3": "DAF" } as Record<string, string>,
  initialComment: "Devis n° DV-2026-0481 — 12 400 € HT.",
  hint:
    "Validation du devis DV-2026-0481 : utilisez les boutons Approuver / Rejeter de l'étape en attente pour faire avancer le circuit.",
  directionAuto: "auto (horizontal si < 5 étapes)",
  reset: "Réinitialiser le circuit",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  props: {
    steps: (
      <>
        Étapes du circuit. <code>status</code> ∈ pending | approved | rejected | skipped.
      </>
    ),
    onApprove:
      "Callback d'approbation de l'étape en attente ; affiche le bouton « Approuver ».",
    onReject: "Callback de rejet de l'étape en attente ; affiche le bouton « Rejeter ».",
    direction: "Orientation. Par défaut : horizontal si moins de 5 étapes, vertical sinon.",
    showCommentInput:
      "Affiche le champ commentaire sous l'étape en attente (transmis aux callbacks).",
    className: "Classes CSS additionnelles.",
  },
  examples: "Exemples",
};

const en: typeof fr = {
  breadcrumb: "Components",
  description:
    "Multi-step approval flow (approved / pending / rejected): each approver can approve or reject the current step with a comment.",
  category: "Data display",
  roles: { "1": "Requester", "2": "Manager", "3": "CFO" } as Record<string, string>,
  initialComment: "Quote no. DV-2026-0481 — €12,400 excl. tax.",
  hint:
    "Approval of quote DV-2026-0481: use the approve / reject buttons on the pending step to move the flow forward.",
  directionAuto: "auto (horizontal if < 5 steps)",
  reset: "Reset the flow",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  props: {
    steps: (
      <>
        Steps of the approval flow. <code>status</code> ∈ pending | approved | rejected | skipped.
      </>
    ),
    onApprove: "Approval callback for the pending step; displays the approve button.",
    onReject: "Rejection callback for the pending step; displays the reject button.",
    direction: "Orientation. By default: horizontal with fewer than 5 steps, vertical otherwise.",
    showCommentInput:
      "Displays the comment field under the pending step (passed to the callbacks).",
    className: "Additional CSS classes.",
  },
  examples: "Examples",
};

const L = { fr, en };

const INITIAL_STEPS: ApprovalStep[] = [
  { id: "1", approver: "Sophie Leroy", status: "approved", date: "2026-06-10T09:15:00" },
  { id: "2", approver: "Karim Benali", status: "pending" },
  { id: "3", approver: "Claire Moreau", status: "pending" },
];

export default function DocApprovalFlowPage() {
  const { locale } = useI18n();
  const t = L[locale];
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

  const localizedSteps: ApprovalStep[] = steps.map((s) => ({
    ...s,
    role: t.roles[s.id],
    comment: s.id === "1" ? t.initialComment : s.comment,
  }));

  const stepsArg = localizedSteps
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
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.approvalFlow
        </div>
        <h1>bpm.approvalFlow</h1>
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
            <ApprovalFlow
              steps={localizedSteps}
              direction={direction === "auto" ? undefined : direction}
              showCommentInput={showCommentInput}
              onApprove={(id, comment) => decide(id, "approved", comment)}
              onReject={(id, comment) => decide(id, "rejected", comment)}
            />
            <p style={{ fontSize: 12, color: "var(--bpm-text-secondary)", marginTop: 12 }}>
              {t.hint}
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
              <option value="auto">{t.directionAuto}</option>
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
              {t.reset}
            </button>
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
          <tr><td><code>steps</code></td><td><code>&#123; id, approver, role?, status, comment?, date?, avatar? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.props.steps}</td></tr>
          <tr><td><code>onApprove</code></td><td><code>(stepId: string, comment?: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.props.onApprove}</td></tr>
          <tr><td><code>onReject</code></td><td><code>(stepId: string, comment?: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.props.onReject}</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>auto</td><td>{t.no}</td><td>{t.props.direction}</td></tr>
          <tr><td><code>showCommentInput</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.props.showCommentInput}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.props.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
