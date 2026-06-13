"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function TachesDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  const d = s.docPage;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">{s.breadcrumb.tasks}</Link> →{" "}
          {s.breadcrumb.documentation}
        </nav>
        <h1>{d.title}</h1>
        <p className="doc-description">{d.description}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.modelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {d.modelBefore}
        <code>{d.modelIso}</code>
        {d.modelAfter}
      </p>
      <CodeBlock
        code={`{
  "id": "t-3",
  "titre": "Migration Postgres 16",
  "description": "Plan de bascule, répétition sur réplique.",
  "assigne": "Claire Petit",
  "echeance": "2026-06-09",      // ISO AAAA-MM-JJ
  "priorite": "haute",           // haute | normale | basse
  "statut": "À faire"            // À faire | En cours | Terminé
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.statesTitle}
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {d.statesIntro}
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>{d.stateStartTerm}</strong>
          {d.stateStartText}
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>{d.stateCompleteTerm}</strong>
          {d.stateCompleteText}
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>{d.stateEditTerm}</strong>
          {d.stateEditText}
        </li>
        <li>
          <strong style={{ color: "var(--bpm-text-primary)" }}>{d.stateDeleteTerm}</strong>
          {d.stateDeleteBefore}
          <code>bpm.confirmModal</code>
          {d.stateDeleteAfter}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.overdueTitle}
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {d.overdueBefore}
        <strong style={{ color: "var(--bpm-text-primary)" }}>{d.overdueStrong}</strong>
        {d.overdueMiddle}
        <em>{d.overdueEm}</em>
        {d.overdueAfter}
      </p>
      <CodeBlock
        code={`// Référence déterministe du simulateur (pas de new Date() au render)
const AUJOURDHUI = "2026-06-12";

const enRetard = (t) => t.echeance < AUJOURDHUI && t.statut !== "Terminé";`}
        language="javascript"
      />
      <ul className="mb-4 mt-3 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {d.overdueRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.filtersTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {d.filtersText}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {d.integrationTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {d.integrationBefore}
        <code>tasks</code>
        {d.integrationAfter}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/taches/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {d.trySimulator}
        </Link>
      </p>
    </div>
  );
}
