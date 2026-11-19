"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function TemplatesDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">{s.moduleName}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.documentationTitle}</h1>
        <p className="doc-description">{s.documentationDescription}</p>
      </div>
      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutHeading}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.docAbout}
      </p>
      <h2>{locale === "en" ? "Generate a document" : "Générer un document"}</h2>
      <p>{locale === "en" ? "GET /api/templates?locale=en lists the three templates and their fields. POST /api/templates returns a downloadable file. Reports and project sheets are printable HTML. Email drafts open in a mail client. Generation does not send mail or store a server copy." : "GET /api/templates?locale=fr liste les trois modèles et leurs champs. POST /api/templates renvoie un fichier téléchargeable. Les rapports et les fiches projet sont des pages HTML imprimables. Le brouillon de courriel s’ouvre dans une messagerie. Le téléchargement conserve la copie sur l’appareil, sans envoi du courriel."}</p>
      <CodeBlock code={`import requests
r = requests.post(base_url + "/api/templates", json={
    "model": "rapport", "locale": "fr", "name": "Ventes de mars",
    "fields": {"periode": "Mars", "responsable": "Camille", "ca_realise": "1250,50"}
})
r.raise_for_status()
from pathlib import Path
Path("ventes-mars.html").write_bytes(r.content)`} language="python" />
      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.breadcrumbSimulator}</Link>
      </p>
    </div>
  );
}
