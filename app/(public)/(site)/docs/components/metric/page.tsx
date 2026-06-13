"use client";

import { useState } from "react";
import Link from "next/link";
import { Metric, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type DeltaType = "aucun" | "normal" | "inverse";

type ValueLocaleOption = "fr-FR" | "en-US" | "de-DE";

export default function DocMetricPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Affiche une métrique avec valeur, label et delta optionnel (évolution).",
    category: "Affichage de données",
    demoLabel: "Chiffre d'affaires",
    deltaLabel: "delta (optionnel)",
    deltaPlaceholder: "vide = pas de delta",
    nameLabel: "name (pour $metric:… ou @)",
    namePlaceholder: "ex. ca — référence IA",
    unitLabel: "Unité",
    unitNone: "Aucune",
    unitPercent: "% (pourcentage)",
    borderTrue: "true (avec bordure)",
    borderFalse: "false (sans bordure)",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    examples: "Exemples",
    rows: {
      label: "Libellé de la métrique.",
      value: "Valeur affichée.",
      delta: "Évolution (+ / -).",
      deltaType: "Interprétation du delta (aucun = pas de couleur).",
      name: "Nom pour référencer la métrique dans le chat IA",
      currency: "Unité pour le delta (vide = aucune, %  = pourcentage, EUR, USD, …).",
      valueLocale: "Locale pour formater value et delta (ex. fr-FR → 1 000,50, en-US → 1,000.50).",
      valueDecimals: "Nombre de décimales pour la valeur.",
      valueGrouping: "Séparateur de milliers (false = 1000,50 sans espace).",
      border: "Afficher la bordure autour de la métrique (false = pas de bordure).",
    },
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Displays a metric with a value, label and optional delta (change).",
    category: "Data display",
    demoLabel: "Revenue",
    deltaLabel: "delta (optional)",
    deltaPlaceholder: "empty = no delta",
    nameLabel: "name (for $metric:… or @)",
    namePlaceholder: "e.g. revenue — AI reference",
    unitLabel: "Unit",
    unitNone: "None",
    unitPercent: "% (percentage)",
    borderTrue: "true (with border)",
    borderFalse: "false (no border)",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    examples: "Examples",
    rows: {
      label: "Metric label.",
      value: "Displayed value.",
      delta: "Change (+ / -).",
      deltaType: "Delta interpretation (aucun = no color).",
      name: "Name to reference the metric in the AI chat",
      currency: "Unit for the delta (empty = none, % = percentage, EUR, USD, …).",
      valueLocale: "Locale to format value and delta (e.g. fr-FR → 1 000,50, en-US → 1,000.50).",
      valueDecimals: "Number of decimals for the value.",
      valueGrouping: "Thousands separator (false = 1000,50 without spacing).",
      border: "Show the border around the metric (false = no border).",
    },
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [label, setLabel] = useState(t.demoLabel);
  const [value, setValue] = useState(142500);
  const [delta, setDelta] = useState<number | null>(-500);
  const [name, setName] = useState("");
  const [deltaType, setDeltaType] = useState<DeltaType>("normal");
  const [currency, setCurrency] = useState("EUR");
  const [valueLocale, setValueLocale] = useState<ValueLocaleOption>("fr-FR");
  const [valueDecimals, setValueDecimals] = useState(0);
  const [valueGrouping, setValueGrouping] = useState(true);
  const [border, setBorder] = useState(true);

  const escapedLabel = label.replace(/"/g, '\\"');
  const pyDelta = delta ?? "None";
  const pyName = name.trim() ? `, name="${name.trim().replace(/"/g, '\\"')}"` : "";
  const pyDeltaType = deltaType !== "normal" ? `, deltaType="${deltaType}"` : "";
  const pyCurrency = currency === "" ? `, currency=""` : currency !== "EUR" ? `, currency="${currency.replace(/"/g, '\\"')}"` : "";
  const pyValueLocale = valueLocale !== "fr-FR" ? `, valueLocale="${valueLocale}"` : "";
  const pyValueDecimals = valueDecimals !== 0 ? `, valueDecimals=${valueDecimals}` : "";
  const pyValueGrouping = !valueGrouping ? `, valueGrouping=False` : "";
  const pyBorder = !border ? `, border=False` : "";
  const pythonCode = `bpm.metric(label="${escapedLabel}", value=${value}, delta=${pyDelta}${pyName}${pyDeltaType}${pyCurrency}${pyValueLocale}${pyValueDecimals}${pyValueGrouping}${pyBorder})`;
  const { prev, next } = getPrevNext("metric");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.metric</div>
        <h1>bpm.metric</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Metric
            label={label}
            value={value}
            delta={delta ?? undefined}
            name={name.trim() || undefined}
            deltaType={deltaType}
            currency={currency}
            valueLocale={valueLocale}
            valueDecimals={valueDecimals}
            valueGrouping={valueGrouping}
            border={border}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value) || 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.deltaLabel}</label>
            <input
              type="number"
              value={delta ?? ""}
              onChange={(e) => setDelta(e.target.value === "" ? null : Number(e.target.value))}
              placeholder={t.deltaPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.nameLabel}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>deltaType</label>
            <select value={deltaType} onChange={(e) => setDeltaType(e.target.value as DeltaType)}>
              <option value="aucun">aucun</option>
              <option value="normal">normal</option>
              <option value="inverse">inverse</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>{t.unitLabel}</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="">{t.unitNone}</option>
              <option value="%">{t.unitPercent}</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueLocale</label>
            <select value={valueLocale} onChange={(e) => setValueLocale(e.target.value as ValueLocaleOption)}>
              <option value="fr-FR">fr-FR (1 000,50)</option>
              <option value="en-US">en-US (1,000.50)</option>
              <option value="de-DE">de-DE (1.000,50)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueDecimals</label>
            <input
              type="number"
              min={0}
              max={10}
              value={valueDecimals}
              onChange={(e) => setValueDecimals(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>valueGrouping</label>
            <select value={valueGrouping ? "true" : "false"} onChange={(e) => setValueGrouping(e.target.value === "true")}>
              <option value="true">true (1 000,50)</option>
              <option value="false">false (1000,50)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>border</label>
            <select value={border ? "true" : "false"} onChange={(e) => setBorder(e.target.value === "true")}>
              <option value="true">{t.borderTrue}</option>
              <option value="false">{t.borderFalse}</option>
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
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.label}</td></tr>
          <tr><td><code>value</code></td><td><code>string | number</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.value}</td></tr>
          <tr><td><code>delta</code></td><td><code>number | null</code></td><td>—</td><td>{t.no}</td><td>{t.rows.delta}</td></tr>
          <tr><td><code>deltaType</code></td><td><code>aucun | normal | inverse</code></td><td>normal</td><td>{t.no}</td><td>{t.rows.deltaType}</td></tr>
          <tr><td><code>name</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.name} (<code>$metric:name</code> {locale === "en" ? "or" : "ou"} <code>@name</code>).</td></tr>
          <tr><td><code>currency</code></td><td><code>string</code></td><td>EUR</td><td>{t.no}</td><td>{t.rows.currency}</td></tr>
          <tr><td><code>valueLocale</code></td><td><code>string</code></td><td>fr-FR</td><td>{t.no}</td><td>{t.rows.valueLocale}</td></tr>
          <tr><td><code>valueDecimals</code></td><td><code>number</code></td><td>0</td><td>{t.no}</td><td>{t.rows.valueDecimals}</td></tr>
          <tr><td><code>valueGrouping</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.rows.valueGrouping}</td></tr>
          <tr><td><code>border</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.rows.border}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.metric("CA", 142500, delta=3200)\nbpm.metric("NPS", 72, delta=-3)'} language="python" />
      <CodeBlock code={'bpm.metric("Chiffre d\'affaires", 142500, delta=-500, name="ca")  # référençable en IA via $metric:ca ou @ca'} language="python" />
      <CodeBlock code={'bpm.metric("Taux", "98%", delta=2)'} language="python" />
      <CodeBlock code={'bpm.metric("Coût", 1500, delta=-100, deltaType="inverse")'} language="python" />
      <CodeBlock code={'bpm.metric("CA", 142500.5, valueLocale="en-US", valueDecimals=2)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
