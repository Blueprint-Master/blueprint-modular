"use client";

import { useState } from "react";
import Link from "next/link";
import { AnomalyAlert, CodeBlock } from "@/components/bpm";
import type { AnomalySeverity } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocAnomalyAlertPage() {
  const [title, setTitle] = useState("Taux de rebut — Ligne 2");
  const [expected, setExpected] = useState("1,2 %");
  const [actual, setActual] = useState("4,8 %");
  const [severity, setSeverity] = useState<AnomalySeverity>("critical");
  const [dismissible, setDismissible] = useState(true);
  const [visible, setVisible] = useState(true);

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
          <Link href="/docs/components">Composants</Link> → bpm.anomalyAlert
        </div>
        <h1>bpm.anomalyAlert</h1>
        <p className="doc-description">
          Alerte d&apos;anomalie : met en regard la valeur attendue et la valeur mesurée d&apos;un
          indicateur métier, avec un niveau de gravité (info / warning / critical). Composant clé
          de la couche sémantique : utilisez-le dès qu&apos;une mesure s&apos;écarte d&apos;un repère
          métier (cible, budget, seuil qualité) et que l&apos;utilisateur doit voir l&apos;écart, pas
          seulement la valeur — ex. « attendu 1,2 %, constaté 4,8 % ». Pour un simple statut sans
          écart chiffré, préférez bpm.statusBox.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
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
                Réafficher l&apos;alerte
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
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Anomalie détectée"
            />
          </div>
          <div className="sandbox-control-group">
            <label>expected (valeur attendue)</label>
            <input
              type="text"
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              placeholder="ex. 1,2 %"
            />
          </div>
          <div className="sandbox-control-group">
            <label>actual (valeur mesurée)</label>
            <input
              type="text"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              placeholder="ex. 4,8 %"
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
              onDismiss (alerte fermable via ×)
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
          <tr><td><code>expected</code></td><td><code>string | number</code></td><td>—</td><td>Oui</td><td>Valeur attendue (cible, seuil, budget…).</td></tr>
          <tr><td><code>actual</code></td><td><code>string | number</code></td><td>—</td><td>Oui</td><td>Valeur mesurée / constatée.</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>&quot;Anomalie détectée&quot;</td><td>Non</td><td>Titre de l&apos;alerte.</td></tr>
          <tr><td><code>severity</code></td><td><code>&quot;info&quot; | &quot;warning&quot; | &quot;critical&quot;</code></td><td>warning</td><td>Non</td><td>Niveau de gravité. Si omis et <code>context</code> fourni, dérivé automatiquement de la sévérité interprétée (≥ 0,5 critical, &gt; 0,15 warning, sinon info).</td></tr>
          <tr><td><code>onDismiss</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Callback de fermeture : affiche le bouton × en haut à droite.</td></tr>
          <tr><td><code>history</code></td><td><code>&#123; t, v &#125;[]</code></td><td>—</td><td>Non</td><td>Historique v(t) de la mesure — révèle la tendance dans le verdict si <code>context</code> est fourni.</td></tr>
          <tr><td><code>context</code></td><td><code>&#123; reference, direction, comparisonFrame?, neutralBand? &#125;</code></td><td>—</td><td>Non</td><td>Contexte de jugement : gravité auto-dérivée et verdict écart/tendance révélé sous les valeurs. Additif : sans <code>context</code>, rendu inchangé.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
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
