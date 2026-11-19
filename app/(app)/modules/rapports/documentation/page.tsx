"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function RapportsDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/rapports">{s.breadcrumbModule}</Link> → {s.docBreadcrumb}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.dataModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.dm1}
        <strong>{s.dmStrong1}</strong>
        {s.dm2}
        <strong>{s.dmStrong2}</strong>
        {s.dm3}
      </p>
      <CodeBlock code={s.docJsonExample} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.providedTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>{s.tmpl1Name}</strong>
          {s.tmpl1Pre}
          <code>bpm.lineChart</code>
          {s.tmpl1Post}
        </li>
        <li>
          <strong>{s.tmpl2Name}</strong>
          {s.tmpl2Pre}
          <code>bpm.barChart</code>
          {s.tmpl2Post}
        </li>
        <li>
          <strong>{s.tmpl3Name}</strong>
          {s.tmpl3Desc}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.behaviourTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>{s.b1Name}</strong>
          {s.b1Desc}
        </li>
        <li>
          <strong>{s.b2Name}</strong>
          {s.b2Desc}
        </li>
        <li>
          <strong>{s.b3Name}</strong>
          {s.b3Desc}
        </li>
        <li>
          <strong>{s.b4Name}</strong>
          {s.b4Pre}
          <code>bpm.confirmModal</code>
          {s.b4Post}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.prodTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {locale === "fr"
          ? "Le paquet Python inclut bpm.reports. Chaque application dispose d’une base SQLite dédiée sur disque persistant. La commande generate enregistre les lignes calculées, la période et l’auteur. La commande export restitue le CSV de cet instantané après redémarrage."
          : "The Python package includes bpm.reports. Use a dedicated SQLite file on persistent storage per application. The generate command stores the calculated rows, period and author. The export command returns that snapshot as CSV, including after restart."}
      </p>
      <CodeBlock language="bash" code={`python -m bpm.reports --db instance.sqlite generate --model monthly-revenue --start 2026-01-01 --end 2026-06-30 --author finance --input sales.csv --request-id h1
python -m bpm.reports --db instance.sqlite list
python -m bpm.reports --db instance.sqlite export h1 > h1.csv`} />
      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Le CSV d’entrée est en UTF-8, séparé par des virgules, avec une ligne d’en-tête. Les dates sont au format AAAA-MM-JJ. Pour monthly-revenue, fournir date et amount dans une même devise. Pour regional-orders, ajouter region et fournir une ligne par commande. Pour department-headcount, fournir date, employee, department et fte. La dernière observation de chaque salarié à la clôture détermine son service. Une sortie se saisit avec fte égal à zéro."
          : "Use a UTF-8 comma-separated input file with a header row and ISO dates. For monthly-revenue, provide date and amount in a single currency. For regional-orders, add region and supply one row per order. For department-headcount, provide date, employee, department and fte. The last observation at closing determines each employee’s department. Record a departure with zero fte."}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/rapports/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
