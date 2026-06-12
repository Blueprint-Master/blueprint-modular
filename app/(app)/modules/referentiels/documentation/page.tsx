"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

const MODEL_SNIPPET_FR = `{
  "referentiel": "devises",
  "code": "EUR",              // unique, format imposé (ex. devise = 3 lettres majuscules)
  "libelle": "Euro",
  "actif": true,              // false = masqué dans les formulaires, données conservées
  "utilisations": 42,         // > 0 => suppression refusée, désactivation recommandée
  "champs": {                 // attributs propres au référentiel
    "symbole": "€",
    "decimales": 2
  }
}`;

const MODEL_SNIPPET_EN = `{
  "referentiel": "devises",
  "code": "EUR",              // unique, enforced format (e.g. currency = 3 uppercase letters)
  "libelle": "Euro",
  "actif": true,              // false = hidden in forms, data kept
  "utilisations": 42,         // > 0 => deletion refused, deactivation recommended
  "champs": {                 // attributes specific to the reference table
    "symbole": "€",
    "decimales": 2
  }
}`;

export default function ReferentielsDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  const en = locale === "en";
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/referentiels">{s.moduleName}</Link> → {s.tabDocumentation}
        </nav>
        <h1>{s.docPageTitle}</h1>
        <p className="doc-description">{s.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docModelTitle}
      </h2>
      {en ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Every entry shares a common base — <code>code</code> (business identifier, unique within
          the reference table, enforced format), <code>libelle</code>, <code>actif</code> and{" "}
          <code>utilisations</code> (number of application records referencing it). The specific
          attributes (<code>symbole</code>, <code>decimales</code>, <code>taux</code>,
          <code>famille</code>…) depend on the reference table and drive the displayed columns.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Toute entrée partage un socle commun — <code>code</code> (identifiant métier, unique dans
          le référentiel, format contrôlé), <code>libelle</code>, <code>actif</code> et{" "}
          <code>utilisations</code> (nombre d&apos;enregistrements applicatifs qui la référencent).
          Les attributs spécifiques (<code>symbole</code>, <code>decimales</code>, <code>taux</code>,
          <code>famille</code>…) dépendent du référentiel et pilotent les colonnes affichées.
        </p>
      )}
      <CodeBlock code={en ? MODEL_SNIPPET_EN : MODEL_SNIPPET_FR} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docGovernanceTitle}
      </h2>
      {en ? (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Reference data administrator</strong> — creates the code tables, defines code
            formats and attributes; the only role allowed to delete an entry (never an entry in
            use: disabling is the normal path).
          </li>
          <li>
            <strong>Business owners</strong> — propose additions and label corrections within
            their scope (Finance for VAT rates, Logistics for units…); changes are traced by name
            in the history.
          </li>
          <li>
            <strong>Consuming applications</strong> — read-only access; they never modify a
            reference table directly.
          </li>
        </ul>
      ) : (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Administrateur référentiels</strong> — crée les tables de codes, définit le
            format des codes et les attributs ; seul habilité à supprimer une entrée (jamais une
            entrée utilisée : la désactivation est la voie normale).
          </li>
          <li>
            <strong>Responsables métier</strong> — proposent ajouts et corrections de libellés sur
            leur périmètre (la DAF pour les taux de TVA, la logistique pour les unités…) ; les
            modifications sont tracées nominativement dans l&apos;historique.
          </li>
          <li>
            <strong>Applications consommatrices</strong> — accès en lecture seule ; elles ne
            modifient jamais un référentiel directement.
          </li>
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docVersioningTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.docVersioningBody}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docDistributionTitle}
      </h2>
      {en ? (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>Read API</strong> — <code>GET /referentiels/&#123;id&#125;?version=…</code>;
            forms only consume entries with <code>actif: true</code>.
          </li>
          <li>
            <strong>Caching and invalidation</strong> — applications cache the current version and
            resynchronise when the version number changes (webhook or polling).
          </li>
          <li>
            <strong>CSV export</strong> — one-off extraction for audits or imports into a
            third-party tool; this is the simulator&apos;s &quot;Export to CSV&quot; button.
          </li>
        </ul>
      ) : (
        <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
          <li>
            <strong>API de lecture</strong> — <code>GET /referentiels/&#123;id&#125;?version=…</code> ;
            les formulaires ne consomment que les entrées <code>actif: true</code>.
          </li>
          <li>
            <strong>Cache et invalidation</strong> — les applications mettent en cache la version
            courante et se resynchronisent quand le numéro de version change (webhook ou polling).
          </li>
          <li>
            <strong>Export CSV</strong> — extraction ponctuelle pour audit ou import dans un outil
            tiers ; c&apos;est le bouton « Exporter en CSV » du simulateur.
          </li>
        </ul>
      )}

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.docProductionTitle}
      </h2>
      {en ? (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          The simulator runs locally (seeded React state). To plug in a real backend: persist the
          entries in a <code>reference_entries</code> table (uniqueness constraint on{" "}
          <code>referentiel + code</code>), compute <code>utilisations</code> from the
          applications&apos; foreign keys, log every action in <code>reference_audit</code> and
          expose the versioned read API described above.
        </p>
      ) : (
        <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
          Le simulateur fonctionne en local (état React seedé). Pour brancher un vrai backend :
          persister les entrées dans une table <code>reference_entries</code> (contrainte
          d&apos;unicité <code>referentiel + code</code>), calculer <code>utilisations</code> via les
          clés étrangères des applications, journaliser chaque action dans{" "}
          <code>reference_audit</code> et exposer l&apos;API de lecture versionnée décrite ci-dessus.
        </p>
      )}

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/referentiels/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
