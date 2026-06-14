"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityFeed, CodeBlock } from "@/components/bpm";
import type { ActivityItem } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type BiText = { fr: string; en: string };

type BiActivity = {
  id: string;
  actor: string;
  action: BiText;
  target: BiText;
  timestamp: string;
  color?: ActivityItem["color"];
};

const SEED_ACTIVITIES: BiActivity[] = [
  {
    id: "a1",
    actor: "Alice Martin",
    action: { fr: "a validé", en: "approved" },
    target: { fr: "le devis DV-104", en: "quote DV-104" },
    timestamp: "2026-06-12T09:40:00+02:00",
    color: "success",
  },
  {
    id: "a2",
    actor: "Karim Benali",
    action: { fr: "a assigné", en: "assigned" },
    target: { fr: "le ticket SUP-2231 à Léa", en: "ticket SUP-2231 to Léa" },
    timestamp: "2026-06-12T08:55:00+02:00",
    color: "info",
  },
  {
    id: "a3",
    actor: "Léa Dupont",
    action: { fr: "a commenté", en: "commented on" },
    target: { fr: "la commande CMD-5512", en: "order CMD-5512" },
    timestamp: "2026-06-12T07:30:00+02:00",
  },
  {
    id: "a4",
    actor: "Marc Rivière",
    action: { fr: "a signalé un retard sur", en: "reported a delay on" },
    target: { fr: "la livraison LIV-887", en: "delivery LIV-887" },
    timestamp: "2026-06-11T17:05:00+02:00",
    color: "warning",
  },
  {
    id: "a5",
    actor: "Sophie Nguyen",
    action: { fr: "a créé", en: "created" },
    target: { fr: "la fiche client Transports Brunet", en: "the Transports Brunet customer record" },
    timestamp: "2026-06-11T09:20:00+02:00",
    color: "success",
  },
  {
    id: "a6",
    actor: "Hugo Faure",
    action: { fr: "a archivé", en: "archived" },
    target: { fr: "le projet Refonte intranet", en: "the Refonte intranet project" },
    timestamp: "2026-06-09T14:45:00+02:00",
  },
];

const NEW_ACTIVITY_POOL: Array<Omit<BiActivity, "id" | "timestamp">> = [
  {
    actor: "Nina Robert",
    action: { fr: "a relancé", en: "followed up with" },
    target: { fr: "le client Clinique du Parc", en: "the client Clinique du Parc" },
    color: "info",
  },
  {
    actor: "Alice Martin",
    action: { fr: "a envoyé", en: "sent" },
    target: { fr: "la facture FA-2026-0612", en: "invoice FA-2026-0612" },
    color: "success",
  },
  {
    actor: "Karim Benali",
    action: { fr: "a clôturé", en: "closed" },
    target: { fr: "le ticket SUP-2218", en: "ticket SUP-2218" },
    color: "success",
  },
  {
    actor: "Marc Rivière",
    action: { fr: "a rejeté", en: "rejected" },
    target: { fr: "la demande d'avoir AV-031", en: "credit note request AV-031" },
    color: "error",
  },
];

const frDict = {
  breadcrumb: "Composants",
  description: (
    <>
      Fil d&apos;activité : flux chronologique d&apos;activités métier avec avatars initiaux,
      horodatages relatifs en français (« il y a 2 h », « hier ») et état vide.
      Idéal pour un historique CRM, un journal d&apos;audit léger ou la timeline d&apos;événements d&apos;une fiche.
    </>
  ),
  category: "Affichage de données",
  maxItemsLabel: "maxItems (vide = tout afficher)",
  maxItemsPlaceholder: "ex. 4",
  compactLabel: "compact (densité réduite)",
  addActivity: "+ Ajouter une activité",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  propActivities: (
    <>
      Liste ordonnée des activités (ordre = ordre d&apos;affichage). <code>timestamp</code> au
      format ISO ; <code>color</code> ∈ default | info | success | warning | error.
    </>
  ),
  propMaxItems: (
    <>
      Nombre max d&apos;entrées visibles ; au-delà, le bouton « Charger plus » apparaît si{" "}
      <code>onLoadMore</code> est défini.
    </>
  ),
  propOnLoadMore: (
    <>
      Callback du bouton « Charger plus » (affiché quand <code>activities.length &gt; maxItems</code>).
    </>
  ),
  propEmptyMessage: (
    <>
      Message centré affiché quand <code>activities</code> est vide.
    </>
  ),
  propCompact: <>Densité réduite : typo et padding plus petits, avatars 24 px.</>,
  propClassName: (
    <>
      Classes CSS additionnelles sur le conteneur <code>.bpm-activity-feed</code>.
    </>
  ),
};

const enDict: typeof frDict = {
  breadcrumb: "Components",
  description: (
    <>
      Activity feed: a chronological stream of business activities with initials-based avatars,
      relative timestamps in French (« il y a 2 h », « hier ») and an empty state.
      Ideal for a CRM history, a lightweight audit log or the event timeline of a record.
    </>
  ),
  category: "Data display",
  maxItemsLabel: "maxItems (empty = show all)",
  maxItemsPlaceholder: "e.g. 4",
  compactLabel: "compact (reduced density)",
  addActivity: "+ Add an activity",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  propActivities: (
    <>
      Ordered list of activities (order = display order). <code>timestamp</code> in ISO format;{" "}
      <code>color</code> ∈ default | info | success | warning | error.
    </>
  ),
  propMaxItems: (
    <>
      Maximum number of visible entries; beyond it, the « Charger plus » (load more) button appears
      when <code>onLoadMore</code> is defined.
    </>
  ),
  propOnLoadMore: (
    <>
      Callback for the « Charger plus » button (shown when <code>activities.length &gt; maxItems</code>).
    </>
  ),
  propEmptyMessage: (
    <>
      Centered message displayed when <code>activities</code> is empty.
    </>
  ),
  propCompact: <>Reduced density: smaller type and padding, 24 px avatars.</>,
  propClassName: (
    <>
      Additional CSS classes on the <code>.bpm-activity-feed</code> container.
    </>
  ),
};

const L = { fr: frDict, en: enDict } as const;

export default function DocActivityFeedPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [items, setItems] = useState<BiActivity[]>(SEED_ACTIVITIES);
  const [maxItemsStr, setMaxItemsStr] = useState("4");
  const [compact, setCompact] = useState(false);
  const [addCount, setAddCount] = useState(0);

  const activities: ActivityItem[] = items.map(({ action, target, ...rest }) => ({
    ...rest,
    action: action[locale],
    target: target[locale],
  }));

  const maxItemsParsed = parseInt(maxItemsStr, 10);
  const maxItems = Number.isFinite(maxItemsParsed) && maxItemsParsed > 0 ? maxItemsParsed : undefined;

  const handleAdd = () => {
    const tpl = NEW_ACTIVITY_POOL[addCount % NEW_ACTIVITY_POOL.length];
    setItems((prev) => [
      { id: `new-${addCount + 1}`, timestamp: new Date().toISOString(), ...tpl },
      ...prev,
    ]);
    setAddCount((c) => c + 1);
  };

  const handleLoadMore = () => {
    if (maxItems == null) return;
    setMaxItemsStr(String(Math.min(activities.length, maxItems + 3)));
  };

  const esc = (s: string) => s.replace(/"/g, '\\"');
  const pyItems = activities
    .map((a) => {
      const colorPart = a.color ? `, "color": "${a.color}"` : "";
      return `    {"actor": "${esc(a.actor)}", "action": "${esc(a.action)}", "target": "${esc(a.target)}", "timestamp": "${a.timestamp}"${colorPart}}`;
    })
    .join(",\n");
  const opts: string[] = [];
  if (compact) opts.push("compact=True");
  if (maxItems != null) opts.push(`max_items=${maxItems}`);
  const pythonCode = `activities = [\n${pyItems},\n]\nbpm.activity_feed(activities${opts.length ? ", " + opts.join(", ") : ""})`;
  const { prev, next } = getPrevNext("activityfeed");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.activityFeed
        </div>
        <h1>bpm.activityFeed</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <ActivityFeed
              activities={activities}
              maxItems={maxItems}
              onLoadMore={handleLoadMore}
              compact={compact}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.maxItemsLabel}</label>
            <input
              type="number"
              min={1}
              max={activities.length}
              value={maxItemsStr}
              onChange={(e) => setMaxItemsStr(e.target.value)}
              placeholder={t.maxItemsPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />{" "}
              {t.compactLabel}
            </label>
          </div>
          <div className="sandbox-control-group">
            <button type="button" onClick={handleAdd}>
              {t.addActivity}
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
          <tr><td><code>activities</code></td><td><code>&#123; id, actor, action, target, timestamp, icon?, color? &#125;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.propActivities}</td></tr>
          <tr><td><code>maxItems</code></td><td><code>number</code></td><td>—</td><td>{t.no}</td><td>{t.propMaxItems}</td></tr>
          <tr><td><code>onLoadMore</code></td><td><code>() =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.propOnLoadMore}</td></tr>
          <tr><td><code>emptyMessage</code></td><td><code>string</code></td><td>&quot;Aucune activité récente.&quot;</td><td>{t.no}</td><td>{t.propEmptyMessage}</td></tr>
          <tr><td><code>compact</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.propCompact}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>{t.no}</td><td>{t.propClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={'activities = [\n    {"actor": "Alice Martin", "action": "a validé", "target": "le devis DV-104", "timestamp": "2026-06-12T09:40:00+02:00", "color": "success"},\n    {"actor": "Karim Benali", "action": "a assigné", "target": "le ticket SUP-2231 à Léa", "timestamp": "2026-06-12T08:55:00+02:00", "color": "info"},\n]\nbpm.activity_feed(activities)'}
        language="python"
      />
      <CodeBlock
        code={'# Forme tuple (actor, action, target, color?) : timestamp = maintenant\nbpm.activity_feed([\n    ("Sophie Nguyen", "a créé", "la fiche client Transports Brunet", "success"),\n    ("Marc Rivière", "a signalé un retard sur", "la livraison LIV-887", "warning"),\n], compact=True)'}
        language="python"
      />
      <CodeBlock
        code={'# Liste longue : limite + bouton « Charger plus » côté front\nbpm.activity_feed(activities, max_items=5)'}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
