"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type CardVariant = "default" | "elevated" | "outlined";

const fr = {
  components: "Composants",
  description: "Carte avec titre, sous-titre et contenu (variantes : default, elevated, outlined).",
  category: "Mise en page",
  demoTitle: "Titre de la carte",
  demoSubtitle: "Sous-titre optionnel",
  demoContent: "Contenu de la carte : texte, listes ou composants BPM.",
  titlePlaceholder: "Titre",
  subtitlePlaceholder: "Sous-titre",
  contentLabel: "Contenu (children)",
  copy: "Copier",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  no: "Non",
  examples: "Exemples",
  descTitle: "Titre de la carte.",
  descSubtitle: "Sous-titre sous le titre.",
  descChildren: "Contenu principal de la carte.",
  descImage: "URL d’une image en en-tête.",
  descActions: "Zone d’actions (boutons) en bas de la carte.",
  descVariant: "Style : fond, ombre ou bordure.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  components: "Components",
  description: "Card with title, subtitle and content (variants: default, elevated, outlined).",
  category: "Layout",
  demoTitle: "Card title",
  demoSubtitle: "Optional subtitle",
  demoContent: "Card content: text, lists or BPM components.",
  titlePlaceholder: "Title",
  subtitlePlaceholder: "Subtitle",
  contentLabel: "Content (children)",
  copy: "Copy",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  no: "No",
  examples: "Examples",
  descTitle: "Card title.",
  descSubtitle: "Subtitle below the title.",
  descChildren: "Main card content.",
  descImage: "URL of a header image.",
  descActions: "Actions area (buttons) at the bottom of the card.",
  descVariant: "Style: background, shadow or border.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocCardPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [title, setTitle] = useState(t.demoTitle);
  const [subtitle, setSubtitle] = useState(t.demoSubtitle);
  const [content, setContent] = useState(t.demoContent);
  const [variant, setVariant] = useState<CardVariant>("default");

  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedSubtitle = subtitle.replace(/"/g, '\\"');
  const escapedContent = content.replace(/"/g, '\\"').replace(/\n/g, " ");
  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode =
    `bpm.card(title="${escapedTitle}", subtitle="${escapedSubtitle}", content="${escapedContent}"${pyVariant})`;
  const { prev, next } = getPrevNext("card");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.card
        </div>
        <h1>bpm.card</h1>
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
          <div className="w-full max-w-sm">
            <Card title={title || undefined} subtitle={subtitle || undefined} variant={variant}>
              {content}
            </Card>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>subtitle</label>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={t.subtitlePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.contentLabel}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded text-sm bg-[var(--bpm-surface)] text-[var(--bpm-text-primary)] border-[var(--bpm-border)]"
            />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as CardVariant)}>
              <option value="default">default</option>
              <option value="elevated">elevated</option>
              <option value="outlined">outlined</option>
            </select>
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
            <th>{t.default}</th>
            <th>{t.required}</th>
            <th>{t.descriptionCol}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descTitle}</td>
          </tr>
          <tr>
            <td><code>subtitle</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descSubtitle}</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descChildren}</td>
          </tr>
          <tr>
            <td><code>image</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descImage}</td>
          </tr>
          <tr>
            <td><code>actions</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descActions}</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | elevated | outlined</code></td>
            <td>default</td>
            <td>{t.no}</td>
            <td>{t.descVariant}</td>
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
      <CodeBlock code={'bpm.card(title="Titre", content="Contenu de la carte.")'} language="python" />
      <CodeBlock code={'bpm.card(title="Carte surélevée", subtitle="Sous-titre", content="...", variant="elevated")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
