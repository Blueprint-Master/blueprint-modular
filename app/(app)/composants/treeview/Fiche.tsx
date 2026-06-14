"use client";

import { useState } from "react";
import Link from "next/link";
import { Treeview } from "@/components/bpm";
import type { TreeviewNode } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Arborescence d'un projet front (src/) — noms de fichiers/dossiers techniques, identiques dans les deux langues
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

const L = {
  fr: {
    breadcrumb: "Composants",
    description: "Arbre de noeuds repliables et sélectionnables. Démo : arborescence d'un projet front (src/, components/, hooks/…).",
    category: "Affichage de données",
    selected: "Sélectionné :",
    copy: "Copier",
    descNodes: "Noeuds { id, label, children?, defaultOpen? }.",
    descSelectedId: "ID du noeud sélectionné.",
    descOnSelect: "Callback (node).",
  },
  en: {
    breadcrumb: "Components",
    description: "Tree of collapsible, selectable nodes. Demo: a front-end project tree (src/, components/, hooks/…).",
    category: "Data display",
    selected: "Selected:",
    copy: "Copy",
    descNodes: "Nodes { id, label, children?, defaultOpen? }.",
    descSelectedId: "ID of the selected node.",
    descOnSelect: "Callback (node).",
  },
} as const;

export default function DocTreeviewPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pythonCode = 'bpm.treeview(nodes=[{"id": "src", "label": "src/", "children": [{"id": "src-components", "label": "components/", "children": [{"id": "btn", "label": "Button.tsx"}]}]}], on_select=...)';
  const { prev, next } = getPrevNext("treeview");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.treeview</div>
        <h1>bpm.treeview</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Treeview nodes={sampleNodes} selectedId={selectedId} onSelect={(n) => setSelectedId(n.id)} />
          {selectedId && <p className="mt-2 text-sm">{t.selected} {selectedId}</p>}
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>nodes</code></td><td>TreeviewNode[]</td><td>{t.descNodes}</td></tr>
          <tr><td><code>selectedId</code></td><td>string | null</td><td>{t.descSelectedId}</td></tr>
          <tr><td><code>onSelect</code></td><td>function</td><td>{t.descOnSelect}</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
