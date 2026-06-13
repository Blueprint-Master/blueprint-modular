"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";
import ThemesSimulateur from "../simulateur-content";

export default function ThemesSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/themes">{s.breadcrumbThemes}</Link> → {s.breadcrumbSimulator}
        </div>
        <h1>{s.simPageTitle}</h1>
        <p className="doc-description">{s.simPageDescription}</p>
      </div>
      <ThemesSimulateur />
    </div>
  );
}
