"use client";

import { useState } from "react";
import Link from "next/link";
import { Autocomplete } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const opts = [
  { value: "paris", label: "Paris" },
  { value: "lyon", label: "Lyon" },
  { value: "marseille", label: "Marseille" },
  { value: "bordeaux", label: "Bordeaux" },
  { value: "nantes", label: "Nantes" },
];

export default function DocAutocompletePage() {
  const [value, setValue] = useState("");
  const { prev, next } = getPrevNext("autocomplete");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.autocomplete</div>
        <h1>bpm.autocomplete</h1>
        <p className="doc-description">Champ de saisie avec suggestions.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Interaction</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ maxWidth: 280 }}>
          <Autocomplete label="Ville" placeholder="Rechercher..." value={value} onChange={setValue} options={opts} />
        </div>
        <div className="sandbox-code">
          <pre><code>bpm.autocomplete(options=[...], value=..., onChange=...)</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th></tr></thead>
        <tbody>
          <tr><td>options</td><td>AutocompleteOption[]</td></tr>
          <tr><td>value</td><td>string</td></tr>
          <tr><td>onChange</td><td>(value: string) =&gt; void</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
