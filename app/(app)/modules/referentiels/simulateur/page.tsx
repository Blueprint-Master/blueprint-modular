"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import ReferentielsSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function ReferentielsSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/referentiels">{s.moduleName}</Link> → {s.tabSimulator}
        </div>
        <h1>{s.simulatorPageTitle}</h1>
        <p className="doc-description">{s.simulatorPageDescription}</p>
      </div>
      <ReferentielsSimulateur />
    </div>
  );
}
