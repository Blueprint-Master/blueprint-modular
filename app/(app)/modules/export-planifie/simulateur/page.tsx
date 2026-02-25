"use client";

import Link from "next/link";
import { Panel, Selectbox, Input, Button } from "@/components/bpm";

export default function ExportPlanifieSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/export-planifie">Export planifié</Link> → Simulateur</div>
        <h1>Simulateur — Export planifié</h1>
        <p className="doc-description">Configurer fréquence et destinataires.</p>
      </div>
      <Panel variant="info" title="Export planifié">
        <Selectbox options={[{ value: "daily", label: "Quotidien" }, { value: "weekly", label: "Hebdo" }]} value={null} onChange={() => {}} placeholder="Fréquence" label="Fréquence" />
        <Input label="Emails" placeholder="a@b.com" value="" onChange={() => {}} className="mt-4" />
        <Button className="mt-4">Enregistrer</Button>
      </Panel>
    </div>
  );
}
