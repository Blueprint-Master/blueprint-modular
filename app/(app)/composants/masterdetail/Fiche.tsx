"use client";

import { useState } from "react";
import Link from "next/link";
import { MasterDetail, CodeBlock } from "@/components/bpm";
import type { MasterDetailColumn } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

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

const frDict = {
  breadcrumb: "Composants",
  description: (
    <>
      Vue maître/détail responsive : liste à gauche, panneau de détail à droite, avec recherche
      optionnelle. Sur mobile, le détail s&apos;ouvre en plein cadre avec un bouton retour.
      Idéal pour parcourir une collection (clients, tickets, commandes) tout en gardant le
      détail de l&apos;élément sélectionné sous les yeux.
    </>
  ),
  category: "Mise en page",
  colClient: "Client",
  colCity: "Ville",
  fieldSegment: "Segment",
  fieldContact: "Contact",
  fieldEmail: "E-mail",
  fieldRevenue: "CA annuel",
  fieldSince: "Client depuis",
  searchableLabel: "searchable (barre de recherche)",
  splitRatioLabel: (pct: number) => `splitRatio (largeur liste : ${pct} %)`,
  emptyDetailDemo: "Sélectionnez un client dans la liste.",
  emptyDetailPlaceholder: "Sélectionnez un élément dans la liste.",
  resetSelection: "Réinitialiser la sélection",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  propItems: (
    <>
      Données de la liste maître (objets indexés par <code>idKey</code>).
    </>
  ),
  propColumns: (
    <>
      Colonnes affichées dans la liste de gauche (la première est en gras) ;{" "}
      <code>render</code> personnalise le rendu d&apos;une cellule.
    </>
  ),
  propRenderDetail: <>Rendu du panneau de détail pour l&apos;élément sélectionné.</>,
  propOnSelect: <>Callback à la sélection d&apos;un élément de la liste.</>,
  propSelectedId: <>Id de l&apos;élément sélectionné (mode contrôlé).</>,
  propIdKey: <>Clé d&apos;identité des items.</>,
  propSearchable: <>Affiche une barre de recherche filtrant la liste sur le texte des colonnes.</>,
  propEmptyDetail: <>Message affiché dans le panneau quand rien n&apos;est sélectionné.</>,
  propSplitRatio: <>Largeur de la liste en pourcentage du conteneur (le détail occupe le reste).</>,
  propClassName: (
    <>
      Classes CSS additionnelles sur le conteneur <code>.bpm-master-detail</code>.
    </>
  ),
};

const enDict: typeof frDict = {
  breadcrumb: "Components",
  description: (
    <>
      Responsive master/detail view: list on the left, detail panel on the right, with optional
      search. On mobile, the detail opens full-frame with a back button.
      Ideal for browsing a collection (clients, tickets, orders) while keeping the details of
      the selected item in view.
    </>
  ),
  category: "Layout",
  colClient: "Client",
  colCity: "City",
  fieldSegment: "Segment",
  fieldContact: "Contact",
  fieldEmail: "Email",
  fieldRevenue: "Annual revenue",
  fieldSince: "Customer since",
  searchableLabel: "searchable (search bar)",
  splitRatioLabel: (pct: number) => `splitRatio (list width: ${pct}%)`,
  emptyDetailDemo: "Select a client from the list.",
  emptyDetailPlaceholder: "Select an item from the list.",
  resetSelection: "Reset selection",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  propItems: (
    <>
      Master list data (objects keyed by <code>idKey</code>).
    </>
  ),
  propColumns: (
    <>
      Columns displayed in the left-hand list (the first one is bold);{" "}
      <code>render</code> customizes how a cell is rendered.
    </>
  ),
  propRenderDetail: <>Renders the detail panel for the selected item.</>,
  propOnSelect: <>Callback when a list item is selected.</>,
  propSelectedId: <>Id of the selected item (controlled mode).</>,
  propIdKey: <>Identity key of the items.</>,
  propSearchable: <>Shows a search bar that filters the list on the column text.</>,
  propEmptyDetail: <>Message displayed in the panel when nothing is selected.</>,
  propSplitRatio: <>List width as a percentage of the container (the detail takes the rest).</>,
  propClassName: (
    <>
      Additional CSS classes on the <code>.bpm-master-detail</code> container.
    </>
  ),
};

const L = { fr: frDict, en: enDict } as const;

function ClientDetail({ client }: { client: Client }) {
  const { locale } = useI18n();
  const t = L[locale];
  const rows: Array<[string, string]> = [
    [t.fieldSegment, client.segment],
    [t.fieldContact, client.contact],
    [t.fieldEmail, client.email],
    [t.fieldRevenue, client.revenue],
    [t.fieldSince, client.since],
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
  const { locale } = useI18n();
  const t = L[locale];
  const [selectedId, setSelectedId] = useState<string | undefined>("c1");
  const [searchable, setSearchable] = useState(true);
  const [splitRatio, setSplitRatio] = useState(40);
  const [emptyDetailStr, setEmptyDetailStr] = useState(L.fr.emptyDetailDemo);

  // Le message de démo suit la langue tant qu'il n'a pas été personnalisé.
  const emptyDetailMessage =
    emptyDetailStr === L.fr.emptyDetailDemo || emptyDetailStr === L.en.emptyDetailDemo
      ? t.emptyDetailDemo
      : emptyDetailStr;

  const columns: MasterDetailColumn<Client>[] = [
    { key: "name", label: t.colClient },
    { key: "city", label: t.colCity },
  ];

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
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.masterDetail
        </div>
        <h1>bpm.masterDetail</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <MasterDetail<Client>
              items={CLIENTS}
              columns={columns}
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
              {t.searchableLabel}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>{t.splitRatioLabel(splitRatio)}</label>
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
              onChange={(e) => setEmptyDetailStr(e.target.value)}
              placeholder={t.emptyDetailPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <button type="button" onClick={() => setSelectedId(undefined)}>
              {t.resetSelection}
            </button>
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>items</code></td><td><code>T[]</code></td><td>—</td><td>{t.yes}</td><td>{t.propItems}</td></tr>
          <tr><td><code>columns</code></td><td><code>&#123; key, label, render? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.propColumns}</td></tr>
          <tr><td><code>renderDetail</code></td><td><code>(item: T) =&gt; ReactElement</code></td><td>—</td><td>{t.yes}</td><td>{t.propRenderDetail}</td></tr>
          <tr><td><code>onSelect</code></td><td><code>(item: T) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.propOnSelect}</td></tr>
          <tr><td><code>selectedId</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propSelectedId}</td></tr>
          <tr><td><code>idKey</code></td><td><code>string</code></td><td>&quot;id&quot;</td><td>{t.no}</td><td>{t.propIdKey}</td></tr>
          <tr><td><code>searchable</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.propSearchable}</td></tr>
          <tr><td><code>emptyDetailMessage</code></td><td><code>string</code></td><td>&quot;Sélectionnez un élément dans la liste.&quot;</td><td>{t.no}</td><td>{t.propEmptyDetail}</td></tr>
          <tr><td><code>splitRatio</code></td><td><code>number</code></td><td>40</td><td>{t.no}</td><td>{t.propSplitRatio}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
