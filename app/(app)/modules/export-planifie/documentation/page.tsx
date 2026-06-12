"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";

export default function ExportPlanifieDocumentationPage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/export-planifie">Export planifié</Link> → Documentation
        </nav>
        <h1>Documentation — Export planifié</h1>
        <p className="doc-description">
          Envoi périodique de rapports PDF/CSV par e-mail : modèle de données, cycle de vie et
          points d&apos;intégration.
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Modèle de données
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Une planification associe un rapport à une fréquence, une heure d&apos;envoi, un format et
        une liste de destinataires. Le statut (<code>actif</code>) permet de suspendre sans
        supprimer ; <code>prochainEnvoi</code> est recalculé à chaque changement.
      </p>
      <CodeBlock
        code={`{
  "rapport": "Ventes — synthèse hebdomadaire",
  "format": "PDF",            // PDF | CSV
  "frequence": "weekly",      // daily | weekly | monthly
  "heure": "08:00",
  "destinataires": ["dir.commerciale@acme.fr", "ventes@acme.fr"],
  "actif": true
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Cycle de vie
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li><strong>Planifier</strong> — validation des adresses, calcul du prochain envoi, ajout en tête de liste.</li>
        <li><strong>Envoyer maintenant</strong> — déclenchement manuel sans toucher à la planification.</li>
        <li><strong>Suspendre / Reprendre</strong> — bascule du statut ; le prochain envoi est recalculé à la reprise.</li>
        <li><strong>Supprimer</strong> — confirmation explicite (<code>bpm.confirmModal</code>), action tracée dans l&apos;historique.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        Intégration en production
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend :
        persister les planifications (table <code>scheduled_exports</code>), déclencher les envois
        via un cron/worker qui génère le rapport (PDF/CSV) et l&apos;envoie par votre service
        e-mail, puis journaliser chaque envoi (l&apos;équivalent du flux « Derniers envois »).
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/export-planifie/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          Ouvrir le simulateur
        </Link>
      </p>
    </div>
  );
}
