"use client";

import { useState } from "react";
import Link from "next/link";
import { Modal, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type ModalSize = "small" | "medium" | "large";

export default function DocModalPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Fenêtre modale pour afficher du contenu par-dessus la page.",
    category: "Utilitaires",
    openButton: "Ouvrir la modal",
    modalBody: "Contenu de la modal. Fermez avec le bouton ou Échap.",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      isOpen: "Contrôle la visibilité de la modal.",
      onClose: "Callback à la fermeture (bouton ou Échap).",
      title: "Titre affiché dans l’en-tête.",
      size: "Largeur max de la modal.",
      showCloseButton: "Affiche le bouton de fermeture.",
    },
    examples: "Exemples",
    sampleTitle: "Titre de la modal",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Modal window to display content on top of the page.",
    category: "Utilities",
    openButton: "Open the modal",
    modalBody: "Modal content. Close with the button or Esc.",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      isOpen: "Controls the modal visibility.",
      onClose: "Callback on close (button or Esc).",
      title: "Title shown in the header.",
      size: "Max width of the modal.",
      showCloseButton: "Shows the close button.",
    },
    examples: "Examples",
    sampleTitle: "Modal title",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState(t.sampleTitle);
  const [size, setSize] = useState<ModalSize>("medium");

  const pythonCode = `bpm.modal(
  title="${title.replace(/"/g, '\\"')}",
  size="${size}",
  content=my_content_component,
)`;

  const { prev, next } = getPrevNext("modal");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.modal</div>
        <h1>bpm.modal</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button onClick={() => setIsOpen(true)}>{t.openButton}</Button>
          <Modal
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            title={title}
            size={size}
            showCloseButton
          >
            <p style={{ color: "var(--bpm-text)" }}>{t.modalBody}</p>
          </Modal>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as ModalSize)}
            >
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pythonCode)}
            >
              {t.copy}
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

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
            <td><code>isOpen</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.isOpen}</td>
          </tr>
          <tr>
            <td><code>onClose</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.onClose}</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.title}</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>&#39;small&#39; | &#39;medium&#39; | &#39;large&#39;</code></td>
            <td><code>&#39;medium&#39;</code></td>
            <td>{t.no}</td>
            <td>{t.rows.size}</td>
          </tr>
          <tr>
            <td><code>showCloseButton</code></td>
            <td><code>boolean</code></td>
            <td><code>true</code></td>
            <td>{t.no}</td>
            <td>{t.rows.showCloseButton}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={`if bpm.button("Confirmer"):
    bpm.modal(title="Confirmé", content="Action enregistrée.", on_close=refresh)`}
        language="python"
      />
      <CodeBlock
        code={`bpm.modal(
  title="Détails",
  size="large",
  content=bpm.panel(bpm.table(df)),
)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={`/composants/${prev}`}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/composants/${next}`}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
