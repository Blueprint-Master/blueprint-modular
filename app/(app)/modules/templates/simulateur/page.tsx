"use client";

import Link from "next/link";
import { Panel, Selectbox, Input, Button } from "@/components/bpm";

export default function TemplatesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">Templates</Link> → Simulateur
        </div>
        <h1>Simulateur — Templates</h1>
        <p className="doc-description">Choisir un modèle et remplir les champs (démo).</p>
      </div>
      <Panel variant="info" title="Modèles disponibles">
        <Selectbox
          options={[{ value: "rapport", label: "Rapport mensuel" }, { value: "fiche", label: "Fiche projet" }, { value: "email", label: "Email type" }]}
          value={null}
          onChange={() => {}}
          placeholder="Choisir un modèle..."
          label="Modèle"
        />
        <Input label="Nom du document" placeholder="Ex. Rapport mars 2025" value="" onChange={() => {}} className="mt-4" />
        <Button className="mt-4">Créer à partir du modèle</Button>
      </Panel>
    </div>
  );
}
