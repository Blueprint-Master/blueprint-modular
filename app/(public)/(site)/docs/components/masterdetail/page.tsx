"use client";

import { useState } from "react";
import Link from "next/link";
import { MasterDetail, CodeBlock } from "@/components/bpm";
import type { MasterDetailColumn } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Client = Record<string, unknown> & {
  id: string;
  name: string;
  city: string;
  segment: string;
  contact: string;
  email: string;
  revenue: string;
  since: string;
};

const CLIENTS: Client[] = [
  { id: "c1", name: "Atelier Garnier", city: "Lyon", segment: "PME — Industrie", contact: "Claire Garnier", email: "contact@atelier-garnier.fr", revenue: "184 000 €", since: "2021" },
  { id: "c2", name: "Transports Brunet", city: "Nantes", segment: "ETI — Logistique", contact: "Paul Brunet", email: "p.brunet@transports-brunet.fr", revenue: "521 300 €", since: "2019" },
  { id: "c3", name: "Clinique du Parc", city: "Bordeaux", segment: "Santé", contact: "Dr Inès Morel", email: "achats@clinique-du-parc.fr", revenue: "96 750 €", since: "2023" },
  { id: "c4", name: "Maison Lefèvre", city: "Lille", segment: "Commerce de détail", contact: "Julien Lefèvre", email: "julien@maison-lefevre.fr", revenue: "248 900 €", since: "2020" },
];

const COLUMNS: MasterDetailColumn<Client>[] = [
  { key: "name", label: "Client" },
  { key: "city", label: "Ville" },
];

function ClientDetail({ client }: { client: Client }) {
  const rows: Array<[string, string]> = [
    ["Segment", client.segment],
    ["Contact", client.contact],
    ["E-mail", client.email],
    ["CA annuel", client.revenue],
    ["Client depuis", client.since],
  ];
  return (
    <div>
      <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>{client.name}</h3>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--bpm-text-secondary)" }}>{client.city}</p>
      <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 14 }}>
        {rows.map(([label, value]) => (
          <div key={label} style={{ display: "contents" }}>
            <dt style={{ color: "var(--bpm-text-secondary)" }}>{label}</dt>
            <dd style={{ margin: 0, fontWeight: 500 }}>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function DocMasterDetailPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>("c1");
  const [searchable, setSearchable] = useState(true);
  const [splitRatio, setSplitRatio] = useState(40);
  const [emptyDetailMessage, setEmptyDetailMessage] = useState("Sélectionnez un client dans la liste.");

  const esc = (s: string) => s.replace(/"/g, '\\"');
  const opts: string[] = [];
  if (searchable) opts.push("searchable=True");
  if (splitRatio !== 40) opts.push(`split_ratio=${splitRatio}`);
  if (emptyDetailMessage && emptyDetailMessage !== "Sélectionnez un élément dans la liste.") {
    opts.push(`empty_detail_message="${esc(emptyDetailMessage)}"`);
  }
  const pythonCode =
    `columns = [{"key": "name", "label": "Client"}, {"key": "city", "label": "Ville"}]\n` +
    `bpm.master_detail(items=clients, columns=columns, render_detail=render_client, on_select=on_select` +
    `${opts.length ? ", " + opts.join(", ") : ""})`;
  const { prev, next } = getPrevNext("masterdetail");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">Composants</Link> → bpm.masterDetail
        </div>
        <h1>bpm.masterDetail</h1>
        <p className="doc-description">
          Vue maître/détail responsive : liste à gauche, panneau de détail à droite, avec recherche
          optionnelle. Sur mobile, le détail s&apos;ouvre en plein cadre avec un bouton retour.
          Idéal pour parcourir une collection (clients, tickets, commandes) tout en gardant le
          détail de l&apos;élément sélectionné sous les yeux.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Mise en page</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <MasterDetail<Client>
              items={CLIENTS}
              columns={COLUMNS}
              renderDetail={(client) => <ClientDetail client={client} />}
              selectedId={selectedId}
              onSelect={(client) => setSelectedId(client.id)}
              searchable={searchable}
              splitRatio={splitRatio}
              emptyDetailMessage={emptyDetailMessage}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={searchable}
                onChange={(e) => setSearchable(e.target.checked)}
              />{" "}
              searchable (barre de recherche)
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>splitRatio (largeur liste : {splitRatio} %)</label>
            <input
              type="range"
              min={25}
              max={60}
              step={5}
              value={splitRatio}
              onChange={(e) => setSplitRatio(Number(e.target.value))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>emptyDetailMessage</label>
            <input
              type="text"
              value={emptyDetailMessage}
              onChange={(e) => setEmptyDetailMessage(e.target.value)}
              placeholder="Sélectionnez un élément dans la liste."
            />
          </div>
          <div className="sandbox-control-group">
            <button type="button" onClick={() => setSelectedId(undefined)}>
              Réinitialiser la sélection
            </button>
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
          <tr><td><code>items</code></td><td><code>T[]</code></td><td>—</td><td>Oui</td><td>Données de la liste maître (objets indexés par <code>idKey</code>).</td></tr>
          <tr><td><code>columns</code></td><td><code>&#123; key, label, render? &#125;[]</code></td><td>—</td><td>Oui</td><td>Colonnes affichées dans la liste de gauche (la première est en gras) ; <code>render</code> personnalise le rendu d&apos;une cellule.</td></tr>
          <tr><td><code>renderDetail</code></td><td><code>(item: T) =&gt; ReactElement</code></td><td>—</td><td>Oui</td><td>Rendu du panneau de détail pour l&apos;élément sélectionné.</td></tr>
          <tr><td><code>onSelect</code></td><td><code>(item: T) =&gt; void</code></td><td>—</td><td>Oui</td><td>Callback à la sélection d&apos;un élément de la liste.</td></tr>
          <tr><td><code>selectedId</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Id de l&apos;élément sélectionné (mode contrôlé).</td></tr>
          <tr><td><code>idKey</code></td><td><code>string</code></td><td>&quot;id&quot;</td><td>Non</td><td>Clé d&apos;identité des items.</td></tr>
          <tr><td><code>searchable</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Affiche une barre de recherche filtrant la liste sur le texte des colonnes.</td></tr>
          <tr><td><code>emptyDetailMessage</code></td><td><code>string</code></td><td>&quot;Sélectionnez un élément dans la liste.&quot;</td><td>Non</td><td>Message affiché dans le panneau quand rien n&apos;est sélectionné.</td></tr>
          <tr><td><code>splitRatio</code></td><td><code>number</code></td><td>40</td><td>Non</td><td>Largeur de la liste en pourcentage du conteneur (le détail occupe le reste).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>Non</td><td>Classes CSS additionnelles sur le conteneur <code>.bpm-master-detail</code>.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock
        code={'columns = [{"key": "name", "label": "Client"}, {"key": "city", "label": "Ville"}]\nbpm.master_detail(items=clients, columns=columns, render_detail=render_client, on_select=on_select)'}
        language="python"
      />
      <CodeBlock
        code={'# Liste de tickets filtrable, liste plus étroite\nbpm.master_detail(\n    items=tickets,\n    columns=[{"key": "ref", "label": "Ticket"}, {"key": "status", "label": "Statut"}],\n    render_detail=render_ticket,\n    on_select=on_select,\n    searchable=True,\n    split_ratio=30,\n)'}
        language="python"
      />
      <CodeBlock
        code={'# Clé d\'identité personnalisée + message d\'état vide\nbpm.master_detail(items=commandes, columns=columns, render_detail=render_commande, on_select=on_select, id_key="ref", empty_detail_message="Choisissez une commande.")'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
