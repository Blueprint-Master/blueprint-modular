"use client";

import { useState } from "react";
import Link from "next/link";
import { Drawer, Button, Text, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Tiroir / panneau latéral pour détail, formulaire ou filtres. S’ouvre en overlay avec fond assombri.",
  category: "Mise en page",
  openDrawer: "Ouvrir le tiroir",
  drawerTitle: "Détail",
  drawerContent: "Contenu du tiroir : formulaire, détail d’un élément, filtres, etc. Fermez avec le bouton ou Échap.",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_children: "Contenu du tiroir.",
  d_open: "Contrôle l’affichage (ouvert/fermé).",
  d_onClose: "Callback à la fermeture (clic fond ou bouton).",
  d_title: "Titre affiché dans l’en-tête du tiroir.",
  d_side: "Côté d’ouverture du panneau.",
  d_width: "Largeur en px ou valeur CSS.",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Drawer / side panel for details, forms or filters. Opens as an overlay with a dimmed background.",
  category: "Layout",
  openDrawer: "Open drawer",
  drawerTitle: "Details",
  drawerContent: "Drawer content: form, item details, filters, etc. Close with the button or Esc.",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_children: "Drawer content.",
  d_open: "Controls visibility (open/closed).",
  d_onClose: "Callback when closing (background click or button).",
  d_title: "Title displayed in the drawer header.",
  d_side: "Side the panel opens from.",
  d_width: "Width in px or CSS value.",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocDrawerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"left" | "right">("right");
  const { prev, next } = getPrevNext("drawer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.drawer
        </div>
        <h1>bpm.drawer</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Button variant="primary" onClick={() => setOpen(true)}>{t.openDrawer}</Button>
          <Drawer open={open} onClose={() => setOpen(false)} title={t.drawerTitle} side={side} width={360}>
            <Text>{t.drawerContent}</Text>
          </Drawer>
        </div>
        <div className="sandbox-controls mt-3">
          <div className="sandbox-control-group">
            <label>side</label>
            <select value={side} onChange={(e) => setSide(e.target.value as "left" | "right")}>
              <option value="right">right</option>
              <option value="left">left</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText('bpm.drawer(open=..., on_close=..., title="Détail", side="right")')}>
              {t.copy}
            </button>
          </div>
          <pre><code>{'bpm.drawer(open=..., on_close=..., title="Détail", side="right")'}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
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
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_children}</td>
          </tr>
          <tr>
            <td><code>open</code></td>
            <td><code>boolean</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_open}</td>
          </tr>
          <tr>
            <td><code>onClose</code></td>
            <td><code>() =&gt; void</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_onClose}</td>
          </tr>
          <tr>
            <td><code>title</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_title}</td>
          </tr>
          <tr>
            <td><code>side</code></td>
            <td><code>&quot;left&quot; | &quot;right&quot;</code></td>
            <td>right</td>
            <td>{t.no}</td>
            <td>{t.d_side}</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number | string</code></td>
            <td>360</td>
            <td>{t.no}</td>
            <td>{t.d_width}</td>
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
      <CodeBlock code={'bpm.drawer(open=show, on_close=lambda: set_show(False), title="Filtres")'} language="python" />
      <CodeBlock code={'bpm.drawer(open=open, on_close=on_close, title="Détail", side="left", width=400)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
