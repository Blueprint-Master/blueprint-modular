"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import CatalogueProduitsSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function CatalogueProduitsSimulateurPage() {
  const { locale } = useI18n();
  const T = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/catalogue-produits">{T.moduleName}</Link> → {T.breadcrumbSimulator}
        </div>
        <h1>{T.simPageTitle}</h1>
        <p className="doc-description">{T.simPageDescription}</p>
      </div>
      <CatalogueProduitsSimulateur />
    </div>
  );
}
