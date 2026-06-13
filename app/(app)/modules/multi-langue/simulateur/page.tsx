"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import MultiLangueSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function MultiLangueSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/multi-langue">{s.moduleTitle}</Link> → {s.breadcrumbSimulator}
        </div>
        <h1>{s.simPageTitle}</h1>
        <p className="doc-description">{s.simPageDescription}</p>
      </div>
      <MultiLangueSimulateur />
    </div>
  );
}
