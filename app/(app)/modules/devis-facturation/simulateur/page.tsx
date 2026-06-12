"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import DevisFacturationSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function DevisFacturationSimulateurPage() {
  const { locale } = useI18n();
  const M = STR[locale].module;
  const SP = STR[locale].simPage;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/devis-facturation">{M.title}</Link> → {SP.breadcrumbSimulator}
        </div>
        <h1>{SP.title}</h1>
        <p className="doc-description">{SP.description}</p>
      </div>
      <DevisFacturationSimulateur />
    </div>
  );
}
