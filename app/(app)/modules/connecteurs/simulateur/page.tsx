"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ConnecteursSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function ConnecteursSimulateurPage() {
  const { locale } = useI18n();
  const S = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/connecteurs">{S.pageTitle}</Link> → {S.simBreadcrumb}
        </div>
        <h1>{S.simTitle}</h1>
        <p className="doc-description">{S.simDescription}</p>
      </div>
      <ConnecteursSimulateur />
    </div>
  );
}
