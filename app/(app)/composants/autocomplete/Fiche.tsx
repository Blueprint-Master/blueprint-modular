"use client";

import { useState } from "react";
import Link from "next/link";
import { Autocomplete, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const opts = [
  { value: "paris", label: "Paris" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "nantes", label: "Nantes" },
  { value: "toulouse", label: "Toulouse" },
  { value: "lille", label: "Lille" },
  { value: "strasbourg", label: "Strasbourg" },
];

const fr = {
  components: "Composants",
  category: "Interaction",
  description: "Champ de saisie avec suggestions (liste filtrée). Idéal pour recherche de ville, produit, etc.",
  cityLabel: "Ville",
  searchPlaceholder: "Rechercher...",
  valueDisplayed: "value (affiché)",
  valuePlaceholder: "Valeur",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descOptions: "Liste des options",
  descValue: "Valeur courante (contrôlée).",
  descOnChange: "Callback à la sélection ou saisie.",
  descLabel: "Libellé au-dessus du champ.",
  descPlaceholder: "Texte d’indication dans le champ.",
  descClassName: "Classes CSS additionnelles.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  category: "Interaction",
  description: "Input field with suggestions (filtered list). Ideal for searching a city, product, etc.",
  cityLabel: "City",
  searchPlaceholder: "Search...",
  valueDisplayed: "value (displayed)",
  valuePlaceholder: "Value",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descOptions: "List of options",
  descValue: "Current value (controlled).",
  descOnChange: "Callback on selection or input.",
  descLabel: "Label above the field.",
  descPlaceholder: "Hint text inside the field.",
  descClassName: "Additional CSS classes.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocAutocompletePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState("");
  const { prev, next } = getPrevNext("autocomplete");

  const escapedValue = value.replace(/"/g, '\\"');
  const pythonCode = `bpm.autocomplete(options=[...], value="${escapedValue}", onChange=...)`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.autocomplete
        </div>
        <h1>bpm.autocomplete</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview" style={{ maxWidth: 280 }}>
          <Autocomplete
            label={t.cityLabel}
            placeholder={t.searchPlaceholder}
            value={value}
            onChange={setValue}
            options={opts}
          />
        </div>
        <div className="sandbox-controls mt-3">
          <div className="sandbox-control-group">
            <label>{t.valueDisplayed}</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.valuePlaceholder} readOnly className="opacity-80" />
          </div>
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>options</code></td>
            <td><code>AutocompleteOption[]</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descOptions} ({`{ value, label }`}).</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>{t.no}</td>
            <td>{t.descValue}</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>(value: string) =&gt; void</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descOnChange}</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descLabel}</td>
          </tr>
          <tr>
            <td><code>placeholder</code></td>
            <td><code>string</code></td>
            <td>&quot;&quot;</td>
            <td>{t.no}</td>
            <td>{t.descPlaceholder}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descClassName}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.autocomplete(label="Ville", options=[{"value": "paris", "label": "Paris"}, ...], value=..., onChange=...)'} language="python" />
      <CodeBlock code={'bpm.autocomplete(placeholder="Rechercher un produit...", options=product_options)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
