"use client";

import Link from "next/link";
import { Panel, Input, Button } from "@/components/bpm";

export default function WebhooksSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/webhooks">Webhooks</Link> → Simulateur</div>
        <h1>Simulateur — Webhooks</h1>
        <p className="doc-description">Ajouter une URL (démo).</p>
      </div>
      <Panel variant="info" title="Webhook">
        <Input label="URL" placeholder="https://votre-app.com/webhook" value="" onChange={() => {}} />
        <Button className="mt-4">Enregistrer</Button>
      </Panel>
    </div>
  );
}
