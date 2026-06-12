"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveGauge, CodeBlock } from "@/components/bpm";
import type { LiveGaugeSize } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocLiveGaugePage() {
  const [value, setValue] = useState(72);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [warningStr, setWarningStr] = useState("70");
  const [criticalStr, setCriticalStr] = useState("90");
  const [label, setLabel] = useState("Charge CPU (%)");
  const [size, setSize] = useState<LiveGaugeSize>("md");
  const [live, setLive] = useState(false);

  const warningAbove = warningStr.trim() === "" ? undefined : Number(warningStr);
  const criticalAbove = criticalStr.trim() === "" ? undefined : Number(criticalStr);

  useEffect(() => {
    if (!live) return;
    const id = window.setInterval(() => {
      setValue((v) => {
        const step = (max - min) * 0.08;
        const next = v + (Math.random() - 0.45) * step;
        return Math.round(Math.min(max, Math.max(min, next)) * 10) / 10;
      });
    }, 1200);
    return () => window.clearInterval(id);
  }, [live, min, max]);

  const parts: string[] = [`value=${value}`];
  if (min !== 0) parts.push(`min=${min}`);
  if (max !== 100) parts.push(`max=${max}`);
  if (warningAbove != null && Number.isFinite(warningAbove)) parts.push(`warning_above=${warningAbove}`);
  if (criticalAbove != null && Number.isFinite(criticalAbove)) parts.push(`critical_above=${criticalAbove}`);
  if (label) parts.push(`label="${label.replace(/"/g, '\\"')}"`);
  if (size !== "md") parts.push(`size="${size}"`);
  const pythonCode = `bpm.live_gauge(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("livegauge");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.liveGauge
        </div>
        <h1>bpm.liveGauge</h1>
        <p className="doc-description">
          Jauge demi-cercle avec aiguille et zones colorées normal / avertissement / critique.
          Pensée pour le monitoring d&apos;une grandeur bornée : charge CPU, débit d&apos;une ligne
          de production, taux d&apos;occupation… Les seuils <code>warningAbove</code> et{" "}
          <code>criticalAbove</code> dessinent les zones jaune et rouge sur l&apos;arc.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <LiveGauge
            value={value}
            min={min}
            max={max}
            warningAbove={warningAbove}
            criticalAbove={criticalAbove}
            label={label || undefined}
            size={size}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value ({min} à {max})</label>
            <input
              type="range"
              min={min}
              max={max}
              step={1}
              value={value}
              disabled={live}
              onChange={(e) => setValue(Number(e.target.value))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>min</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>warningAbove (vide = aucun)</label>
            <input
              type="number"
              value={warningStr}
              onChange={(e) => setWarningStr(e.target.value)}
              placeholder="ex. 70"
            />
          </div>
          <div className="sandbox-control-group">
            <label>criticalAbove (vide = aucun)</label>
            <input
              type="number"
              value={criticalStr}
              onChange={(e) => setCriticalStr(e.target.value)}
              placeholder="ex. 90"
            />
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Charge CPU (%)"
            />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as LiveGaugeSize)}>
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={live}
                onChange={(e) => setLive(e.target.checked)}
              />{" "}
              Simulation temps réel (la valeur fluctue toutes les 1,2 s)
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
          <tr><td><code>value</code></td><td><code>number | &#123; t, v &#125;[]</code></td><td>—</td><td>Oui</td><td>Valeur actuelle, ou trajectoire v(t) (l&apos;aiguille pointe le dernier point ; tendance jugée si <code>context</code> est fourni).</td></tr>
          <tr><td><code>min</code></td><td><code>number</code></td><td>0</td><td>Non</td><td>Valeur minimale de l&apos;échelle.</td></tr>
          <tr><td><code>max</code></td><td><code>number</code></td><td>100</td><td>Non</td><td>Valeur maximale de l&apos;échelle.</td></tr>
          <tr><td><code>warningAbove</code></td><td><code>number</code></td><td>—</td><td>Non</td><td>Seuil d&apos;avertissement : début de la zone jaune (nécessite aussi <code>criticalAbove</code> pour dessiner les zones).</td></tr>
          <tr><td><code>criticalAbove</code></td><td><code>number</code></td><td>—</td><td>Non</td><td>Seuil critique : début de la zone rouge.</td></tr>
          <tr><td><code>size</code></td><td><code>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</code></td><td>md</td><td>Non</td><td>Taille de la jauge (160 / 220 / 280 px de large).</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Libellé affiché sous la jauge.</td></tr>
          <tr><td><code>context</code></td><td><code>&#123; reference, direction, comparisonFrame?, neutralBand? &#125;</code></td><td>—</td><td>Non</td><td>Contexte de jugement : la valeur affichée prend la couleur du jugement, écart au repère et tendance révélés sous la jauge. Additif : sans <code>context</code>, rendu inchangé.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={'bpm.live_gauge(value=72, warning_above=70, critical_above=90, label="Charge CPU (%)")'}
        language="python"
      />
      <CodeBlock
        code={'# Débit d\'une ligne de production (pièces/h), échelle personnalisée\nbpm.live_gauge(value=412, min=0, max=600, warning_above=480, critical_above=550, label="Débit ligne 2 (pcs/h)", size="lg")'}
        language="python"
      />
      <CodeBlock
        code={'# Sans seuils : arc unique couleur accent\nbpm.live_gauge(value=63, label="Taux d\'occupation (%)", size="sm")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
