"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

/**
 * Page Documentation du module Skeleton.
 * Accessible via /modules/skeleton/documentation (lien depuis la liste des modules).
 */
export default function SkeletonDocumentationPage() {
  const { locale } = useI18n();
  const str = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/skeleton">{str.moduleName}</Link> → {str.docBreadcrumb}
        </nav>
        <h1>{str.docTitle}</h1>
        <p className="doc-description">
          {str.docDescBeforeCode}<code>bpm.skeleton</code>{str.docDescAfterCode}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.modulePageLink}</Link>
          {" · "}
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.simulatorLink}</Link>
        </p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.aboutTitle}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {str.aboutBeforeStrong}<strong>Skeleton</strong>{str.aboutAfterStrong}<code>bpm.skeleton</code>{str.aboutAfterCode}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.componentTitle}</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {str.propsLabel}<code>variant</code> (rectangular, circular, text), <code>width</code>, <code>height</code>, <code>className</code>, <code>animated</code>, <code>shimmer</code>, <code>rounded</code>.
      </p>
      <CodeBlock
        code={'# Affichage d\'un chargement de page type dashboard\nbpm.title("Chargement...")\n# Puis assemblage de bpm.skeleton (header, métriques, contenu, tableau)'}
        language="python"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.usageGuideTitle}</h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{str.whenStrong}</strong>{str.whenBody}
      </p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{str.buildStrong}</strong>{str.buildBody}
      </p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{str.transitionStrong}</strong>{str.transitionS1}<code>loading === true</code>{str.transitionS2}<code>transition: opacity 200ms ease-out</code>{str.transitionS3}<code>bpm-skeleton-container</code>{str.transitionS4}<code>opacity: 0</code>{str.transitionS5}
      </p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{str.implementStrong}</strong>{str.implementS1}<code>bpm-skeleton-container</code>{str.implementS2}<code>transition: opacity 200ms ease-out</code>{str.implementS3}<code>opacity: 0</code>{str.implementS4}
      </p>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <strong>{str.reduceStrong}</strong>{str.reduceS1}<code>prefers-reduced-motion</code>{str.reduceS2}<code>animated=false</code>{str.reduceS3}
      </p>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/skeleton" style={{ color: "var(--bpm-accent-cyan)" }}>{str.backToModule}</Link>
        <Link href="/modules/skeleton/simulateur" style={{ color: "var(--bpm-accent-cyan)" }}>{str.simulatorLink}</Link>
      </nav>
    </div>
  );
}
