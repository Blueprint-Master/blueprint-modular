"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import AuditLogSimulateur from "../simulateur-content";
import { getAuditLogStrings } from "../strings";

export default function AuditLogSimulateurPage() {
  const { locale } = useI18n();
  const s = getAuditLogStrings(locale);
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/audit-log">{s.modulePage.breadcrumbCurrent}</Link> →{" "}
          {s.simulatorPage.breadcrumbCurrent}
        </div>
        <h1>{s.simulatorPage.title}</h1>
        <p className="doc-description">{s.simulatorPage.description}</p>
      </div>
      <AuditLogSimulateur />
    </div>
  );
}
