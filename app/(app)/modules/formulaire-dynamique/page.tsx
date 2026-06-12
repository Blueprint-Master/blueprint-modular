"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import FormulaireDynamiqueSimulateur from "./simulateur-content";
import { getStrings, rich, type ModuleStrings } from "./strings";

function DocContent({ t }: { t: ModuleStrings }) {
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.module.aboutHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {rich(t.module.aboutBody)}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.module.componentsHeading}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {rich(t.module.componentsBody)}
      </p>
      <CodeBlock
        code={`import bpm

schema = load_form_schema("achat-materiel")  # le schéma JSON pilote tout

for field in schema["fields"]:
    if not visible(field, values):          # règle visibleIf évaluée en direct
        continue
    if field["type"] == "select":
        bpm.selectbox(field["label"], options=field["options"])
    elif field["type"] == "textarea":
        bpm.textarea(field["label"])
    elif field["type"] == "date":
        bpm.dateInput(field["label"])

bpm.button("Soumettre la demande", on_click=valider_et_soumettre)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {t.module.settingsHeading}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {t.module.settingsBodyBefore}
        <Link href="/modules/formulaire-dynamique/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {t.module.settingsDocLink}
        </Link>
        {t.module.settingsBodyAfter}
      </p>
    </div>
  );
}

export default function FormulaireDynamiqueModulePage() {
  const { locale } = useI18n();
  const t = getStrings(locale);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → {t.moduleName}
        </div>
        <h1>{t.module.title}</h1>
        <p className="doc-description">{t.module.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.module.badgeCategory}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/formulaire-dynamique/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: t.module.tabDocumentation, content: <DocContent t={t} /> },
          { label: t.module.tabSimulator, content: <FormulaireDynamiqueSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
