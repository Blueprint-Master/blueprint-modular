"use client";

import { useState } from "react";
import Link from "next/link";
import { Treeview } from "@/components/bpm";
import type { TreeviewNode } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

// Arborescence d'un projet front (src/)
const sampleNodes: TreeviewNode[] = [
  { id: "src", label: "src/", defaultOpen: true, children: [
    { id: "src-components", label: "components/", defaultOpen: true, children: [
      { id: "src-components-button", label: "Button.tsx" },
      { id: "src-components-modal", label: "Modal.tsx" },
      { id: "src-components-navbar", label: "Navbar.tsx" },
    ]},
    { id: "src-hooks", label: "hooks/", children: [
      { id: "src-hooks-useauth", label: "useAuth.ts" },
      { id: "src-hooks-usefetch", label: "useFetch.ts" },
    ]},
    { id: "src-lib", label: "lib/", children: [{ id: "src-lib-api", label: "api.ts" }] },
    { id: "src-app", label: "App.tsx" },
  ]},
  { id: "package-json", label: "package.json" },
  { id: "tsconfig-json", label: "tsconfig.json" },
];

export default function DocTreeviewPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pythonCode = 'bpm.treeview(nodes=[{"id": "src", "label": "src/", "children": [{"id": "src-components", "label": "components/", "children": [{"id": "btn", "label": "Button.tsx"}]}]}], on_select=...)';
  const { prev, next } = getPrevNext("treeview");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.treeview</div>
        <h1>bpm.treeview</h1>
        <p className="doc-description">Arbre de noeuds repliables et sélectionnables. Démo : arborescence d&apos;un projet front (src/, components/, hooks/…).</p>
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
