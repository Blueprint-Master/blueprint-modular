"use client";

import { useState } from "react";
import Link from "next/link";
import { OrgChart, CodeBlock } from "@/components/bpm";
import type { OrgChartNode } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const ORG_NODES: OrgChartNode[] = [
  { id: "dg", name: "Claire Fontaine", role: "Directrice générale" },
  { id: "dirops", name: "Marc Lefebvre", role: "Directeur des opérations", parentId: "dg" },
  { id: "dircom", name: "Sophie Bernard", role: "Directrice commerciale", parentId: "dg" },
  { id: "dirfin", name: "Antoine Moreau", role: "Directeur financier", parentId: "dg" },
  { id: "prod", name: "Julie Garnier", role: "Responsable production", parentId: "dirops" },
  { id: "log", name: "Karim Haddad", role: "Responsable logistique", parentId: "dirops" },
  { id: "ventes", name: "Élodie Petit", role: "Responsable ventes France", parentId: "dircom" },
  { id: "export", name: "Nicolas Roy", role: "Responsable export", parentId: "dircom" },
  { id: "compta", name: "Isabelle Marchand", role: "Cheffe comptable", parentId: "dirfin" },
];

export default function DocOrgChartPage() {
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [expandable, setExpandable] = useState(false);
  const [rootId, setRootId] = useState<string>("");
  const [selected, setSelected] = useState<OrgChartNode | null>(null);

  const pyNodes = ORG_NODES.map((n) => {
    const fields = [`"id": "${n.id}"`, `"name": "${n.name}"`];
    if (n.role) fields.push(`"role": "${n.role}"`);
    if (n.parentId) fields.push(`"parentId": "${n.parentId}"`);
    return `    {${fields.join(", ")}},`;
  }).join("\n");
  const args: string[] = ["nodes=nodes"];
  if (direction !== "vertical") args.push(`direction="${direction}"`);
  if (expandable) args.push("expandable=True");
  if (rootId) args.push(`root_id="${rootId}"`);
  const pythonCode = `nodes = [\n${pyNodes}\n]\nbpm.orgChart(${args.join(", ")})`;
  const { prev, next } = getPrevNext("orgchart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.orgChart
        </div>
        <h1>bpm.orgChart</h1>
        <p className="doc-description">
          Organigramme hiérarchique HTML/CSS, repliable. Construit l&apos;arbre à partir d&apos;une liste
          plate de nœuds reliés par <code>parentId</code>.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <OrgChart
              key={`${direction}-${expandable}-${rootId}`}
              nodes={ORG_NODES}
              direction={direction}
              expandable={expandable}
              rootId={rootId || undefined}
              onNodeClick={setSelected}
            />
            <p className="mt-2 text-sm" aria-live="polite">
              {selected
                ? `Nœud sélectionné : ${selected.name}${selected.role ? ` — ${selected.role}` : ""}`
                : "Cliquez sur un nœud pour le sélectionner."}
            </p>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as "vertical" | "horizontal")}>
              <option value="vertical">vertical (haut → bas)</option>
              <option value="horizontal">horizontal (gauche → droite)</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>expandable</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={expandable} onChange={(e) => setExpandable(e.target.checked)} />
              Nœuds repliables (▾ pour déplier chaque équipe)
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>rootId (optionnel — limite la profondeur affichée)</label>
            <select value={rootId} onChange={(e) => { setRootId(e.target.value); setSelected(null); }}>
              <option value="">Arbre complet (direction générale)</option>
              <option value="dirops">dirops — Direction des opérations</option>
              <option value="dircom">dircom — Direction commerciale</option>
              <option value="dirfin">dirfin — Direction financière</option>
            </select>
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
          <tr><td><code>nodes</code></td><td><code>&#123; id, name, role?, avatar?, parentId?, metadata? &#125;[]</code></td><td>—</td><td>Oui</td><td>Liste plate des nœuds ; l&apos;arbre est reconstruit via <code>parentId</code>. Un nœud sans parent est une racine.</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;vertical&quot; | &quot;horizontal&quot;</code></td><td>vertical</td><td>Non</td><td>Sens de l&apos;arbre : haut → bas ou gauche → droite.</td></tr>
          <tr><td><code>onNodeClick</code></td><td><code>(node: OrgChartNode) =&gt; void</code></td><td>—</td><td>Non</td><td>Callback au clic sur une carte (le nœud cliqué est passé en argument).</td></tr>
          <tr><td><code>expandable</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affiche un chevron sur les nœuds ayant des enfants pour replier/déplier leur équipe.</td></tr>
          <tr><td><code>rootId</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Id du nœud à utiliser comme racine (affiche uniquement son sous-arbre).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS additionnelles.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={'bpm.orgChart(nodes=[\n    {"id": "dg", "name": "Claire Fontaine", "role": "Directrice générale"},\n    {"id": "dirops", "name": "Marc Lefebvre", "role": "Directeur des opérations", "parentId": "dg"},\n])'}
        language="python"
      />
      <CodeBlock
        code={'bpm.orgChart(nodes=nodes, direction="horizontal", expandable=True)'}
        language="python"
      />
      <CodeBlock
        code={'bpm.orgChart(nodes=nodes, root_id="dircom", on_node_click=ouvrir_fiche_employe)'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
