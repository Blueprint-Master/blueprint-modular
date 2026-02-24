"use client";

import { useState } from "react";
import Link from "next/link";
import { Treeview } from "@/components/bpm";
import type { TreeviewNode } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const sampleNodes: TreeviewNode[] = [
  { id: "1", label: "Racine", defaultOpen: true, children: [
    { id: "1-1", label: "Dossier A", children: [
      { id: "1-1-1", label: "Fichier 1" },
      { id: "1-1-2", label: "Fichier 2" },
    ]},
    { id: "1-2", label: "Dossier B", children: [{ id: "1-2-1", label: "Fichier 3" }] },
  ]},
  { id: "2", label: "Autre noeud" },
];

export default function DocTreeviewPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pythonCode = "bpm.treeview(nodes=[...], on_select=...)";
  const { prev, next } = getPrevNext("treeview");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.treeview</div>
        <h1>bpm.treeview</h1>
        <p className="doc-description">Arbre de noeuds repliables et sélectionnables.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Affichage de données</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Treeview nodes={sampleNodes} selectedId={selectedId} onSelect={(n) => setSelectedId(n.id)} />
          {selectedId && <p className="mt-2 text-sm">Sélectionné: {selectedId}</p>}
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>nodes</code></td><td>TreeviewNode[]</td><td>Noeuds {`{ id, label, children?, defaultOpen? }`}.</td></tr>
          <tr><td><code>selectedId</code></td><td>string | null</td><td>ID du noeud sélectionné.</td></tr>
          <tr><td><code>onSelect</code></td><td>function</td><td>Callback (node).</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
