"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import TachesSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function TachesSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/taches">{s.breadcrumb.tasks}</Link> →{" "}
          {s.breadcrumb.simulator}
        </div>
        <h1>{s.simPage.title}</h1>
        <p className="doc-description">{s.simPage.description}</p>
      </div>
      <TachesSimulateur />
    </div>
  );
}
