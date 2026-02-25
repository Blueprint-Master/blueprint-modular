"use client";

import Link from "next/link";
import { Panel, Selectbox, Input, Button } from "@/components/bpm";

export default function ConnecteursSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/connecteurs">Connecteurs</Link> → Simulateur</div>
        <h1>Simulateur — Connecteurs</h1>
        <p className="doc-description">Configurer un connecteur.</p>
      </div>
      <Panel variant="info" title="Nouveau connecteur">
        <Selectbox options={[{ value: "api", label: "API REST" }, { value: "sftp", label: "SFTP" }]} value={null} onChange={() => {}} placeholder="Type" label="Type" />
        <Input label="URL ou host" placeholder="https://api.example.com" value="" onChange={() => {}} className="mt-4" />
        <Button className="mt-4">Enregistrer</Button>
      </Panel>
    </div>
  );
}
