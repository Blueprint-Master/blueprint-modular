"use client";

import Link from "next/link";

export default function IADocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/ia">IA</Link> → Documentation
        </nav>
        <h1>Documentation — IA</h1>
        <p className="doc-description">
          Assistant conversationnel (Qwen par défaut via Ollama). Contexte des modules Wiki et Documents. Historique des conversations, sélection des modules pour le contexte.
        </p>
      </div>
      <div className="prose max-w-none" style={{ color: "var(--bpm-text-primary)" }}>
        <p>
          <a
            href="https://docs.blueprint-modular.com/modules/ia.html"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            Voir la documentation complète du module IA sur docs.blueprint-modular.com →
          </a>
        </p>
      </div>
    </div>
  );
}
