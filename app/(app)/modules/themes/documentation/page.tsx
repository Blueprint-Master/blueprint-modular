"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ThemesDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/themes">{s.breadcrumbThemes}</Link> → {s.breadcrumbDocumentation}
        </nav>
        <h1>{s.docTitle}</h1>
        <p className="doc-description">{s.docDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.varsTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.varsIntro}
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.varItems.map((item) => (
          <li key={item.code}>
            <code>{item.code}</code> — {item.desc}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.jsonTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.jsonIntro}
      </p>
      <CodeBlock
        code={`{
  "id": "theme-acme",
  "nom": "ACME Corp",
  "couleurApp": "ACME Portail",
  "accent": "#e11d48",
  "fond": "#faf6f6",
  "surface": "#ffffff",
  "texte": "#1c1917",
  "rayon": 4
}`}
        language="json"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.domTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.domTextBeforeStrong}
        <strong>{s.domStrong}</strong>
        {s.domTextAfterStrong}
      </p>
      <CodeBlock
        code={`${s.domCodeComment}
function appliquerTheme(racine: HTMLElement, theme: Theme) {
  racine.style.setProperty("--bpm-accent", theme.accent);
  racine.style.setProperty("--bpm-bg", theme.fond);
  racine.style.setProperty("--bpm-surface", theme.surface);
  racine.style.setProperty("--bpm-text", theme.texte);
  racine.style.setProperty("--bpm-radius", theme.rayon + "px");
}`}
        language="typescript"
      />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.mtTitle}
      </h2>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.mtIntro}
      </p>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.mtItems.map((segments, index) => (
          <li key={index}>
            {segments.map((seg, i) =>
              seg.code ? <code key={i}>{seg.t}</code> : <span key={i}>{seg.t}</span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/themes/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
