"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { getStrings, rich } from "../strings";

export default function FormulaireDynamiqueDocumentationPage() {
  const { locale } = useI18n();
  const t = getStrings(locale);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/formulaire-dynamique">{t.moduleName}</Link> →{" "}
          {t.doc.breadcrumbCurrent}
        </nav>
        <h1>{t.doc.title}</h1>
        <p className="doc-description">{rich(t.doc.description)}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.principleHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {rich(t.doc.principleBody)}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.fieldTypesHeading}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.doc.fieldTypes.map((item, i) => (
          <li key={i}>{rich(item)}</li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.conditionsHeading} <code>visibleIf</code>
      </h2>
      <p className="mb-2" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {t.doc.conditionsIntro}
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>{rich(t.doc.conditionEquals)}</li>
        <li>{rich(t.doc.conditionGreaterThan)}</li>
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {rich(t.doc.conditionsMessages)}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.validationHeading}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.doc.validationRules.map((rule, i) => (
          <li key={i}>
            <strong>{rule.lead}</strong> — {rich(rule.text)}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.exampleHeading}
      </h2>
      <CodeBlock code={t.doc.exampleJson} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.doc.productionHeading}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {rich(t.doc.productionBody)}
      </p>

      <p className="mb-4 text-sm">
        {locale === "fr"
          ? "Dans une application Python, bpm.forms versionne le schéma, contrôle les réponses visibles et conserve la demande dans SQLite. Utilisez une base par organisation. L’application fournit l’identité de session et autorise le responsable avant la décision."
          : "In a Python application, bpm.forms versions the schema, validates visible answers and stores the request in SQLite. Use a database per organization. The host supplies the session identity and authorizes the reviewer before the decision."}
      </p>
      <CodeBlock language="python" code={`from bpm import forms
from contextlib import closing
import json
from pathlib import Path

schema = json.loads(Path("purchase.json").read_text(encoding="utf-8"))
with closing(forms.open_store("requests.sqlite")) as db:
    version = forms.publish(db, schema, expected_version=0)
    request = forms.submit(db, schema["id"], version,
        {"categorie": "mobilier", "montant": "450,50", "description": "Table"},
        requester="ops", request_id="purchase-42")
    forms.review(db, request, "approved", reviewer="finance")
    result = forms.get(db, request)`} />

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/formulaire-dynamique/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {t.openSimulator}
        </Link>
      </p>
    </div>
  );
}
