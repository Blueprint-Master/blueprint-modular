"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ConnecteursDocumentationPage() {
  const { locale } = useI18n();
  const S = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/connecteurs">{S.pageTitle}</Link> → {S.docBreadcrumb}
        </nav>
        <h1>{S.docTitle}</h1>
        <p className="doc-description">{S.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        {locale === "fr" ? "Utiliser le module dans votre application" : "Use the module in your application"}
      </h2>
      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Dans l’application extraite du ZIP, le serveur dispose de quatre opérations configurables. Il reçoit le coffre de l’application et, pour Google, un fournisseur de jeton d’accès. Le client ne reçoit aucune valeur d’identification. Configurez restOrigin pour votre API REST."
          : "The server in the extracted application includes four configurable operations. Supply the application vault and, for Google, an access token provider. Credentials remain on the server. Set restOrigin for your REST API."}
      </p>
      <CodeBlock language="typescript" code={`import { runConnector } from "@/lib/connectors/runtime";

const charges = await runConnector({ vault }, appId, "stripe", "listCharges", { limit: 10 });
const rows = await runConnector({ vault, sheetsAccessToken }, appId,
  "google-sheets", "readRange", { range: "Sheet1!A1:C50" });`} />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.docTypesTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>API REST</strong> {S.typeApiRest}
        </li>
        <li>
          <strong>SFTP</strong> {S.typeSftp}
        </li>
        <li>
          <strong>PostgreSQL</strong> {S.typePostgres}
        </li>
        <li>
          <strong>MySQL</strong> {S.typeMysql}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.docModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.docModelText}
      </p>
      <CodeBlock code={S.docJsonExample} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.docSecretsTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          {S.secret1a}
          <code>secretRef</code>
          {S.secret1b}
        </li>
        <li>{S.secret2}</li>
        <li>
          {S.secret3a}
          <code>error</code>
          {S.secret3b}
          <code>connected</code>
          {S.secret3c}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {S.docSchedTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {S.sched1}
        <code>paused</code>
        {S.sched2}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Python · REST / SFTP / PostgreSQL / MySQL</h2>
      <CodeBlock language="python" code={`from bpm import source_imports as imports

# db: application SQLite store. connection: authenticated psycopg connection.
db = imports.open_store("imports.sqlite")
source = "erp"
current = imports.snapshot(db, source)
revision = current["revision"] if current else 0
imports.sync(db, source, "id",
    lambda: imports.read_table(connection, "postgresql", "sales", ["id", "amount"]),
    expected_revision=revision)

# PyMySQL: read_table(connection, "mysql", "sales", ["id", "amount"])
# Paramiko: read_sftp(sftp, "/exports/sales.csv") on a verified SSH connection
# urllib: read_rest(response) on an authenticated JSON HTTP response
print(imports.snapshot(db, source))`} />

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/connecteurs/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {S.openSimulator}
        </Link>
      </p>
    </div>
  );
}
