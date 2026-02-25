"use client";

import Link from "next/link";
import { Tabs, CodeBlock, Panel, Input, Button } from "@/components/bpm";

const docContent = (
  <>
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>À propos</h2>
    <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
      Le module <strong>Commentaires</strong> permet d&apos;ajouter des commentaires et annotations sur une entité (document, ligne, projet). Fil de discussion avec auteur et date.
    </p>
    <CodeBlock code={'# bpm — afficher les commentaires d\'un document\nbpm.title("Commentaires")\nbpm.panel("Nouveau commentaire", input_area)'} language="python" />
  </>
);

function SimuContent() {
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>Fil de commentaires (démo)</h2>
      <Panel variant="info" title="Commentaires">
        <div className="space-y-3 text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <div className="p-2 rounded" style={{ background: "var(--bpm-bg-primary)" }}><strong style={{ color: "var(--bpm-text-primary)" }}>Alice</strong> — 25/02 — Bonne avancée sur le livrable.</div>
          <div className="p-2 rounded" style={{ background: "var(--bpm-bg-primary)" }}><strong style={{ color: "var(--bpm-text-primary)" }}>Bob</strong> — 25/02 — Merci, je finalise la doc.</div>
        </div>
        <Input label="Ajouter un commentaire" placeholder="Votre message..." value="" onChange={() => {}} />
        <Button size="small" className="mt-2">Envoyer</Button>
      </Panel>
    </>
  );
}

export default function CommentairesModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → Commentaires</div>
        <h1>Commentaires</h1>
        <p className="doc-description">Commentaires et annotations sur une entité. Testez dans le Simulateur.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Contenu & productivité</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/commentaires/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>Ouvrir le simulateur</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: "Documentation", content: docContent }, { label: "Simulateur", content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
