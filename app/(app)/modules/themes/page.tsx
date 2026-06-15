"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";
import ThemesSimulateur from "./simulateur-content";

function DocContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.aboutText}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.coverageTitle}
      </h3>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.coverageItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.panel</code>, <code>bpm.colorPicker</code>,{" "}
        <code>bpm.slider</code>, <code>bpm.input</code>, <code>bpm.badge</code>,{" "}
        <code>bpm.confirmModal</code> {s.componentsJoin} <code>bpm.toast</code>.
      </p>
      <CodeBlock
        code={`import bpm

theme = bpm.theme.get("acme-corp")

bpm.input("Nom de l'app", value=theme.couleurApp, on_change=set_nom)
bpm.colorPicker("Couleur d'accent", value=theme.accent, on_change=set_accent)
bpm.colorPicker("Couleur de fond", value=theme.fond, on_change=set_fond)
bpm.slider("Rayon de bordure (px)", value=theme.rayon, min=0, max=16, on_change=set_rayon)

bpm.button("Enregistrer comme nouveau thème", on_click=enregistrer)
bpm.button("Définir par défaut", on_click=definir_defaut)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.configTextBeforeLink}{" "}
        <Link href="/modules/themes/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.configLinkLabel}
        </Link>{" "}
        {s.configTextAfterLink}
      </p>
    </div>
  );
}

export default function ThemesModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={s.breadcrumbThemes}
        title={s.moduleTitle}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/themes/simulateur", label: s.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocContent /> },
          { label: s.tabSimulator, content: <ThemesSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
