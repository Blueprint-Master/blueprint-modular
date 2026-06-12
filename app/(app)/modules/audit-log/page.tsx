"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import AuditLogSimulateur from "./simulateur-content";
import { getAuditLogStrings } from "./strings";

const CODE_FR = `import bpm

bpm.metricRow([
    bpm.metric("Événements (10 j)", 32),
    bpm.metric("Acteurs distincts", 5),
    bpm.metric("Suppressions (10 j)", 4),
])

bpm.input("Recherche", placeholder="Acteur, entité, détail…", on_change=filtrer)
bpm.selectbox("Acteur", options=acteurs, on_change=filtrer)

bpm.table(
    columns=[("timestamp", "Horodatage"), ("acteur", "Acteur"),
             ("action", "Action"), ("entite", "Entité"), ("detail", "Détail")],
    data=evenements_filtres,
    on_row_click=ouvrir_detail,   # bpm.drawer + bpm.jsonViewer
)

bpm.button("Exporter en CSV", on_click=exporter_csv)`;

const CODE_EN = `import bpm

bpm.metricRow([
    bpm.metric("Events (10 d)", 32),
    bpm.metric("Distinct actors", 5),
    bpm.metric("Deletions (10 d)", 4),
])

bpm.input("Search", placeholder="Actor, entity, detail…", on_change=filter)
bpm.selectbox("Actor", options=actors, on_change=filter)

bpm.table(
    columns=[("timestamp", "Timestamp"), ("acteur", "Actor"),
             ("action", "Action"), ("entite", "Entity"), ("detail", "Detail")],
    data=filtered_events,
    on_row_click=open_detail,   # bpm.drawer + bpm.jsonViewer
)

bpm.button("Export CSV", on_click=export_csv)`;

function DocContent({ locale }: { locale: Locale }) {
  const isFr = locale === "fr";
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {isFr ? "À propos" : "About"}
      </h2>
      {isFr ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Le module Audit / Log est le journal de bord de l&apos;application : chaque création,
          modification, suppression ou connexion y est tracée avec son acteur, son horodatage,
          l&apos;entité concernée et le détail du changement (ex. « statut : brouillon → validé »).
          C&apos;est l&apos;outil qu&apos;un administrateur ou un auditeur ouvre pour répondre à la
          question « qui a changé quoi, et quand ? » — recherche plein texte, filtres combinables
          (acteur, type d&apos;action, période), détail complet de chaque événement et export CSV.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          The Audit / Log module is the application&apos;s logbook: every creation, modification,
          deletion or login is recorded with its actor, its timestamp, the entity involved and the
          detail of the change (e.g. &quot;status: draft → validated&quot;). It&apos;s the tool an
          administrator or an auditor opens to answer the question &quot;who changed what, and
          when?&quot; — full-text search, combinable filters (actor, action type, period), full
          detail for every event and CSV export.
        </p>
      )}
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {isFr ? "Composants utilisés" : "Components used"}
      </h3>
      {isFr ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.input</code> et <code>bpm.selectbox</code> (filtres
          combinables), <code>bpm.chip</code> (résumé des filtres actifs), <code>bpm.table</code>{" "}
          (acteur rendu par <code>bpm.avatar</code>, action par <code>bpm.badge</code>),{" "}
          <code>bpm.pagination</code>, <code>bpm.drawer</code> + <code>bpm.jsonViewer</code> (détail
          d&apos;un événement) et <code>bpm.toast</code> (confirmation d&apos;export).
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.input</code> and <code>bpm.selectbox</code>{" "}
          (combinable filters), <code>bpm.chip</code> (summary of active filters),{" "}
          <code>bpm.table</code> (actor rendered with <code>bpm.avatar</code>, action with{" "}
          <code>bpm.badge</code>), <code>bpm.pagination</code>, <code>bpm.drawer</code> +{" "}
          <code>bpm.jsonViewer</code> (event detail) and <code>bpm.toast</code> (export
          confirmation).
        </p>
      )}
      <CodeBlock code={isFr ? CODE_FR : CODE_EN} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {isFr ? "Paramétrage" : "Configuration"}
      </h3>
      {isFr ? (
        <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          Le simulateur fonctionne entièrement en local : 32 événements seedés sur 10 jours, filtres,
          pagination, détail et export CSV sans aucune API. En production, brancher la lecture sur
          votre table <code>audit_events</code> (append-only) et l&apos;écriture sur un middleware qui
          journalise chaque mutation. Voir la{" "}
          <Link href="/modules/audit-log/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
            documentation
          </Link>{" "}
          pour le modèle d&apos;événement, la rétention et les garanties d&apos;intégrité.
        </p>
      ) : (
        <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          The simulator runs entirely locally: 32 events seeded over 10 days, filters, pagination,
          detail and CSV export with no API at all. In production, plug reads into your{" "}
          <code>audit_events</code> table (append-only) and writes into a middleware that logs every
          mutation. See the{" "}
          <Link href="/modules/audit-log/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
            documentation
          </Link>{" "}
          for the event model, retention and integrity guarantees.
        </p>
      )}
    </div>
  );
}

export default function AuditLogModulePage() {
  const { locale } = useI18n();
  const s = getAuditLogStrings(locale);
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {s.modulePage.breadcrumbCurrent}
        </div>
        <h1>{s.modulePage.title}</h1>
        <p className="doc-description">{s.modulePage.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{s.modulePage.category}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/audit-log/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {s.modulePage.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: s.modulePage.tabDocumentation, content: <DocContent locale={locale} /> },
          { label: s.modulePage.tabSimulator, content: <AuditLogSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
