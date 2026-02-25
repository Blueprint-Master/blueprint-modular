"use client";

import Link from "next/link";
import { Panel, Selectbox, Input, Button } from "@/components/bpm";

export default function NotificationsCibleesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/notifications-ciblees">Notifications ciblées</Link> → Simulateur</div>
        <h1>Simulateur — Notifications ciblées</h1>
        <p className="doc-description">Créer une règle (démo).</p>
      </div>
      <Panel variant="info" title="Règle">
        <Selectbox options={[{ value: "validation", label: "Validation document" }]} value={null} onChange={() => {}} placeholder="Événement" label="Événement" />
        <Input label="Destinataires" placeholder="admin@, équipe" value="" onChange={() => {}} className="mt-4" />
        <Button className="mt-4">Enregistrer</Button>
      </Panel>
    </div>
  );
}
