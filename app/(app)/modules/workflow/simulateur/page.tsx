"use client";

import Link from "next/link";
import { WorkflowSimulator } from "../WorkflowSimulator";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function WorkflowSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> → <Link href="/modules/workflow">{s.moduleName}</Link> → {s.breadcrumbSimulator}
        </div>
        <h1>{s.simulatorTitle}</h1>
        <p className="doc-description">
          {s.simulatorDescription}
        </p>
      </div>

      <WorkflowSimulator />

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/workflow" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>{s.backToModule}</Link>
      </p>
    </div>
  );
}
