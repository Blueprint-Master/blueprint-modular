"use client";

import { useState } from "react";
import Link from "next/link";
import { OrgChart, CodeBlock } from "@/components/bpm";
import type { OrgChartNode } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  desc1: "Organigramme hiérarchique HTML/CSS, repliable. Construit l'arbre à partir d'une liste plate de nœuds reliés par ",
  desc2: ".",
  category: "Mise en page",
  selectedPrefix: "Nœud sélectionné : ",
  clickHint: "Cliquez sur un nœud pour le sélectionner.",
  directionVertical: "vertical (haut → bas)",
  directionHorizontal: "horizontal (gauche → droite)",
  expandableText: "Nœuds repliables (▾ pour déplier chaque équipe)",
  rootIdLabel: "rootId (optionnel — limite la profondeur affichée)",
  fullTree: "Arbre complet (direction générale)",
  rootDirops: "dirops — Direction des opérations",
  rootDircom: "dircom — Direction commerciale",
  rootDirfin: "dirfin — Direction financière",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  nodesDesc1: "Liste plate des nœuds ; l'arbre est reconstruit via ",
  nodesDesc2: ". Un nœud sans parent est une racine.",
  directionDesc: "Sens de l'arbre : haut → bas ou gauche → droite.",
  onNodeClickDesc: "Callback au clic sur une carte (le nœud cliqué est passé en argument).",
  expandableDesc: "Affiche un chevron sur les nœuds ayant des enfants pour replier/déplier leur équipe.",
  rootIdDesc: "Id du nœud à utiliser comme racine (affiche uniquement son sous-arbre).",
  classNameDesc: "Classes CSS additionnelles.",
  examples: "Exemples",
  orgNodes: [
    { id: "dg", name: "Claire Fontaine", role: "Directrice générale" },
    { id: "dirops", name: "Marc Lefebvre", role: "Directeur des opérations", parentId: "dg" },
    { id: "dircom", name: "Sophie Bernard", role: "Directrice commerciale", parentId: "dg" },
    { id: "dirfin", name: "Antoine Moreau", role: "Directeur financier", parentId: "dg" },
    { id: "prod", name: "Julie Garnier", role: "Responsable production", parentId: "dirops" },
    { id: "log", name: "Karim Haddad", role: "Responsable logistique", parentId: "dirops" },
    { id: "ventes", name: "Élodie Petit", role: "Responsable ventes France", parentId: "dircom" },
    { id: "export", name: "Nicolas Roy", role: "Responsable export", parentId: "dircom" },
    { id: "compta", name: "Isabelle Marchand", role: "Cheffe comptable", parentId: "dirfin" },
  ] as OrgChartNode[],
};

const en: typeof fr = {
  breadcrumb: "Components",
  desc1: "Collapsible HTML/CSS hierarchical org chart. Builds the tree from a flat list of nodes linked by ",
  desc2: ".",
  category: "Layout",
  selectedPrefix: "Selected node: ",
  clickHint: "Click a node to select it.",
  directionVertical: "vertical (top → bottom)",
  directionHorizontal: "horizontal (left → right)",
  expandableText: "Collapsible nodes (▾ to expand each team)",
  rootIdLabel: "rootId (optional — limits the displayed depth)",
  fullTree: "Full tree (executive management)",
  rootDirops: "dirops — Operations division",
  rootDircom: "dircom — Sales division",
  rootDirfin: "dirfin — Finance division",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  nodesDesc1: "Flat list of nodes; the tree is rebuilt from ",
  nodesDesc2: ". A node without a parent is a root.",
  directionDesc: "Tree direction: top → bottom or left → right.",
  onNodeClickDesc: "Callback when a card is clicked (the clicked node is passed as argument).",
  expandableDesc: "Shows a chevron on nodes with children to collapse/expand their team.",
  rootIdDesc: "Id of the node to use as root (only its subtree is displayed).",
  classNameDesc: "Additional CSS classes.",
  examples: "Examples",
  orgNodes: [
    { id: "dg", name: "Claire Fontaine", role: "CEO" },
    { id: "dirops", name: "Marc Lefebvre", role: "Operations Director", parentId: "dg" },
    { id: "dircom", name: "Sophie Bernard", role: "Sales Director", parentId: "dg" },
    { id: "dirfin", name: "Antoine Moreau", role: "Finance Director", parentId: "dg" },
    { id: "prod", name: "Julie Garnier", role: "Production Manager", parentId: "dirops" },
    { id: "log", name: "Karim Haddad", role: "Logistics Manager", parentId: "dirops" },
    { id: "ventes", name: "Élodie Petit", role: "Sales Manager, France", parentId: "dircom" },
    { id: "export", name: "Nicolas Roy", role: "Export Manager", parentId: "dircom" },
    { id: "compta", name: "Isabelle Marchand", role: "Chief Accountant", parentId: "dirfin" },
  ] as OrgChartNode[],
};

const L = { fr, en } as const;

export default function DocOrgChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [direction, setDirection] = useState<"vertical" | "horizontal">("vertical");
  const [expandable, setExpandable] = useState(false);
  const [rootId, setRootId] = useState<string>("");
  const [selected, setSelected] = useState<OrgChartNode | null>(null);

  const ORG_NODES = t.orgNodes;
  const selectedNode = selected
    ? ORG_NODES.find((n) => n.id === selected.id) ?? selected
    : null;

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
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.orgChart
        </div>
        <h1>bpm.orgChart</h1>
        <p className="doc-description">
          {t.desc1}<code>parentId</code>{t.desc2}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <OrgChart
              key={`${locale}-${direction}-${expandable}-${rootId}`}
              nodes={ORG_NODES}
              direction={direction}
              expandable={expandable}
              rootId={rootId || undefined}
              onNodeClick={setSelected}
            />
            <p className="mt-2 text-sm" aria-live="polite">
              {selectedNode
                ? `${t.selectedPrefix}${selectedNode.name}${selectedNode.role ? ` — ${selectedNode.role}` : ""}`
                : t.clickHint}
            </p>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>direction</label>
            <select value={direction} onChange={(e) => setDirection(e.target.value as "vertical" | "horizontal")}>
              <option value="vertical">{t.directionVertical}</option>
              <option value="horizontal">{t.directionHorizontal}</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>expandable</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={expandable} onChange={(e) => setExpandable(e.target.checked)} />
              {t.expandableText}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>{t.rootIdLabel}</label>
            <select value={rootId} onChange={(e) => { setRootId(e.target.value); setSelected(null); }}>
              <option value="">{t.fullTree}</option>
              <option value="dirops">{t.rootDirops}</option>
              <option value="dircom">{t.rootDircom}</option>
              <option value="dirfin">{t.rootDirfin}</option>
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>{t.thDescription}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>nodes</code></td><td><code>&#123; id, name, role?, avatar?, parentId?, metadata? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.nodesDesc1}<code>parentId</code>{t.nodesDesc2}</td></tr>
          <tr><td><code>direction</code></td><td><code>&quot;vertical&quot; | &quot;horizontal&quot;</code></td><td>vertical</td><td>{t.no}</td><td>{t.directionDesc}</td></tr>
          <tr><td><code>onNodeClick</code></td><td><code>(node: OrgChartNode) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.onNodeClickDesc}</td></tr>
          <tr><td><code>expandable</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.expandableDesc}</td></tr>
          <tr><td><code>rootId</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rootIdDesc}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.classNameDesc}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
