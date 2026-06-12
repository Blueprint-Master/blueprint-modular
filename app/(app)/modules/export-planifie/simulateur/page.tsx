"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ExportPlanifieSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function ExportPlanifieSimulateurPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/export-planifie">{t.moduleTitle}</Link> → {t.simLabel}
        </div>
        <h1>{t.simPageTitle}</h1>
        <p className="doc-description">{t.simPageDescription}</p>
      </div>
      <ExportPlanifieSimulateur />
    </div>
  );
}
