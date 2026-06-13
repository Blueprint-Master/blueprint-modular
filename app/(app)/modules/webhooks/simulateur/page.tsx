"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";
import WebhooksSimulateur from "../simulateur-content";

export default function WebhooksSimulateurPage() {
  const { locale } = useI18n();
  const S = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> →{" "}
          <Link href="/modules/webhooks">{S.moduleTitle}</Link> → {S.simulatorBreadcrumb}
        </div>
        <h1>{S.simulatorTitle}</h1>
        <p className="doc-description">{S.simulatorDescription}</p>
      </div>
      <WebhooksSimulateur />
    </div>
  );
}
