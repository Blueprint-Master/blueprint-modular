"use client";

import Link from "next/link";
import { CrudPage, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Page CRUD (liste, formulaire, colonnes, champs, endpoint).",
  category: "Utilitaires",
  colName: "Nom",
  colEmail: "Email",
  demoTitle: "Utilisateurs (démo)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descTitle: "Titre de la page.",
  descEndpoint: "URL de l'API (GET liste, POST création, PUT/DELETE par id).",
  descColumns: "Colonnes du tableau (key, label, type?, sortable?).",
  descFields: "Champs du formulaire (key, label, type, required?, options?).",
  descDomain: "Domaine optionnel.",
  descSemantic: "Sémantique optionnelle.",
  descIdKey: "Champ utilisé comme identifiant pour GET/PUT/DELETE.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  description: "CRUD page (list, form, columns, fields, endpoint).",
  category: "Utilities",
  colName: "Name",
  colEmail: "Email",
  demoTitle: "Users (demo)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descTitle: "Page title.",
  descEndpoint: "API URL (GET list, POST create, PUT/DELETE by id).",
  descColumns: "Table columns (key, label, type?, sortable?).",
  descFields: "Form fields (key, label, type, required?, options?).",
  descDomain: "Optional domain.",
  descSemantic: "Optional semantics.",
  descIdKey: "Field used as the identifier for GET/PUT/DELETE.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocCrudPage() {
  const { locale } = useI18n();
  const t = L[locale];

  const CRUD_COLUMNS = [
    { key: "name", label: t.colName, type: "text" as const },
    { key: "email", label: t.colEmail, type: "text" as const },
  ];
  const CRUD_FIELDS = [
    { key: "name", label: t.colName, type: "text" as const },
    { key: "email", label: t.colEmail, type: "text" as const },
  ];

  const pythonCode = `bpm.crud(title="Produits", endpoint="/api/products", columns=cols, fields=fields)`;
  const { prev, next } = getPrevNext("crud");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.crud</div>
        <h1>bpm.crud</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 320 }}>
          <CrudPage
            title={t.demoTitle}
            endpoint="https://jsonplaceholder.typicode.com/users"
            columns={CRUD_COLUMNS}
            fields={CRUD_FIELDS}
            idKey="id"
          />
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descTitle}</td></tr>
          <tr><td><code>endpoint</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descEndpoint}</td></tr>
          <tr><td><code>columns</code></td><td><code>CrudColumn[]</code></td><td>—</td><td>{t.yes}</td><td>{t.descColumns}</td></tr>
          <tr><td><code>fields</code></td><td><code>CrudField[]</code></td><td>—</td><td>{t.yes}</td><td>{t.descFields}</td></tr>
          <tr><td><code>domain</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descDomain}</td></tr>
          <tr><td><code>semantic</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descSemantic}</td></tr>
          <tr><td><code>idKey</code></td><td><code>string</code></td><td>id</td><td>{t.no}</td><td>{t.descIdKey}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'cols = [{"key": "name", "label": "Nom", "type": "text"}, {"key": "price", "label": "Prix", "type": "number"}]\nfields = [{"key": "name", "label": "Nom", "type": "text", "required": True}, {"key": "price", "label": "Prix", "type": "number"}]\nbpm.crud(title="Produits", endpoint="/api/products", columns=cols, fields=fields)'} language="python" />
      <CodeBlock code={'bpm.crud(title="Utilisateurs", endpoint="/api/users", columns=cols, fields=fields, idKey="uuid")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
