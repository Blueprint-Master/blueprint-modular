"use client";

import Link from "next/link";
import { Panel, Selectbox, Button } from "@/components/bpm";

export default function RapportsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/rapports">Rapports</Link> → Simulateur</div>
        <h1>Simulateur — Rapports</h1>
        <p className="doc-description">Choisir un type de rapport et générer (démo).</p>
      </div>
      <Panel variant="info" title="Générer un rapport">
        <Selectbox options={[{ value: "ca", label: "CA par mois" }, { value: "cmd", label: "Commandes" }]} value={null} onChange={() => {}} placeholder="Type de rapport" label="Type" />
        <Button className="mt-4">Générer</Button>
      </Panel>
    </div>
  );
}
