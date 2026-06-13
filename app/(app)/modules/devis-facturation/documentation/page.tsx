"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type Rich } from "../strings";

// Snippet python : identique dans les deux langues (non traduit).
const PYTHON_CALCULS = `total_ligne_ht = quantite * prix_unitaire * (1 - remise_pct / 100)
total_ht       = somme(total_ligne_ht)
tva            = total_ht * 0.20          # TVA 20 %
total_ttc      = total_ht + tva`;

/** Rend un paragraphe riche (texte / code inline / gras). */
function RichText({ segs }: { segs: Rich }) {
  return (
    <>
      {segs.map((seg, i) =>
        "c" in seg ? (
          <code key={i}>{seg.c}</code>
        ) : "b" in seg ? (
          <strong key={i}>{seg.b}</strong>
        ) : "l" in seg ? (
          <span key={i}>{seg.l}</span>
        ) : (
          <span key={i}>{seg.t}</span>
        )
      )}
    </>
  );
}

export default function DevisFacturationDocumentationPage() {
  const { locale } = useI18n();
  const M = STR[locale].module;
  const D = STR[locale].doc;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/devis-facturation">{M.title}</Link> → {D.breadcrumbDocumentation}
        </nav>
        <h1>{D.title}</h1>
        <p className="doc-description">{D.description}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.modelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.modelBody}
      </p>
      <CodeBlock code={D.modelCode} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.calcTitle}
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.calcBody1} />
      </p>
      <CodeBlock code={PYTHON_CALCULS} language="python" />
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.calcBody2}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.cycleTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {D.cycleItems.map((item, i) => (
          <li key={i}>
            <RichText segs={item} />
          </li>
        ))}
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {D.cycleBody}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.numberingTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.numberingBody} />
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {D.printTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        <RichText segs={D.printBody} />
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/devis-facturation/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {D.openSimulator}
        </Link>
      </p>
    </div>
  );
}
