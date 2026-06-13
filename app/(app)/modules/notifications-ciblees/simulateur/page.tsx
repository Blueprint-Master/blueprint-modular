"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import NotificationsCibleesSimulateur from "../simulateur-content";
import { STR } from "../strings";

export default function NotificationsCibleesSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/notifications-ciblees">{s.moduleName}</Link> → {s.breadcrumbSim}
        </div>
        <h1>{s.simPageTitle}</h1>
        <p className="doc-description">{s.simPageDescription}</p>
      </div>
      <NotificationsCibleesSimulateur />
    </div>
  );
}
