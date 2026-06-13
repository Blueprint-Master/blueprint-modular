"use client";

import { useState } from "react";
import Link from "next/link";
import { Stepper, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "Navigation",
  description: "Stepper : liste d’étapes avec indicateur d’avancement (étape courante, complétées).",
  copy: "Copier",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  stepsLabel: "steps (labels séparés par des virgules)",
  stepsPlaceholder: "Étape 1, Étape 2, Étape 3",
  currentStepLabel: "currentStep (index 0 à",
  descSteps: "Liste des étapes (",
  descStepsEnd: " requis).",
  descCurrentStep: "Index de l’étape courante (0-based).",
  descDirection: "Disposition des étapes.",
  descSize: "Taille des cercles (32 / 40 / 48 px).",
  descOnStepClick: "Callback : étapes déjà complétées cliquables pour revenir en arrière.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "Navigation",
  description: "Stepper: list of steps with a progress indicator (current step, completed steps).",
  copy: "Copy",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  stepsLabel: "steps (labels separated by commas)",
  stepsPlaceholder: "Step 1, Step 2, Step 3",
  currentStepLabel: "currentStep (index 0 to",
  descSteps: "List of steps (",
  descStepsEnd: " required).",
  descCurrentStep: "Index of the current step (0-based).",
  descDirection: "Layout of the steps.",
  descSize: "Size of the circles (32 / 40 / 48 px).",
  descOnStepClick: "Callback: already completed steps are clickable to go back.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocStepperPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [stepsStr, setStepsStr] = useState("Informations, Paiement, Confirmation");
  const [currentStep, setCurrentStep] = useState(0);

  const stepLabels = stepsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const steps = stepLabels.length
    ? stepLabels.map((label) => ({ label }))
    : [{ label: "Étape 1" }, { label: "Étape 2" }, { label: "Étape 3" }];
  const maxStep = Math.max(0, steps.length - 1);
  const stepIndex = Math.min(currentStep, maxStep);

  const parts: string[] = [];
  if (steps.length) {
    const stepsArg = steps.map((s) => `{"label": "${s.label.replace(/"/g, '\\"')}"}`).join(", ");
    parts.push(`steps=[${stepsArg}]`);
  }
  if (stepIndex !== 0) parts.push(`current_step=${stepIndex}`);
  const pythonCode = parts.length ? `bpm.stepper(${parts.join(", ")})` : "bpm.stepper()";
  const { prev, next } = getPrevNext("stepper");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.stepper
        </div>
        <h1>bpm.stepper</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-sm">
            <Stepper
              steps={steps}
              currentStep={stepIndex}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.stepsLabel}</label>
            <input
              type="text"
              value={stepsStr}
              onChange={(e) => setStepsStr(e.target.value)}
              placeholder={t.stepsPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.currentStepLabel} {maxStep})</label>
            <input
              type="number"
              min={0}
              max={maxStep}
              value={currentStep}
              onChange={(e) => setCurrentStep(Math.min(maxStep, Math.max(0, Number(e.target.value) || 0)))}
            />
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
          <tr><td><code>steps</code></td><td><code>&#123; id?, label, description?, icon?, optional?, content? &#125;[]</code></td><td>[]</td><td>{t.no}</td><td>{t.descSteps}<code>label</code>{t.descStepsEnd}</td></tr>
          <tr><td><code>currentStep</code></td><td><code>number</code></td><td>0</td><td>{t.no}</td><td>{t.descCurrentStep}</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td><td>horizontal</td><td>{t.no}</td><td>{t.descDirection}</td></tr>
          <tr><td><code>size</code></td><td><code>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</code></td><td>md</td><td>{t.no}</td><td>{t.descSize}</td></tr>
          <tr><td><code>onStepClick</code></td><td><code>(index: number) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.descOnStepClick}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.stepper(steps=[{"label": "Infos"}, {"label": "Paiement"}, {"label": "Confirmation"}])'} language="python" />
      <CodeBlock code={'bpm.stepper(steps=[{"label": "A"}, {"label": "B"}], current_step=1)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
