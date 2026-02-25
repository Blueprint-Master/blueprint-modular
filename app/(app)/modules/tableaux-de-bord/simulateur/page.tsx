"use client";

import Link from "next/link";
import { Panel, Metric, Button } from "@/components/bpm";

export default function TableauxDeBordSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/tableaux-de-bord">Tableaux de bord</Link> → Simulateur</div>
        <h1>Simulateur — Tableaux de bord</h1>
        <p className="doc-description">Widgets de démo (métriques).</p>
      </div>
      <Panel variant="info" title="Vue d&apos;ensemble">
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
          <Metric label="CA (k€)" value={142.5} delta={12.3} />
          <Metric label="Commandes" value={1248} />
        </div>
        <Button size="small" variant="outline">Personnaliser les widgets</Button>
      </Panel>
    </div>
  );
}
