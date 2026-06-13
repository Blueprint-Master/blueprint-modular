"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import RapportsSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function RapportsSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/rapports">{s.breadcrumbModule}</Link> → {s.simBreadcrumb}
        </div>
        <h1>{s.simTitle}</h1>
        <p className="doc-description">{s.simDescription}</p>
      </div>
      <RapportsSimulateur />
    </div>
  );
}
