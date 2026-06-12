"use client";

import { useState } from "react";
import Link from "next/link";
import { AnomalyAlert, CodeBlock } from "@/components/bpm";
import type { AnomalySeverity } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const frDict = {
  breadcrumb: "Composants",
  description: (
    <>
      Alerte d&apos;anomalie : met en regard la valeur attendue et la valeur mesurée d&apos;un
      indicateur métier, avec un niveau de gravité (info / warning / critical). Composant clé
      de la couche sémantique : utilisez-le dès qu&apos;une mesure s&apos;écarte d&apos;un repère
      métier (cible, budget, seuil qualité) et que l&apos;utilisateur doit voir l&apos;écart, pas
      seulement la valeur — ex. « attendu 1,2 %, constaté 4,8 % ». Pour un simple statut sans
      écart chiffré, préférez bpm.statusBox.
    </>
  ),
  category: "Feedback",
  demoTitle: "Taux de rebut — Ligne 2",
  demoExpected: "1,2 %",
  demoActual: "4,8 %",
  showAlertAgain: "Réafficher l'alerte",
  titlePlaceholder: "Anomalie détectée",
  expectedLabel: "expected (valeur attendue)",
  expectedPlaceholder: "ex. 1,2 %",
  actualLabel: "actual (valeur mesurée)",
  actualPlaceholder: "ex. 4,8 %",
  dismissLabel: "onDismiss (alerte fermable via ×)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  propExpected: <>Valeur attendue (cible, seuil, budget…).</>,
  propActual: <>Valeur mesurée / constatée.</>,
  propTitle: <>Titre de l&apos;alerte.</>,
  propSeverity: (
    <>
      Niveau de gravité. Si omis et <code>context</code> fourni, dérivé automatiquement de la
      sévérité interprétée (≥ 0,5 critical, &gt; 0,15 warning, sinon info).
    </>
  ),
  propOnDismiss: <>Callback de fermeture : affiche le bouton × en haut à droite.</>,
  propHistory: (
    <>
      Historique v(t) de la mesure — révèle la tendance dans le verdict si <code>context</code>{" "}
      est fourni.
    </>
  ),
  propContext: (
    <>
      Contexte de jugement : gravité auto-dérivée et verdict écart/tendance révélé sous les
      valeurs. Additif : sans <code>context</code>, rendu inchangé.
    </>
  ),
  propClassName: <>Classes CSS additionnelles.</>,
};

const enDict: typeof frDict = {
  breadcrumb: "Components",
  description: (
    <>
      Anomaly alert: puts the expected value and the measured value of a business indicator side
      by side, with a severity level (info / warning / critical). A key component of the semantic
      layer: use it whenever a measurement drifts away from a business reference (target, budget,
      quality threshold) and the user needs to see the gap, not just the value — e.g.
      &quot;expected 1.2%, actual 4.8%&quot;. For a simple status with no quantified gap, prefer
      bpm.statusBox.
    </>
  ),
  category: "Feedback",
  demoTitle: "Scrap rate — Line 2",
  demoExpected: "1.2%",
  demoActual: "4.8%",
  showAlertAgain: "Show the alert again",
  titlePlaceholder: "Anomaly detected",
  expectedLabel: "expected (target value)",
  expectedPlaceholder: "e.g. 1.2%",
  actualLabel: "actual (measured value)",
  actualPlaceholder: "e.g. 4.8%",
  dismissLabel: "onDismiss (alert dismissible via ×)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  propExpected: <>Expected value (target, threshold, budget…).</>,
  propActual: <>Measured / observed value.</>,
  propTitle: <>Alert title.</>,
  propSeverity: (
    <>
      Severity level. If omitted and <code>context</code> is provided, derived automatically from
      the interpreted severity (≥ 0.5 critical, &gt; 0.15 warning, otherwise info).
    </>
  ),
  propOnDismiss: <>Dismiss callback: shows the × button in the top-right corner.</>,
  propHistory: (
    <>
      v(t) history of the measurement — reveals the trend in the verdict when{" "}
      <code>context</code> is provided.
    </>
  ),
  propContext: (
    <>
      Judgment context: severity is auto-derived and a gap/trend verdict is revealed below the
      values. Additive: without <code>context</code>, rendering is unchanged.
    </>
  ),
  propClassName: <>Additional CSS classes.</>,
};

const L = { fr: frDict, en: enDict } as const;

export default function DocAnomalyAlertPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [titleStr, setTitleStr] = useState(L.fr.demoTitle);
  const [expectedStr, setExpectedStr] = useState(L.fr.demoExpected);
  const [actualStr, setActualStr] = useState(L.fr.demoActual);
  const [severity, setSeverity] = useState<AnomalySeverity>("critical");
  const [dismissible, setDismissible] = useState(true);
  const [visible, setVisible] = useState(true);

  // Les valeurs de démo suivent la langue tant qu'elles n'ont pas été personnalisées.
  const resolveDemo = (value: string, key: "demoTitle" | "demoExpected" | "demoActual") =>
    value === L.fr[key] || value === L.en[key] ? t[key] : value;
  const title = resolveDemo(titleStr, "demoTitle");
  const expected = resolveDemo(expectedStr, "demoExpected");
  const actual = resolveDemo(actualStr, "demoActual");

  const esc = (s: string) => s.replace(/"/g, '\\"');
  const parts: string[] = [`expected="${esc(expected)}"`, `actual="${esc(actual)}"`];
  if (title) parts.push(`title="${esc(title)}"`);
  if (severity !== "warning") parts.push(`severity="${severity}"`);
  const pythonCode = `bpm.anomaly_alert(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("anomalyalert");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.anomalyAlert
        </div>
        <h1>bpm.anomalyAlert</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            {visible ? (
              <AnomalyAlert
                title={title || undefined}
                expected={expected}
                actual={actual}
                severity={severity}
                onDismiss={dismissible ? () => setVisible(false) : undefined}
              />
            ) : (
              <button type="button" onClick={() => setVisible(true)}>
                {t.showAlertAgain}
              </button>
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitleStr(e.target.value)}
              placeholder={t.titlePlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.expectedLabel}</label>
            <input
              type="text"
              value={expected}
              onChange={(e) => setExpectedStr(e.target.value)}
              placeholder={t.expectedPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.actualLabel}</label>
            <input
              type="text"
              value={actual}
              onChange={(e) => setActualStr(e.target.value)}
              placeholder={t.actualPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>severity</label>
            <select value={severity} onChange={(e) => setSeverity(e.target.value as AnomalySeverity)}>
              <option value="info">info</option>
              <option value="warning">warning</option>
              <option value="critical">critical</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={dismissible}
                onChange={(e) => setDismissible(e.target.checked)}
              />{" "}
              {t.dismissLabel}
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
          <tr><td><code>expected</code></td><td><code>string | number</code></td><td>—</td><td>{t.yes}</td><td>{t.propExpected}</td></tr>
          <tr><td><code>actual</code></td><td><code>string | number</code></td><td>—</td><td>{t.yes}</td><td>{t.propActual}</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>&quot;Anomalie détectée&quot;</td><td>{t.no}</td><td>{t.propTitle}</td></tr>
          <tr><td><code>severity</code></td><td><code>&quot;info&quot; | &quot;warning&quot; | &quot;critical&quot;</code></td><td>warning</td><td>{t.no}</td><td>{t.propSeverity}</td></tr>
          <tr><td><code>onDismiss</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.propOnDismiss}</td></tr>
          <tr><td><code>history</code></td><td><code>&#123; t, v &#125;[]</code></td><td>—</td><td>{t.no}</td><td>{t.propHistory}</td></tr>
          <tr><td><code>context</code></td><td><code>&#123; reference, direction, comparisonFrame?, neutralBand? &#125;</code></td><td>—</td><td>{t.no}</td><td>{t.propContext}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={'bpm.anomaly_alert(expected="1,2 %", actual="4,8 %", title="Taux de rebut — Ligne 2", severity="critical")'}
        language="python"
      />
      <CodeBlock
        code={'# Écart logistique, gravité par défaut (warning)\nbpm.anomaly_alert(expected="48 h", actual="72 h", title="Délai de livraison — Zone Ouest")'}
        language="python"
      />
      <CodeBlock
        code={'# Écart positif mais notable : simple information\nbpm.anomaly_alert(expected=120, actual=134, title="Commandes traitées aujourd\'hui", severity="info")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
