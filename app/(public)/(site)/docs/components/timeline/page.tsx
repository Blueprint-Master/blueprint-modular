"use client";

import Link from "next/link";
import { Timeline, CodeBlock } from "@/components/bpm";
import type { TimelineItem } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Jalons d'un projet de déploiement CRM — libellés et dates résolus par locale
const L = {
  fr: {
    breadcrumb: "Composants",
    description: "Frise chronologique verticale : étapes avec titre, description, date et statut (done, current, upcoming). Démo : jalons d'un projet de déploiement CRM.",
    category: "Affichage",
    copy: "Copier",
    thDefault: "Défaut",
    thRequired: "Requis",
    thProperty: "Propriété",
    no: "Non",
    descEvents: "Fil chronologique (date ISO, title, actor?, metadata?, groupByDate, maxItems, sortOrder).",
    descItems: "Ancienne API (title, description?, date?, status?).",
    descClassName: "Classes CSS additionnelles.",
    descId: "Identifiant unique (optionnel).",
    descTitle: "Titre de l'étape.",
    descDescription: "Description ou sous-texte (optionnel).",
    descDate: 'Date affichée (ex. "Jan 2025") (optionnel).',
    descStatus: "État visuel : terminé, en cours, à venir.",
    examples: "Exemples",
    items: [
      { title: "Cadrage", description: "Ateliers besoins et périmètre validé", date: "12 jan. 2026", status: "done" },
      { title: "Développement", description: "Sprints 1 à 4 livrés", date: "26 jan. – 13 mars 2026", status: "done" },
      { title: "Recette", description: "Tests métier en cours sur la préproduction", date: "16 mars – 3 avr. 2026", status: "current" },
      { title: "Mise en production", description: "Bascule et formation des utilisateurs", date: "15 avr. 2026", status: "upcoming" },
    ],
  },
  en: {
    breadcrumb: "Components",
    description: "Vertical timeline: steps with a title, description, date and status (done, current, upcoming). Demo: milestones of a CRM rollout project.",
    category: "Display",
    copy: "Copy",
    thDefault: "Default",
    thRequired: "Required",
    thProperty: "Property",
    no: "No",
    descEvents: "Chronological feed (ISO date, title, actor?, metadata?, groupByDate, maxItems, sortOrder).",
    descItems: "Legacy API (title, description?, date?, status?).",
    descClassName: "Additional CSS classes.",
    descId: "Unique identifier (optional).",
    descTitle: "Step title.",
    descDescription: "Description or subtext (optional).",
    descDate: 'Displayed date (e.g. "Jan 2025") (optional).',
    descStatus: "Visual state: done, in progress, upcoming.",
    examples: "Examples",
    items: [
      { title: "Scoping", description: "Requirements workshops and validated scope", date: "Jan 12, 2026", status: "done" },
      { title: "Development", description: "Sprints 1 to 4 delivered", date: "Jan 26 – Mar 13, 2026", status: "done" },
      { title: "Acceptance testing", description: "Business testing in progress on pre-production", date: "Mar 16 – Apr 3, 2026", status: "current" },
      { title: "Go-live", description: "Cutover and user training", date: "Apr 15, 2026", status: "upcoming" },
    ],
  },
} as const;

export default function DocTimelinePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const items: TimelineItem[] = [...t.items];
  const { prev, next } = getPrevNext("timeline");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.timeline</div>
        <h1>bpm.timeline</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Timeline items={items} />
        </div>
        <div className="sandbox-code mt-3">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText("bpm.timeline(items=[...])")}>{t.copy}</button></div>
          <pre><code>{"bpm.timeline(items=[{\"title\": \"Cadrage\", \"date\": \"12 jan. 2026\", \"status\": \"done\"}, ..., {\"title\": \"Mise en production\", \"date\": \"15 avr. 2026\", \"status\": \"upcoming\"}])"}</code></pre>
        </div>
      </div>
      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>events</code></td><td><code>TimelineEvent[]</code></td><td>—</td><td>{t.no}</td><td>{t.descEvents}</td></tr>
          <tr><td><code>items</code></td><td><code>TimelineItem[]</code></td><td>[]</td><td>{t.no}</td><td>{t.descItems}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>
      <h3 className="text-base font-semibold mt-6 mb-2">TimelineItem</h3>
      <table className="props-table">
        <thead><tr><th>{t.thProperty}</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>id</code></td><td><code>string</code></td><td>{t.descId}</td></tr>
          <tr><td><code>title</code></td><td><code>ReactNode</code></td><td>{t.descTitle}</td></tr>
          <tr><td><code>description</code></td><td><code>ReactNode</code></td><td>{t.descDescription}</td></tr>
          <tr><td><code>date</code></td><td><code>string</code></td><td>{t.descDate}</td></tr>
          <tr><td><code>status</code></td><td><code>&quot;done&quot; | &quot;current&quot; | &quot;upcoming&quot;</code></td><td>{t.descStatus}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.timeline(items=[{"title": "Cadrage", "date": "12 jan. 2026", "status": "done"}, {"title": "Développement", "date": "26 jan. – 13 mars 2026", "status": "done"}, {"title": "Recette", "date": "16 mars – 3 avr. 2026", "status": "current"}, {"title": "Mise en production", "date": "15 avr. 2026", "status": "upcoming"}])'} language="python" />
      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
