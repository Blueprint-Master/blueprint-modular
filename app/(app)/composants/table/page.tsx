"use client";

import { useState } from "react";
import Link from "next/link";
import { Table, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "Affichage de données",
  statInStock: "En stock",
  statLowStock: "Stock bas",
  statOutOfStock: "Rupture",
  description: "Tableau de données avec tri, lignes alternées, survol et lignes cliquables pour accéder au détail.",
  copy: "Copier",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  colProduit: "Produit",
  colPrix: "Prix",
  colStock: "Stock",
  colStatut: "Statut",
  clickedRow: "Ligne cliquée :",
  clickHint: "Cliquez sur une ligne pour afficher le détail.",
  sortLabel: "Tri par défaut",
  sortNone: "Aucun",
  descColumns: "optionnel :",
  descColumnsCustom: "Cellule custom :",
  descData: "Lignes du tableau. Interdit : JSX dans",
  descDataEnd: "— utiliser",
  descDataEnd2: "sur la colonne.",
  descStriped: "Lignes alternées.",
  descHover: "Surbrillance au survol.",
  descOnRowClick: "Callback au clic sur une ligne.",
  descDefaultSortColumn: "Colonne de tri initiale.",
  descDefaultSortDirection: "Direction du tri initial.",
  descValueLocale: "Locale pour formater les nombres (ex. fr-FR → 1 000,50, en-US → 1,000.50).",
  descValueDecimals: "Décimales par défaut pour les cellules numériques. Surcharge possible par colonne (",
  descValueDecimalsEnd: ").",
  descValueGrouping: "Séparateur de milliers (false = 1000,50 sans espace).",
  emptyDefault: "« Aucune donnée disponible »",
  descEmptyMessage: "Message si",
  descEmptyMessageEnd: "vide.",
  descMisc: "Contexte IA, largeur min., clé de ligne, etc.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "Data display",
  statInStock: "In stock",
  statLowStock: "Low stock",
  statOutOfStock: "Out of stock",
  description: "Data table with sorting, striped rows, hover and clickable rows to access details.",
  copy: "Copy",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  colProduit: "Product",
  colPrix: "Price",
  colStock: "Stock",
  colStatut: "Status",
  clickedRow: "Clicked row:",
  clickHint: "Click a row to display the details.",
  sortLabel: "Default sort",
  sortNone: "None",
  descColumns: "optional:",
  descColumnsCustom: "Custom cell:",
  descData: "Table rows. Forbidden: JSX inside",
  descDataEnd: "— use",
  descDataEnd2: "on the column.",
  descStriped: "Striped rows.",
  descHover: "Highlight on hover.",
  descOnRowClick: "Callback when a row is clicked.",
  descDefaultSortColumn: "Initial sort column.",
  descDefaultSortDirection: "Initial sort direction.",
  descValueLocale: "Locale used to format numbers (e.g. fr-FR → 1 000,50, en-US → 1,000.50).",
  descValueDecimals: "Default decimals for numeric cells. Can be overridden per column (",
  descValueDecimalsEnd: ").",
  descValueGrouping: "Thousands separator (false = 1000,50 without space).",
  emptyDefault: "“No data available”",
  descEmptyMessage: "Message if",
  descEmptyMessageEnd: "is empty.",
  descMisc: "AI context, min width, row key, etc.",
};
const L = { fr, en } as const;

export default function DocTablePage() {
  const { locale } = useI18n();
  const t = L[locale];

  const DEMO_DATA = [
    { Produit: "Widget A", Prix: 29.99, Stock: 142, Statut: t.statInStock },
    { Produit: "Widget B", Prix: 49.99, Stock: 38, Statut: t.statLowStock },
    { Produit: "Widget C", Prix: 9.99, Stock: 500, Statut: t.statInStock },
    { Produit: "Widget D", Prix: 79.99, Stock: 0, Statut: t.statOutOfStock },
    { Produit: "Widget E", Prix: 19.99, Stock: 210, Statut: t.statInStock },
  ];

  const COLUMNS = [
    { key: "Produit", label: t.colProduit },
    { key: "Prix", label: t.colPrix, decimals: 2 },
    { key: "Stock", label: t.colStock },
    { key: "Statut", label: t.colStatut },
  ];

  const [striped, setStriped] = useState(true);
  const [hover, setHover] = useState(true);
  const [defaultSortColumn, setDefaultSortColumn] = useState<string | null>("Produit");
  const [selectedRow, setSelectedRow] = useState<Record<string, unknown> | null>(null);
  const [valueLocale, setValueLocale] = useState<"fr-FR" | "en-US" | "de-DE">("fr-FR");
  const [valueDecimals, setValueDecimals] = useState(0);
  const [valueGrouping, setValueGrouping] = useState(true);

  const pythonCode =
    "import bpm\nimport pandas as pd\n\ndf = pd.DataFrame({\n  \"Produit\": [\"Widget A\", \"Widget B\", \"Widget C\"],\n  \"Prix\": [29.99, 49.99, 9.99],\n  \"Stock\": [142, 38, 500],\n})\n\nbpm.table(df, striped=" +
    String(striped) +
    ", hover=" +
    String(hover) +
    (valueLocale !== "fr-FR" ? `, value_locale="${valueLocale}"` : "") +
    (valueDecimals !== 0 ? `, value_decimals=${valueDecimals}` : "") +
    (!valueGrouping ? ", value_grouping=False" : "") +
    ")";

  const { prev, next } = getPrevNext("table");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.table</div>
        <h1>bpm.table</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          {/* w-full : la légende et l'encart se placent SOUS le tableau (et non à sa droite),
              le conteneur d'aperçu étant en flex centré. */}
          <div className="w-full">
            <Table
              columns={COLUMNS}
              data={DEMO_DATA}
              striped={striped}
              hover={hover}
              defaultSortColumn={defaultSortColumn}
              defaultSortDirection="asc"
              onRowClick={(row) => setSelectedRow(row)}
              valueLocale={valueLocale}
              valueDecimals={valueDecimals}
              valueGrouping={valueGrouping}
            />
            {selectedRow && (
              <div className="mt-3 p-3 rounded-lg text-sm border" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)" }}>
                <strong>{t.clickedRow}</strong> {String(selectedRow.Produit ?? "")} — {String(selectedRow.Prix ?? "")} € — {t.colStock} {String(selectedRow.Stock ?? "")} — {String(selectedRow.Statut ?? "")}
              </div>
            )}
            {!selectedRow && (
              <p className="mt-2 text-xs" style={{ color: "var(--bpm-text-secondary)" }}>{t.clickHint}</p>
            )}
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>striped</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={striped}
                onChange={(e) => setStriped(e.target.checked)}
              />
              {striped ? t.yes : t.no}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>hover</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={hover}
                onChange={(e) => setHover(e.target.checked)}
              />
              {hover ? t.yes : t.no}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>{t.sortLabel}</label>
            <select
              value={defaultSortColumn ?? ""}
              onChange={(e) => setDefaultSortColumn(e.target.value || null)}
            >
              <option value="">{t.sortNone}</option>
              <option value="Produit">{t.colProduit}</option>
              <option value="Prix">{t.colPrix}</option>
              <option value="Stock">{t.colStock}</option>
              <option value="Statut">{t.colStatut}</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueLocale</label>
            <select value={valueLocale} onChange={(e) => setValueLocale(e.target.value as "fr-FR" | "en-US" | "de-DE")}>
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
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pythonCode)}
            >
              {t.copy}
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>columns</code></td>
            <td><code>TableColumn[]</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>
              <code>key</code>, <code>label</code> ; {t.descColumns} <code>align</code>, <code>render</code> (pas <code>renderCell</code>),
              <code>decimals</code>, <code>noWrap</code>, <code>className</code>. {t.descColumnsCustom} <code>render: (value, row) =&gt; …</code>
            </td>
          </tr>
          <tr>
            <td><code>data</code></td>
            <td><code>Record&lt;string, unknown&gt;[]</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descData} <code>data[]</code> {t.descDataEnd} <code>render</code> {t.descDataEnd2}</td>
          </tr>
          <tr>
            <td><code>striped</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>{t.no}</td>
            <td>{t.descStriped}</td>
          </tr>
          <tr>
            <td><code>hover</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>{t.no}</td>
            <td>{t.descHover}</td>
          </tr>
          <tr>
            <td><code>onRowClick</code></td>
            <td><code>(row) =&gt; void</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descOnRowClick}</td>
          </tr>
          <tr>
            <td><code>defaultSortColumn</code></td>
            <td><code>string | null</code></td>
            <td><code>null</code></td>
            <td>{t.no}</td>
            <td>{t.descDefaultSortColumn}</td>
          </tr>
          <tr>
            <td><code>defaultSortDirection</code></td>
            <td><code>&apos;asc&apos; | &apos;desc&apos;</code></td>
            <td><code>&apos;asc&apos;</code></td>
            <td>{t.no}</td>
            <td>{t.descDefaultSortDirection}</td>
          </tr>
          <tr>
            <td><code>valueLocale</code></td>
            <td><code>string</code></td>
            <td>fr-FR</td>
            <td>{t.no}</td>
            <td>{t.descValueLocale}</td>
          </tr>
          <tr>
            <td><code>valueDecimals</code></td>
            <td><code>number</code></td>
            <td>0</td>
            <td>{t.no}</td>
            <td>{t.descValueDecimals}<code>decimals</code>{t.descValueDecimalsEnd}</td>
          </tr>
          <tr>
            <td><code>valueGrouping</code></td>
            <td><code>boolean</code></td>
            <td>true</td>
            <td>{t.no}</td>
            <td>{t.descValueGrouping}</td>
          </tr>
          <tr>
            <td><code>emptyMessage</code></td>
            <td><code>string</code></td>
            <td>{t.emptyDefault}</td>
            <td>{t.no}</td>
            <td>{t.descEmptyMessage} <code>data</code> {t.descEmptyMessageEnd}</td>
          </tr>
          <tr>
            <td><code>name</code>, <code>keyColumn</code>, <code>minWidth</code>, <code>trackContext</code>, <code>className</code></td>
            <td>voir <code>Table.tsx</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descMisc}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={"bpm.table(df, striped=True, hover=True)\n# Clic sur une ligne pour ouvrir le détail\nbpm.table(df, on_row_click=lambda row: bpm.write(row[\"id\"]))"}
        language="python"
      />
      <CodeBlock
        code={'# Tri initial par colonne "Prix" décroissant\nbpm.table(df, default_sort_column="Prix", default_sort_direction="desc")'}
        language="python"
      />
      <CodeBlock
        code={'# Format des nombres (comme bpm.metric)\nbpm.table(df, value_locale="en-US", value_decimals=2, value_grouping=True)'}
        language="python"
      />
      <CodeBlock
        code={'# Alignement par colonne (left | center | right)\nbpm.table(df, columns=[{"key": "Nom", "label": "Nom"}, {"key": "Montant", "label": "Montant", "align": "right"}])'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={"/composants/" + prev}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={"/composants/" + next}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
