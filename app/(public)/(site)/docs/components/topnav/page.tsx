"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

function slugify(label: string) {
  return (
    "/" +
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

const fr = {
  breadcrumb: "Composants",
  category: "Navigation",
  description: (
    <>
      Barre de navigation supérieure d&apos;application : logo/titre cliquable à gauche et
      liens ou boutons de section. Chaque item accepte un <code>href</code> (lien) ou un
      <code> onClick</code> (action). Dans la démo, les onglets utilisent <code>onClick</code> :
      cliquer un onglet le rend actif.
    </>
  ),
  defaultItems: "Tableau de bord, Interventions, Flotte, Rapports",
  fallbackItem: "Accueil",
  activeSection: "Section active :",
  titlePlaceholder: "Nom de l'application",
  logoLabel: "Logo dans le titre (title accepte du JSX)",
  logoOptionWith: "avec logo",
  logoOptionWithout: "texte seul",
  itemsLabel: "items (labels séparés par des virgules)",
  activeLabel: "Lien actif (état de la démo)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  propTitle: "Titre ou logo (texte simple ou JSX : logo + nom, badge…).",
  propTitleHref: "Lien du titre (retour à l'accueil en général).",
  propItems: (
    <>Éléments de navigation : lien si <code>href</code>, bouton si <code>onClick</code>.</>
  ),
  propClassName: (
    <>Classes CSS additionnelles (ex. <code>sticky top-0 z-10</code> pour figer la barre).</>
  ),
  examplesTitle: "Exemples",
  limitsTitle: "Limites et composition",
  limitsBody: (
    <>
      <code>bpm.topNav</code> ne prévoit pas de zone d&apos;actions à droite (recherche, avatar,
      notifications) : pour une barre d&apos;application complète, composer avec
      <code> bpm.pageLayout</code> et <code>bpm.avatar</code>, ou utiliser <code>bpm.sidebar</code> pour
      une navigation dense. L&apos;état « lien actif » est géré par l&apos;application (comme dans
      la démo, via <code>onClick</code>), pas par le composant.
    </>
  ),
};

const en: typeof fr = {
  breadcrumb: "Components",
  category: "Navigation",
  description: (
    <>
      Application top navigation bar: a clickable logo/title on the left and section links
      or buttons. Each item accepts an <code>href</code> (link) or an
      <code> onClick</code> (action). In the demo, the tabs use <code>onClick</code>:
      clicking a tab makes it active.
    </>
  ),
  defaultItems: "Dashboard, Interventions, Fleet, Reports",
  fallbackItem: "Home",
  activeSection: "Active section:",
  titlePlaceholder: "Application name",
  logoLabel: "Logo in the title (title accepts JSX)",
  logoOptionWith: "with logo",
  logoOptionWithout: "text only",
  itemsLabel: "items (comma-separated labels)",
  activeLabel: "Active link (demo state)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  propTitle: "Title or logo (plain text or JSX: logo + name, badge…).",
  propTitleHref: "Link for the title (usually back to the home page).",
  propItems: (
    <>Navigation items: a link if <code>href</code>, a button if <code>onClick</code>.</>
  ),
  propClassName: (
    <>Additional CSS classes (e.g. <code>sticky top-0 z-10</code> to pin the bar).</>
  ),
  examplesTitle: "Examples",
  limitsTitle: "Limitations and composition",
  limitsBody: (
    <>
      <code>bpm.topNav</code> does not provide a right-hand actions area (search, avatar,
      notifications): for a full application bar, compose it with
      <code> bpm.pageLayout</code> and <code>bpm.avatar</code>, or use <code>bpm.sidebar</code> for
      dense navigation. The &quot;active link&quot; state is managed by the application (as in
      the demo, via <code>onClick</code>), not by the component.
    </>
  ),
};

const L = { fr, en } as const;

export default function DocTopNavPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [title, setTitle] = useState("FleetOps");
  const [itemsStr, setItemsStr] = useState(t.defaultItems);
  const [active, setActive] = useState(0);
  const [showLogo, setShowLogo] = useState(true);

  const labels = itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const effectiveLabels = labels.length ? labels : [t.fallbackItem];
  const maxActive = effectiveLabels.length - 1;
  const activeIndex = Math.min(active, maxActive);

  // Le lien actif est marqué dans le label et cliquable : cliquer un onglet le rend actif.
  const navItems = effectiveLabels.map((label, i) => ({
    label: i === activeIndex ? "● " + label : label,
    onClick: () => setActive(i),
  }));

  const titleNode = showLogo ? (
    <span className="flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/img/logo-bpm.png" alt="" style={{ width: 24, height: 24, borderRadius: 6 }} />
      <span>{title || "Mon App"}</span>
    </span>
  ) : (
    title || "Mon App"
  );

  const pyItems = effectiveLabels
    .map((l) => `{"label": "${l.replace(/"/g, '\\"')}", "href": "${slugify(l)}"}`)
    .join(", ");
  const pythonCode = `bpm.topNav(title="${(title || "Mon App").replace(/"/g, '\\"')}", title_href="/", items=[${pyItems}])`;
  const { prev, next } = getPrevNext("topnav");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.topnav</div>
        <h1>bpm.topnav</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ padding: 0 }}>
          <div className="w-full" style={{ border: "1px solid var(--bpm-border)", borderRadius: 8, overflow: "hidden" }}>
            <TopNav title={titleNode} titleHref="#" items={navItems} />
            <div style={{ padding: "20px 16px", background: "var(--bpm-bg-secondary)" }}>
              <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.activeSection} <strong style={{ color: "var(--bpm-text-primary)" }}>{effectiveLabels[activeIndex]}</strong>
              </p>
            </div>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.logoLabel}</label>
            <select value={showLogo ? "true" : "false"} onChange={(e) => setShowLogo(e.target.value === "true")}>
              <option value="true">{t.logoOptionWith}</option>
              <option value="false">{t.logoOptionWithout}</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>{t.itemsLabel}</label>
            <input
              type="text"
              value={itemsStr}
              onChange={(e) => setItemsStr(e.target.value)}
              placeholder={t.defaultItems}
            />
          </div>
          <div className="sandbox-control-group">
            <label>{t.activeLabel}</label>
            <select value={activeIndex} onChange={(e) => setActive(Number(e.target.value))}>
              {effectiveLabels.map((l, i) => (
                <option key={i} value={i}>{l}</option>
              ))}
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
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>title</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.no}</td><td>{t.propTitle}</td></tr>
          <tr><td><code>titleHref</code></td><td><code>string</code></td><td>#</td><td>{t.no}</td><td>{t.propTitleHref}</td></tr>
          <tr><td><code>items</code></td><td><code>{'{ label, href?, onClick? }[]'}</code></td><td>[]</td><td>{t.no}</td><td>{t.propItems}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examplesTitle}</h2>
      <CodeBlock code={'bpm.topNav(title="FleetOps", title_href="/", items=[\n    {"label": "Tableau de bord", "href": "/tableau-de-bord"},\n    {"label": "Interventions", "href": "/interventions"},\n    {"label": "Flotte", "href": "/flotte"},\n    {"label": "Rapports", "href": "/rapports"},\n])'} language="python" />
      <CodeBlock code={'# Items en boutons (actions) plutôt qu\'en liens\nbpm.topNav(title="Console admin", items=[{"label": "Recharger", "on_click": reload_data}, {"label": "Aide", "on_click": show_help}])'} language="python" />
      <CodeBlock code={'# Barre figée en haut de page via className\nbpm.topNav(title="FleetOps", items=nav_items, class_name="sticky top-0 z-10")'} language="python" />

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.limitsTitle}</h2>
      <p className="doc-description">{t.limitsBody}</p>

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
