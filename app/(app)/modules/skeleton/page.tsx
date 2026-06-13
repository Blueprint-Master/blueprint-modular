"use client";

import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const str = STR[locale];
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.aboutTitle}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {str.aboutBeforeStrong}<strong>Skeleton</strong>{str.aboutAfterStrong}<code>bpm.skeleton</code>{str.aboutAfterCode}
      </p>
      <CodeBlock code={'# Affichage d\'un chargement de page type dashboard\nbpm.title("Chargement...")\n# Puis assemblage de bpm.skeleton (header, métriques, contenu, tableau)'} language="python" />
    </>
  );
}

function SimuContent() {
  const { locale } = useI18n();
  const str = STR[locale];
  return (
    <>
      <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        {str.simuIntro}
      </p>
      <div
        className="rounded-xl border p-4"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <p className="text-sm m-0" style={{ color: "var(--bpm-text-secondary)" }}>
          {str.simuBoxBeforeCode}<code>bpm.skeleton</code>{str.simuBoxAfterCode}
        </p>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.openSimulator}</Link>
        </p>
      </div>
    </>
  );
}

export default function SkeletonModulePage() {
  const { locale } = useI18n();
  const str = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/modules">Modules</Link> → {str.moduleName}</div>
        <h1>{str.moduleName}</h1>
        <p className="doc-description">{str.pageDescription}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{str.categoryBadge}</span></div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/skeleton/simulateur" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.openSimulator}</Link>
        </p>
      </div>
      <Tabs tabs={[{ label: str.tabDocumentation, content: <DocContent /> }, { label: str.tabSimulator, content: <SimuContent /> }]} defaultTab={0} />

      <nav className="doc-pagination mt-8">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{str.backToModules}</Link>
        <Link href="/modules/skeleton/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{str.documentationLink}</Link>
        <Link href="/modules/skeleton/simulateur" style={{ color: "var(--bpm-accent-cyan)" }}>{str.simulatorLink}</Link>
      </nav>
    </div>
  );
}
