"use client";

import Link from "next/link";
import { Panel, Table } from "@/components/bpm";

const logData = [{ qui: "Alice", quand: "2025-02-25 10:00", quoi: "Modification statut" }];

export default function AuditLogSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/audit-log">Audit / Log</Link> → Simulateur</div>
        <h1>Simulateur — Audit / Log</h1>
        <p className="doc-description">Historique (démo).</p>
      </div>
      <Panel variant="info" title="Historique">
        <Table columns={[{ key: "qui", label: "Qui" }, { key: "quand", label: "Quand" }, { key: "quoi", label: "Quoi" }]} data={logData} striped hover />
      </Panel>
    </div>
  );
}
