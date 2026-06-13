"use client";

import { useState } from "react";
import Link from "next/link";
import { EmptyState, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "État vide pour signaler l’absence de données, avec titre, description et bouton d’action optionnel.",
  category: "Mise en page",
  phTitle: "Aucune donnée",
  phDescription: "Description optionnelle",
  phActionLabel: "ex. Ajouter un élément",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  defaultTitle: "Aucune donnée",
  examples: "Exemples",
  d_title: "Titre principal de l’état vide.",
  d_description: "Texte ou contenu sous le titre (Python : chaîne uniquement).",
  d_icon: "Icône au-dessus du titre (React uniquement).",
  d_action: "Bouton ou lien d’action (Python : utiliser ",
  d_action2: ").",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Empty state to signal the absence of data, with a title, description and optional action button.",
  category: "Layout",
  phTitle: "No data",
  phDescription: "Optional description",
  phActionLabel: "e.g. Add an item",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  defaultTitle: "No data",
  examples: "Examples",
  d_title: "Main title of the empty state.",
  d_description: "Text or content below the title (Python: string only).",
  d_icon: "Icon above the title (React only).",
  d_action: "Action button or link (Python: use ",
  d_action2: ").",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocEmptyStatePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [title, setTitle] = useState("Aucune donnée");
  const [description, setDescription] = useState("Ajoutez des éléments pour commencer.");
  const [actionLabel, setActionLabel] = useState("");

  const parts: string[] = [];
  if (title !== "Aucune donnée") parts.push(`title="${title.replace(/"/g, '\\"')}"`);
  if (description.trim() !== "") parts.push(`description="${description.trim().replace(/"/g, '\\"')}"`);
  if (actionLabel.trim() !== "") parts.push(`action_label="${actionLabel.trim().replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length ? `bpm.emptystate(${parts.join(", ")})` : "bpm.emptystate()";
  const { prev, next } = getPrevNext("emptystate");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.emptystate
        </div>
        <h1>bpm.emptystate</h1>
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
          <div className="w-full">
            <EmptyState
              title={title}
              description={description.trim() || undefined}
              action={
                actionLabel.trim() ? (
                  <Button variant="primary" onClick={() => {}}>
                    {actionLabel.trim()}
                  </Button>
                ) : undefined
              }
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.phTitle}
            />
          </div>
          <div className="sandbox-control-group">
            <label>description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.phDescription}
            />
          </div>
          <div className="sandbox-control-group">
            <label>action_label</label>
            <input
              type="text"
              value={actionLabel}
              onChange={(e) => setActionLabel(e.target.value)}
              placeholder={t.phActionLabel}
            />
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
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>{t.defaultTitle}</td>
            <td>{t.no}</td>
            <td>{t.d_title}</td>
          </tr>
          <tr>
            <td><code>description</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_description}</td>
          </tr>
          <tr>
            <td><code>icon</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_icon}</td>
          </tr>
          <tr>
            <td><code>action</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_action}<code>action_label</code>{t.d_action2}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.emptystate()" language="python" />
      <CodeBlock code={'bpm.emptystate(title="Aucun résultat", description="Essayez de modifier vos filtres.")'} language="python" />
      <CodeBlock code={'bpm.emptystate(title="Liste vide", description="Ajoutez un premier élément.", action_label="Créer")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
