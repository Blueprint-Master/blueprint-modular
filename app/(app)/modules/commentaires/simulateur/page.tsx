"use client";

import Link from "next/link";
import { Panel, Input, Button } from "@/components/bpm";

export default function CommentairesSimulateurPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/commentaires">Commentaires</Link> → Simulateur
        </div>
        <h1>Simulateur — Commentaires</h1>
        <p className="doc-description">Fil de commentaires de démo et zone de saisie.</p>
      </div>
      <Panel variant="info" title="Commentaires">
        <div className="space-y-3 text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <div className="p-2 rounded" style={{ background: "var(--bpm-bg-primary)" }}><strong style={{ color: "var(--bpm-text-primary)" }}>Alice</strong> — 25/02 — Bonne avancée.</div>
          <div className="p-2 rounded" style={{ background: "var(--bpm-bg-primary)" }}><strong style={{ color: "var(--bpm-text-primary)" }}>Bob</strong> — 25/02 — Je finalise la doc.</div>
        </div>
        <Input label="Ajouter un commentaire" placeholder="Votre message..." value="" onChange={() => {}} />
        <Button size="small" className="mt-2">Envoyer</Button>
      </Panel>
    </div>
  );
}
