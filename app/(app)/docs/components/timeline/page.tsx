"use client";

import Link from "next/link";
import { Timeline } from "@/components/bpm";
import type { TimelineItem } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const items: TimelineItem[] = [
  { title: "Étape 1", description: "Première étape", date: "Jan 2025", status: "done" },
  { title: "Étape 2", description: "En cours", date: "Fév 2025", status: "current" },
  { title: "Étape 3", description: "À venir", date: "Mar 2025", status: "upcoming" },
];

export default function DocTimelinePage() {
  const { prev, next } = getPrevNext("timeline");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.timeline</div>
        <h1>bpm.timeline</h1>
        <p className="doc-description">Frise chronologique.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Affichage</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Timeline items={items} />
        </div>
      </div>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
