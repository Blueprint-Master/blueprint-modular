"use client";

import Link from "next/link";
import { Panel, Table, Button } from "@/components/bpm";

const refData = [{ code: "EUR", libelle: "Euro" }, { code: "USD", libelle: "Dollar US" }];

export default function ReferentielsSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/referentiels">Référentiels</Link> → Simulateur</div>
        <h1>Simulateur — Référentiels</h1>
        <p className="doc-description">Liste devises (démo).</p>
      </div>
      <Panel variant="info" title="Devises">
        <Table columns={[{ key: "code", label: "Code" }, { key: "libelle", label: "Libellé" }]} data={refData} striped hover />
        <Button size="small" className="mt-4">Ajouter</Button>
      </Panel>
    </div>
  );
}
