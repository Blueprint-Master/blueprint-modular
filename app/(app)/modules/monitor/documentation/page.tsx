"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { monitorStrings } from "../strings";

export default function MonitorDocumentationPage() {
  const { locale } = useI18n();
  const s = monitorStrings[locale].doc;
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/monitor">{s.breadcrumbModule}</Link> → {s.breadcrumbCurrent}
        </nav>
        <h1>{s.title}</h1>
        <p className="doc-description">{s.description}</p>
      </div>

      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.introHtml }} />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.howToTitle}
      </h2>
      <ol className="list-decimal pl-6 mb-4 text-sm space-y-2" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.howToItemsHtml.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ol>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.featuresTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.featureItemsHtml.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.apiKeyTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.apiKeyHtml }} />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.shortcutsTitle}
      </h2>
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.shortcutItemsHtml.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.apiTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.apiIntroHtml }} />
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.apiEndpointsHtml.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.apiHeaderNoteHtml }} />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.deployTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.deployHtml }} />

      <h2 className="text-lg font-semibold mt-8 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.sizeTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.sizeIntroHtml }} />
      <ul className="list-disc pl-6 mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.sizeItemsHtml.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ul>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)" }} dangerouslySetInnerHTML={{ __html: s.sizeOutroHtml }} />

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules/monitor" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backLink}
        </Link>
      </nav>
    </div>
  );
}
