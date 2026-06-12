"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getAuditLogStrings } from "../strings";

const EVENT_JSON_FR = `{
  "id": "EVT-1032",
  "timestamp": "2026-06-12T17:40:00",       // ISO 8601, jamais modifié
  "acteur": "Alice Martin",
  "acteurId": "a.martin",                   // identifiant stable (humain, service, système)
  "action": "modification",                 // creation | modification | suppression | connexion
  "entite": "Devis DV-2026-104",
  "detail": "statut : brouillon → validé",  // avant → après, lisible par un humain
  "ip": "10.20.4.18",
  "source": "Interface web"                 // Interface web | API | Tâche planifiée
}`;

const EVENT_JSON_EN = `{
  "id": "EVT-1032",
  "timestamp": "2026-06-12T17:40:00",       // ISO 8601, never modified
  "acteur": "Alice Martin",
  "acteurId": "a.martin",                   // stable identifier (human, service, system)
  "action": "modification",                 // creation | modification | suppression | connexion
  "entite": "Quote DV-2026-104",
  "detail": "status: draft → validated",    // before → after, human readable
  "ip": "10.20.4.18",
  "source": "Web interface"                 // Web interface | API | Scheduled task
}`;

export default function AuditLogDocumentationPage() {
  const { locale } = useI18n();
  const s = getAuditLogStrings(locale);
  const isFr = locale === "fr";
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/audit-log">{s.modulePage.breadcrumbCurrent}</Link> →{" "}
          {s.docPage.breadcrumbCurrent}
        </nav>
        <h1>{s.docPage.title}</h1>
        <p className="doc-description">{s.docPage.description}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docPage.eventModelTitle}
      </h2>
      {isFr ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Un événement d&apos;audit est un enregistrement immuable : il répond à « qui »
          (<code>acteur</code>, <code>acteurId</code>, <code>ip</code>), « quand »
          (<code>timestamp</code> ISO 8601, posé côté serveur) et « quoi » (<code>action</code>,{" "}
          <code>entite</code>, <code>detail</code> avec l&apos;avant/après lisible). La{" "}
          <code>source</code> distingue l&apos;interface web, l&apos;API et les tâches planifiées.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          An audit event is an immutable record: it answers &quot;who&quot; (<code>acteur</code>,{" "}
          <code>acteurId</code>, <code>ip</code>), &quot;when&quot; (<code>timestamp</code>, ISO
          8601, set server-side) and &quot;what&quot; (<code>action</code>, <code>entite</code>,{" "}
          <code>detail</code> with a readable before/after). The <code>source</code> distinguishes
          the web interface, the API and scheduled tasks.
        </p>
      )}
      <CodeBlock code={isFr ? EVENT_JSON_FR : EVENT_JSON_EN} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docPage.retentionTitle}
      </h2>
      {isFr ? (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Journal chaud</strong> — 90 jours en base, interrogeable depuis l&apos;interface
            (le simulateur montre une fenêtre de 10 jours).
          </li>
          <li>
            <strong>Archive froide</strong> — export mensuel compressé vers un stockage objet,
            conservé 6 ans (exigence courante pour les pièces comptables et contractuelles).
          </li>
          <li>
            <strong>Purge</strong> — la purge elle-même est journalisée (événement{" "}
            <code>suppression</code> émis par l&apos;acteur <code>Système</code>), jamais silencieuse.
          </li>
        </ul>
      ) : (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Hot log</strong> — 90 days in the database, queryable from the interface (the
            simulator shows a 10-day window).
          </li>
          <li>
            <strong>Cold archive</strong> — compressed monthly export to object storage, kept for 6
            years (a common requirement for accounting and contractual records).
          </li>
          <li>
            <strong>Purge</strong> — the purge itself is logged (a <code>suppression</code> event
            emitted by the <code>System</code> actor), never silent.
          </li>
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docPage.integrityTitle}
      </h2>
      {isFr ? (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Append-only</strong> — la table <code>audit_events</code> n&apos;autorise ni{" "}
            <code>UPDATE</code> ni <code>DELETE</code> applicatifs ; on corrige en ajoutant un
            événement, jamais en réécrivant l&apos;historique.
          </li>
          <li>
            <strong>Chaînage</strong> — chaque ligne peut embarquer le hachage SHA-256 de la
            précédente : toute altération a posteriori casse la chaîne et se détecte.
          </li>
          <li>
            <strong>Horodatage de confiance</strong> — timestamps posés côté serveur, jamais par le
            client ; horloge synchronisée (NTP).
          </li>
          <li>
            <strong>Données personnelles</strong> — le <code>detail</code> décrit le changement sans
            recopier de données sensibles (RGPD : minimisation) ; les adresses IP suivent la même
            politique de rétention que le journal.
          </li>
        </ul>
      ) : (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Append-only</strong> — the <code>audit_events</code> table allows neither
            application-level <code>UPDATE</code> nor <code>DELETE</code>; corrections are made by
            adding an event, never by rewriting history.
          </li>
          <li>
            <strong>Chaining</strong> — each row can embed the SHA-256 hash of the previous one: any
            after-the-fact tampering breaks the chain and gets detected.
          </li>
          <li>
            <strong>Trusted timestamps</strong> — timestamps are set server-side, never by the
            client; clock kept in sync (NTP).
          </li>
          <li>
            <strong>Personal data</strong> — the <code>detail</code> describes the change without
            copying sensitive data (GDPR: data minimisation); IP addresses follow the same retention
            policy as the log.
          </li>
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docPage.integrationTitle}
      </h2>
      {isFr ? (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Le simulateur fonctionne en local (32 événements seedés, filtres et pagination côté
          client). Pour brancher un vrai backend : émettre un événement depuis un middleware à
          chaque mutation (création, modification, suppression) et à chaque authentification ;
          exposer une API de lecture paginée acceptant les mêmes paramètres que les filtres du
          simulateur (<code>q</code>, <code>acteur</code>, <code>action</code>, <code>depuis</code>) ;
          servir l&apos;export CSV côté serveur au-delà de quelques milliers de lignes. La recherche
          plein texte gagne à être indexée (index trigram ou moteur dédié).
        </p>
      ) : (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          The simulator runs locally (32 seeded events, client-side filters and pagination). To plug
          in a real backend: emit an event from a middleware on every mutation (creation,
          modification, deletion) and on every authentication; expose a paginated read API accepting
          the same parameters as the simulator&apos;s filters (<code>q</code>, <code>acteur</code>,{" "}
          <code>action</code>, <code>depuis</code>); serve the CSV export server-side beyond a few
          thousand rows. Full-text search benefits from indexing (trigram index or a dedicated
          engine).
        </p>
      )}

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/audit-log/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.docPage.openSimulator}
        </Link>
      </p>
    </div>
  );
}
