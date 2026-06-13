"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function KeepScreenOnDocPage() {
  const { locale } = useI18n();
  const str = STR[locale];

  const docContent = (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.docAboutTitle}</h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {str.docAboutBefore}<strong>{str.docAboutStrong}</strong>{str.docAboutMiddle}<a href="https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.docAboutLink}</a>{str.docAboutAfter}
      </p>
      <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.docSettingsTitle}</h3>
      <ul className="list-disc pl-6 mb-4 space-y-1" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        <li><strong>{str.docSettingOffStrong}</strong>{str.docSettingOffText}</li>
        <li><strong>{str.docSettingTimedStrong}</strong>{str.docSettingTimedText}</li>
        <li><strong>{str.docSettingIndefiniteStrong}</strong>{str.docSettingIndefiniteText}</li>
      </ul>
      <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.docVisibilityTitle}</h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {str.docVisibilityText}
      </p>
      <h3 className="text-base font-semibold mt-4 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.docCompatibilityTitle}</h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {str.docCompatibilityBefore}<strong>{str.docCompatibilityStrong}</strong>{str.docCompatibilityAfter}
      </p>
      <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/keep-screen-on" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{str.docOpenModule}</Link>
      </p>
    </>
  );

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{str.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>{str.moduleName}</Link> → {str.docBreadcrumbDocumentation}
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--bpm-text-primary)" }}>{str.docTitle}</h1>
        <p className="doc-description mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
          {str.docDescription}
        </p>
      </div>
      <div className="mt-6" style={{ maxWidth: "60ch" }}>
        {docContent}
      </div>
      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{str.backToModules}</Link>
        <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>{str.moduleName}</Link>
      </nav>
    </div>
  );
}
