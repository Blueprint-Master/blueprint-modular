"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocPageLayoutPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Layout avec sidebar repliable, titre et zone de contenu.",
    category: "Mise en page",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    pageContent: "Contenu de la page :",
    items: [
      { key: "dashboard", label: "Tableau de bord", icon: "dashboard" },
      { key: "inventory", label: "Inventaire", icon: "inventory_2" },
      { key: "settings", label: "Paramètres", icon: "settings" },
    ],
    rows: {
      title: "Titre affiché en haut de la sidebar.",
      items: "Entrées du menu (key, label, icon).",
      currentItem: (<>Clé de l&apos;entrée active.</>),
      onNavigate: (<>Callback à la sélection d&apos;une entrée.</>),
      children: "Contenu principal.",
      defaultCollapsed: "Sidebar repliée par défaut.",
      theme: "Thème courant (affiche bouton thème si onThemeChange fourni).",
      onThemeChange: "Callback changement de thème.",
    },
    examples: "Exemples",
    demoTitle: "Mon app",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Layout with a collapsible sidebar, title and content area.",
    category: "Layout",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    pageContent: "Page content:",
    items: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "inventory", label: "Inventory", icon: "inventory_2" },
      { key: "settings", label: "Settings", icon: "settings" },
    ],
    rows: {
      title: "Title shown at the top of the sidebar.",
      items: "Menu entries (key, label, icon).",
      currentItem: (<>Key of the active entry.</>),
      onNavigate: (<>Callback when an entry is selected.</>),
      children: "Main content.",
      defaultCollapsed: "Sidebar collapsed by default.",
      theme: "Current theme (shows theme button if onThemeChange is provided).",
      onThemeChange: "Theme change callback.",
    },
    examples: "Examples",
    demoTitle: "My app",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const sidebarItems = t.items;
  const [title, setTitle] = useState(t.demoTitle);
  const [currentItem, setCurrentItem] = useState("dashboard");
  const [defaultCollapsed, setDefaultCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const pyTitle = title.replace(/"/g, '\\"');
  const pyDefaultCollapsed = defaultCollapsed ? ", defaultCollapsed=True" : "";
  const pythonCode = `bpm.pageLayout(title="${pyTitle}", items=[...], currentItem="${currentItem}", onNavigate=...)${pyDefaultCollapsed}`;
  const { prev, next } = getPrevNext("pagelayout");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.pageLayout</div>
        <h1>bpm.pageLayout</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 320 }}>
          <PageLayout
            title={title}
            items={sidebarItems}
            currentItem={currentItem}
            onNavigate={setCurrentItem}
            defaultCollapsed={defaultCollapsed}
            theme={theme}
            onThemeChange={setTheme}
          >
            <p style={{ margin: 0 }}>{t.pageContent} <strong>{currentItem}</strong></p>
          </PageLayout>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>currentItem</label>
            <select value={currentItem} onChange={(e) => setCurrentItem(e.target.value)}>
              {sidebarItems.map((i) => (
                <option key={i.key} value={i.key}>{i.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>defaultCollapsed</label>
            <select value={defaultCollapsed ? "true" : "false"} onChange={(e) => setDefaultCollapsed(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
              <option value="light">light</option>
              <option value="dark">dark</option>
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
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.title}</td></tr>
          <tr><td><code>items</code></td><td><code>SidebarItem[]</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.items}</td></tr>
          <tr><td><code>currentItem</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.currentItem}</td></tr>
          <tr><td><code>onNavigate</code></td><td><code>(key: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.onNavigate}</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.children}</td></tr>
          <tr><td><code>defaultCollapsed</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.rows.defaultCollapsed}</td></tr>
          <tr><td><code>theme</code></td><td><code>&quot;light&quot; | &quot;dark&quot;</code></td><td>—</td><td>{t.no}</td><td>{t.rows.theme}</td></tr>
          <tr><td><code>onThemeChange</code></td><td><code>(theme: &quot;light&quot; | &quot;dark&quot;) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.rows.onThemeChange}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.pageLayout(title="App", items=[{"key": "home", "label": "Accueil", "icon": "home"}], currentItem="home", onNavigate=handler)'} language="python" />
      <CodeBlock code={'bpm.pageLayout(title="Admin", items=sidebar_items, currentItem=current, onNavigate=set_current, defaultCollapsed=True)'} language="python" />
      <CodeBlock code={'bpm.pageLayout(..., theme="dark", onThemeChange=set_theme)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
