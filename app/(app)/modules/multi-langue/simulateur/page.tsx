"use client";

import Link from "next/link";
import { Panel, Selectbox, Button } from "@/components/bpm";

export default function MultiLangueSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → <Link href="/modules/multi-langue">Multi-langue</Link> → Simulateur</div>
        <h1>Simulateur — Multi-langue</h1>
        <p className="doc-description">Choisir la langue (démo).</p>
      </div>
      <Panel variant="info" title="Langue">
        <Selectbox options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }]} value={null} onChange={() => {}} placeholder="Langue" label="Langue" />
        <Button className="mt-4">Appliquer</Button>
      </Panel>
    </div>
  );
}
