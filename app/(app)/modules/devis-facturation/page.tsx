"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import DevisFacturationSimulateur from "./simulateur-content";
import { STR, type Rich } from "./strings";

// Snippet python : identique dans les deux langues (non traduit).
const PYTHON_SNIPPET = `import bpm

bpm.metricRow([
    bpm.metric("Devis en cours", 2),
    bpm.metric("Montant TTC en attente", "5 944,80 €"),
    bpm.metric("Encaissé", "5 520,00 €"),
])

bpm.table(
    columns=[("numero", "Numéro"), ("client", "Client"), ("ttc", "Total TTC"), ("statut", "Statut")],
    data=devis,
    on_row_click=ouvrir_editeur,
)

bpm.button("Envoyer au client", on_click=envoyer)   # brouillon -> envoyé
bpm.button("Marquer payé", on_click=encaisser)      # envoyé -> payé (lecture seule)`;

/** Rend un paragraphe riche (texte / code inline / gras / lien interne). */
function RichText({ segs, linkHref }: { segs: Rich; linkHref?: string }) {
  return (
    <>
      {segs.map((seg, i) =>
        "c" in seg ? (
          <code key={i}>{seg.c}</code>
        ) : "b" in seg ? (
          <strong key={i}>{seg.b}</strong>
        ) : "l" in seg ? (
          <Link key={i} href={linkHref ?? "#"} style={{ color: "var(--bpm-accent-cyan)" }}>
            {seg.l}
          </Link>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </>
  );
}

export default function DevisFacturationModulePage() {
  const { locale } = useI18n();
  const M = STR[locale].module;

  const docContent = (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {M.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {M.aboutBody}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {M.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <RichText segs={M.componentsBody} />
      </p>
      <CodeBlock code={PYTHON_SNIPPET} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {M.calcTitle}
      </h3>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={M.calcBody} />
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {M.setupTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <RichText segs={M.setupBody} linkHref="/modules/devis-facturation/documentation" />
      </p>
    </div>
  );

  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={M.title}
        title={M.title}
        description={M.description}
        category={M.badgeCategory}
        links={[{ href: "/modules/devis-facturation/simulateur", label: M.openSimulator }]}
      />
      <Tabs
        tabs={[
          { label: M.tabDocumentation, content: docContent },
          { label: M.tabSimulator, content: <DevisFacturationSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
