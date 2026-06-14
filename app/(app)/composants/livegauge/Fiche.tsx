"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiveGauge, CodeBlock } from "@/components/bpm";
import type { LiveGaugeSize } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const frDict = {
  breadcrumb: "Composants",
  description: (
    <>
      Jauge demi-cercle avec aiguille et zones colorées normal / avertissement / critique.
      Pensée pour le monitoring d&apos;une grandeur bornée : charge CPU, débit d&apos;une ligne
      de production, taux d&apos;occupation… Les seuils <code>warningAbove</code> et{" "}
      <code>criticalAbove</code> dessinent les zones jaune et rouge sur l&apos;arc.
    </>
  ),
  category: "Affichage de données",
  rangeTo: "à",
  warningLabel: "warningAbove (vide = aucun)",
  warningPlaceholder: "ex. 70",
  criticalLabel: "criticalAbove (vide = aucun)",
  criticalPlaceholder: "ex. 90",
  gaugeDefaultLabel: "Charge CPU (%)",
  liveLabel: "Simulation temps réel (la valeur fluctue toutes les 1,2 s)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  propValue: (
    <>
      Valeur actuelle, ou trajectoire v(t) (l&apos;aiguille pointe le dernier point ; tendance
      jugée si <code>context</code> est fourni).
    </>
  ),
  propMin: <>Valeur minimale de l&apos;échelle.</>,
  propMax: <>Valeur maximale de l&apos;échelle.</>,
  propWarning: (
    <>
      Seuil d&apos;avertissement : début de la zone jaune (nécessite aussi{" "}
      <code>criticalAbove</code> pour dessiner les zones).
    </>
  ),
  propCritical: <>Seuil critique : début de la zone rouge.</>,
  propSize: <>Taille de la jauge (160 / 220 / 280 px de large).</>,
  propLabel: <>Libellé affiché sous la jauge.</>,
  propContext: (
    <>
      Contexte de jugement : la valeur affichée prend la couleur du jugement, écart au repère et
      tendance révélés sous la jauge. Additif : sans <code>context</code>, rendu inchangé.
    </>
  ),
  propClassName: <>Classes CSS additionnelles.</>,
};

const enDict: typeof frDict = {
  breadcrumb: "Components",
  description: (
    <>
      Half-circle gauge with a needle and colored normal / warning / critical zones.
      Designed for monitoring a bounded quantity: CPU load, production line throughput,
      occupancy rate… The <code>warningAbove</code> and <code>criticalAbove</code> thresholds
      draw the yellow and red zones on the arc.
    </>
  ),
  category: "Data display",
  rangeTo: "to",
  warningLabel: "warningAbove (empty = none)",
  warningPlaceholder: "e.g. 70",
  criticalLabel: "criticalAbove (empty = none)",
  criticalPlaceholder: "e.g. 90",
  gaugeDefaultLabel: "CPU load (%)",
  liveLabel: "Live simulation (the value fluctuates every 1.2 s)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  propValue: (
    <>
      Current value, or a v(t) trajectory (the needle points at the last point; the trend is
      judged when <code>context</code> is provided).
    </>
  ),
  propMin: <>Minimum value of the scale.</>,
  propMax: <>Maximum value of the scale.</>,
  propWarning: (
    <>
      Warning threshold: start of the yellow zone (also requires <code>criticalAbove</code> to
      draw the zones).
    </>
  ),
  propCritical: <>Critical threshold: start of the red zone.</>,
  propSize: <>Gauge size (160 / 220 / 280 px wide).</>,
  propLabel: <>Label displayed below the gauge.</>,
  propContext: (
    <>
      Judgment context: the displayed value takes the judgment color, with the gap to the
      reference and the trend revealed below the gauge. Additive: without <code>context</code>,
      rendering is unchanged.
    </>
  ),
  propClassName: <>Additional CSS classes.</>,
};

const L = { fr: frDict, en: enDict } as const;

export default function DocLiveGaugePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState(72);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [warningStr, setWarningStr] = useState("70");
  const [criticalStr, setCriticalStr] = useState("90");
  const [labelStr, setLabelStr] = useState(L.fr.gaugeDefaultLabel);
  const [size, setSize] = useState<LiveGaugeSize>("md");
  const [live, setLive] = useState(false);

  // Le libellé de démo suit la langue tant qu'il n'a pas été personnalisé.
  const label =
    labelStr === L.fr.gaugeDefaultLabel || labelStr === L.en.gaugeDefaultLabel
      ? t.gaugeDefaultLabel
      : labelStr;

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
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.liveGauge
        </div>
        <h1>bpm.liveGauge</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
            <label>value ({min} {t.rangeTo} {max})</label>
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
            <label>{t.warningLabel}</label>
            <input
              type="number"
              value={warningStr}
              onChange={(e) => setWarningStr(e.target.value)}
              placeholder={t.warningPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.criticalLabel}</label>
            <input
              type="number"
              value={criticalStr}
              onChange={(e) => setCriticalStr(e.target.value)}
              placeholder={t.criticalPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabelStr(e.target.value)}
              placeholder={t.gaugeDefaultLabel}
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
              {t.liveLabel}
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
          <tr><td><code>value</code></td><td><code>number | &#123; t, v &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.propValue}</td></tr>
          <tr><td><code>min</code></td><td><code>number</code></td><td>0</td><td>{t.no}</td><td>{t.propMin}</td></tr>
          <tr><td><code>max</code></td><td><code>number</code></td><td>100</td><td>{t.no}</td><td>{t.propMax}</td></tr>
          <tr><td><code>warningAbove</code></td><td><code>number</code></td><td>—</td><td>{t.no}</td><td>{t.propWarning}</td></tr>
          <tr><td><code>criticalAbove</code></td><td><code>number</code></td><td>—</td><td>{t.no}</td><td>{t.propCritical}</td></tr>
          <tr><td><code>size</code></td><td><code>&quot;sm&quot; | &quot;md&quot; | &quot;lg&quot;</code></td><td>md</td><td>{t.no}</td><td>{t.propSize}</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propLabel}</td></tr>
          <tr><td><code>context</code></td><td><code>&#123; reference, direction, comparisonFrame?, neutralBand? &#125;</code></td><td>—</td><td>{t.no}</td><td>{t.propContext}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
