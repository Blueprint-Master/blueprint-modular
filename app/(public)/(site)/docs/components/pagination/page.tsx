"use client";

import { useState } from "react";
import Link from "next/link";
import { Pagination, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocPaginationPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Pagination pour listes et tableaux : page courante, total de pages, callback au changement.",
    category: "Affichage de données",
    copy: "Copier",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      page: "Page courante (1-based).",
      totalPages: "Nombre total de pages.",
      onPageChange: "Callback au changement de page.",
      pageSize: "Taille de page (affichage optionnel).",
      totalItems: (<>Nombre total d&apos;éléments.</>),
      label: (<>Libellé optionnel (ex. &quot;Page 1 sur 5&quot;).</>),
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Pagination for lists and tables: current page, total pages, change callback.",
    category: "Data display",
    copy: "Copy",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      page: "Current page (1-based).",
      totalPages: "Total number of pages.",
      onPageChange: "Callback when the page changes.",
      pageSize: "Page size (optional display).",
      totalItems: (<>Total number of items.</>),
      label: (<>Optional label (e.g. &quot;Page 1 of 5&quot;).</>),
      className: "Additional CSS classes.",
    },
    examples: "Examples",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [page, setPage] = useState(1);
  const totalPages = 5;
  const { prev, next } = getPrevNext("pagination");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.pagination
        </div>
        <h1>bpm.pagination</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={10}
            totalItems={50}
            label="Page"
          />
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(`bpm.pagination(page=${page}, total_pages=${totalPages}, on_page_change=...)`)}>
              {t.copy}
            </button>
          </div>
          <pre><code>{`bpm.pagination(page=${page}, total_pages=${totalPages}, on_page_change=...)`}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.propsTitle}</h2>
      <table className="props-table">
        <thead>
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>page</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.page}</td>
          </tr>
          <tr>
            <td><code>totalPages</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.totalPages}</td>
          </tr>
          <tr>
            <td><code>onPageChange</code></td>
            <td><code>(page: number) =&gt; void</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.onPageChange}</td>
          </tr>
          <tr>
            <td><code>pageSize</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.pageSize}</td>
          </tr>
          <tr>
            <td><code>totalItems</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.totalItems}</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.label}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.pagination(page=1, total_pages=10, on_page_change=handle_page)'} language="python" />
      <CodeBlock code={'bpm.pagination(page=3, total_pages=5, page_size=20, total_items=97, label="Page")'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
