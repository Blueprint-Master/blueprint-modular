"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion, CodeBlock } from "@/components/bpm";
import type { AccordionSection } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  category: "Mise en page",
  description: "Accordéon : sections repliables (un ou plusieurs ouverts selon allowMultiple).",
  sec1Content: "Contenu de la première section. Texte, listes ou composants BPM.",
  sec2Content: "Contenu de la deuxième section. Vous pouvez ouvrir plusieurs sections si allowMultiple est true.",
  sec3Content: "Contenu de la troisième section.",
  multipleOpen: "Plusieurs sections ouvertes",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  no: "Non",
  descSections: "Liste de sections (title, content, id optionnel).",
  descAllowMultiple: "Autoriser plusieurs sections ouvertes en même temps.",
  descDefaultOpenIds: "Ids des sections ouvertes au chargement.",
  descClassName: "Classes CSS additionnelles.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  category: "Layout",
  description: "Accordion: collapsible sections (one or several open depending on allowMultiple).",
  sec1Content: "Content of the first section. Text, lists or BPM components.",
  sec2Content: "Content of the second section. You can open several sections if allowMultiple is true.",
  sec3Content: "Content of the third section.",
  multipleOpen: "Several sections open",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  no: "No",
  descSections: "List of sections (title, content, optional id).",
  descAllowMultiple: "Allow several sections to be open at the same time.",
  descDefaultOpenIds: "Ids of the sections open on load.",
  descClassName: "Additional CSS classes.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocAccordionPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [allowMultiple, setAllowMultiple] = useState(false);

  const DEMO_SECTIONS: AccordionSection[] = [
    { id: "sec1", title: "Section 1", content: t.sec1Content },
    { id: "sec2", title: "Section 2", content: t.sec2Content },
    { id: "sec3", title: "Section 3", content: t.sec3Content },
  ];

  const pythonCode =
    `sections = [\n` +
    `  {"title": "Section 1", "content": "Contenu 1"},\n` +
    `  {"title": "Section 2", "content": "Contenu 2"},\n` +
    `]\nbpm.accordion(sections=sections` +
    (allowMultiple ? ", allow_multiple=True" : "") +
    ")";
  const { prev, next } = getPrevNext("accordion");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.accordion
        </div>
        <h1>bpm.accordion</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <Accordion sections={DEMO_SECTIONS} allowMultiple={allowMultiple} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>allowMultiple</label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
              />
              {t.multipleOpen}
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              {t.copy}
            </button>
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
          <tr>
            <td><code>sections</code></td>
            <td><code>AccordionSection[]</code></td>
            <td>[]</td>
            <td>{t.no}</td>
            <td>{t.descSections}</td>
          </tr>
          <tr>
            <td><code>allowMultiple</code></td>
            <td><code>boolean</code></td>
            <td>false</td>
            <td>{t.no}</td>
            <td>{t.descAllowMultiple}</td>
          </tr>
          <tr>
            <td><code>defaultOpenIds</code></td>
            <td><code>string[]</code></td>
            <td>[]</td>
            <td>{t.no}</td>
            <td>{t.descDefaultOpenIds}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descClassName}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={'bpm.accordion(sections=[\n  {"title": "FAQ 1", "content": "Réponse 1"},\n  {"title": "FAQ 2", "content": "Réponse 2"},\n])'}
        language="python"
      />
      <CodeBlock
        code={'bpm.accordion(sections=sections, allow_multiple=True, default_open_ids=["sec1"])'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
