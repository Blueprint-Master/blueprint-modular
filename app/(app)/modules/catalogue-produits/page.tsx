"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import CatalogueProduitsSimulateur from "./simulateur-content";
import { STR } from "./strings";

export default function CatalogueProduitsModulePage() {
  const { locale } = useI18n();
  const T = STR[locale];

  const docContent = (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {T.aboutBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.componentsTitle}
      </h3>
      {locale === "fr" ? (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.table</code> (statut rendu par <code>bpm.badge</code>,
          actions par <code>bpm.button</code>), <code>bpm.input</code> (recherche),{" "}
          <code>bpm.selectbox</code> (catégorie, tri), <code>bpm.drawer</code> (fiche produit),{" "}
          <code>bpm.barcode</code> + <code>bpm.qrCode</code>, <code>bpm.modal</code> +{" "}
          <code>bpm.numberInput</code> (création), <code>bpm.confirmModal</code> et{" "}
          <code>bpm.toast</code>.
        </p>
      ) : (
        <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          <code>bpm.metricRow</code>, <code>bpm.table</code> (status rendered with{" "}
          <code>bpm.badge</code>, actions with <code>bpm.button</code>), <code>bpm.input</code>{" "}
          (search), <code>bpm.selectbox</code> (category, sort), <code>bpm.drawer</code> (product
          sheet), <code>bpm.barcode</code> + <code>bpm.qrCode</code>, <code>bpm.modal</code> +{" "}
          <code>bpm.numberInput</code> (creation), <code>bpm.confirmModal</code> and{" "}
          <code>bpm.toast</code>.
        </p>
      )}
      <CodeBlock
        code={`import bpm

bpm.metricRow([
    bpm.metric("Produits", 10),
    bpm.metric("Valeur du stock", "18 432,10 €"),
    bpm.metric("Ruptures / stock faible", 5),
])

bpm.table(
    columns=[("ref", "Réf."), ("nom", "Produit"), ("prix", "Prix"), ("stock", "Stock")],
    data=produits,
    on_row_click=ouvrir_fiche,
)

bpm.drawer(
    title="Fiche produit — P-1001",
    children=[bpm.barcode(value="3761234010018", format="EAN13"), bpm.qrCode(value="P-1001")],
)

bpm.button("Nouveau produit", on_click=creer_produit)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {T.settingsTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {T.settingsBody1}
        <Link
          href="/modules/catalogue-produits/documentation"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {T.docLinkLabel}
        </Link>
        {T.settingsBody2}
      </p>
    </div>
  );

  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={T.moduleName}
        title={T.moduleName}
        description={T.pageDescription}
        category={T.badgeCategory}
        links={[{ href: "/modules/catalogue-produits/simulateur", label: T.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: T.tabDocumentation, content: docContent },
          { label: T.tabSimulator, content: <CatalogueProduitsSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
