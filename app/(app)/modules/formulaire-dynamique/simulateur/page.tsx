"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import FormulaireDynamiqueSimulateur from "../simulateur-content";
import { getStrings } from "../strings";

export default function FormulaireDynamiqueSimulateurPage() {
  const { locale } = useI18n();
  const t = getStrings(locale);

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/formulaire-dynamique">{t.moduleName}</Link> →{" "}
          {t.simulatorPage.breadcrumbCurrent}
        </div>
        <h1>{t.simulatorPage.title}</h1>
        <p className="doc-description">{t.simulatorPage.description}</p>
      </div>
      <FormulaireDynamiqueSimulateur />
    </div>
  );
}
