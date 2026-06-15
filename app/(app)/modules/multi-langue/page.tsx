"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import MultiLangueSimulateur from "./simulateur-content";
import { STR } from "./strings";

export default function MultiLangueModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];

  const docContent = (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.about1}
        <code>Intl.PluralRules</code>
        {s.about2}
        <code>Intl.DateTimeFormat</code>, <code>Intl.NumberFormat</code>
        {s.about3}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>
        {s.comp1}
        <code>bpm.progress</code>
        {s.comp2}
        <code>bpm.table</code>
        {s.comp3}
        <code>bpm.badge</code>
        {s.comp4}
        <code>bpm.message</code>
        {s.comp5}
        <code>bpm.modal</code> + <code>bpm.input</code>
        {s.comp6}
        <code>bpm.toast</code>.
      </p>
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Langues", 3),
    bpm.metric("Clés de traduction", 16),
    bpm.metric("Couverture ES", "81 %"),
])

# t() résout une clé dans la langue active, avec repli FR
bpm.title(t("app.titre"))                          # "Order tracking" en EN
bpm.text(t("message.bienvenue", prenom="Camille")) # interpolation
bpm.badge(t("commandes.nombre", count=3))          # pluriel one/other

bpm.progress(label="Español", value=81, max=100)
bpm.button("Traduire", on_click=ouvrir_editeur)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.settingsTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.settings1}
        <Link href="/modules/multi-langue/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.settingsDocLink}
        </Link>
        {s.settings2}
      </p>
    </div>
  );

  return (
    <div className="doc-page">
      <ModulePageHeader
        modulesLabel={s.breadcrumbModules}
        breadcrumbCurrent={s.moduleTitle}
        title={s.moduleTitle}
        description={s.pageDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/multi-langue/simulateur", label: s.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: docContent },
          { label: s.tabSimulator, content: <MultiLangueSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
