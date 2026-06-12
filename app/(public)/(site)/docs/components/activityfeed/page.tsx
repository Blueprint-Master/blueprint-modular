"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityFeed, CodeBlock } from "@/components/bpm";
import type { ActivityItem } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const SEED_ACTIVITIES: ActivityItem[] = [
  { id: "a1", actor: "Alice Martin", action: "a validé", target: "le devis DV-104", timestamp: "2026-06-12T09:40:00+02:00", color: "success" },
  { id: "a2", actor: "Karim Benali", action: "a assigné", target: "le ticket SUP-2231 à Léa", timestamp: "2026-06-12T08:55:00+02:00", color: "info" },
  { id: "a3", actor: "Léa Dupont", action: "a commenté", target: "la commande CMD-5512", timestamp: "2026-06-12T07:30:00+02:00" },
  { id: "a4", actor: "Marc Rivière", action: "a signalé un retard sur", target: "la livraison LIV-887", timestamp: "2026-06-11T17:05:00+02:00", color: "warning" },
  { id: "a5", actor: "Sophie Nguyen", action: "a créé", target: "la fiche client Transports Brunet", timestamp: "2026-06-11T09:20:00+02:00", color: "success" },
  { id: "a6", actor: "Hugo Faure", action: "a archivé", target: "le projet Refonte intranet", timestamp: "2026-06-09T14:45:00+02:00" },
];

const NEW_ACTIVITY_POOL: Array<Pick<ActivityItem, "actor" | "action" | "target" | "color">> = [
  { actor: "Nina Robert", action: "a relancé", target: "le client Clinique du Parc", color: "info" },
  { actor: "Alice Martin", action: "a envoyé", target: "la facture FA-2026-0612", color: "success" },
  { actor: "Karim Benali", action: "a clôturé", target: "le ticket SUP-2218", color: "success" },
  { actor: "Marc Rivière", action: "a rejeté", target: "la demande d'avoir AV-031", color: "error" },
];

export default function DocActivityFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>(SEED_ACTIVITIES);
  const [maxItemsStr, setMaxItemsStr] = useState("4");
  const [compact, setCompact] = useState(false);
  const [addCount, setAddCount] = useState(0);

  const maxItemsParsed = parseInt(maxItemsStr, 10);
  const maxItems = Number.isFinite(maxItemsParsed) && maxItemsParsed > 0 ? maxItemsParsed : undefined;

  const handleAdd = () => {
    const tpl = NEW_ACTIVITY_POOL[addCount % NEW_ACTIVITY_POOL.length];
    setActivities((prev) => [
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
          <Link href="/docs/components">Composants</Link> → bpm.activityFeed
        </div>
        <h1>bpm.activityFeed</h1>
        <p className="doc-description">
          Fil d&apos;activité : flux chronologique d&apos;activités métier avec avatars initiaux,
          horodatages relatifs en français (« il y a 2 h », « hier ») et état vide.
          Idéal pour un historique CRM, un journal d&apos;audit léger ou la timeline d&apos;événements d&apos;une fiche.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Affichage de données</span>
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
            <label>maxItems (vide = tout afficher)</label>
            <input
              type="number"
              min={1}
              max={activities.length}
              value={maxItemsStr}
              onChange={(e) => setMaxItemsStr(e.target.value)}
              placeholder="ex. 4"
            />
          </div>
          <div className="sandbox-control-group">
            <label>
              <input
                type="checkbox"
                checked={compact}
                onChange={(e) => setCompact(e.target.checked)}
              />{" "}
              compact (densité réduite)
            </label>
          </div>
          <div className="sandbox-control-group">
            <button type="button" onClick={handleAdd}>
              + Ajouter une activité
            </button>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Défaut</th><th>Requis</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>activities</code></td><td><code>&#123; id, actor, action, target, timestamp, icon?, color? &#125;[]</code></td><td>—</td><td>Oui</td><td>Liste ordonnée des activités (ordre = ordre d&apos;affichage). <code>timestamp</code> au format ISO ; <code>color</code> ∈ default | info | success | warning | error.</td></tr>
          <tr><td><code>maxItems</code></td><td><code>number</code></td><td>—</td><td>Non</td><td>Nombre max d&apos;entrées visibles ; au-delà, le bouton « Charger plus » apparaît si <code>onLoadMore</code> est défini.</td></tr>
          <tr><td><code>onLoadMore</code></td><td><code>() =&gt; void</code></td><td>—</td><td>Non</td><td>Callback du bouton « Charger plus » (affiché quand <code>activities.length &gt; maxItems</code>).</td></tr>
          <tr><td><code>emptyMessage</code></td><td><code>string</code></td><td>&quot;Aucune activité récente.&quot;</td><td>Non</td><td>Message centré affiché quand <code>activities</code> est vide.</td></tr>
          <tr><td><code>compact</code></td><td><code>boolean</code></td><td>false</td><td>Non</td><td>Densité réduite : typo et padding plus petits, avatars 24 px.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>&quot;&quot;</td><td>Non</td><td>Classes CSS additionnelles sur le conteneur <code>.bpm-activity-feed</code>.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
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
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
