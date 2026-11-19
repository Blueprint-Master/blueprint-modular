"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SkeletonLayout, type SkeletonAssembly } from "@/components/bpm/SkeletonLayout";
import { Slider, Selectbox } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function SkeletonSimulateurPage() {
  const { locale } = useI18n();
  const str = STR[locale];
  const [assembly, setAssembly] = useState("dashboard");
  const [metrics, setMetrics] = useState(3);
  const [rows, setRows] = useState(5);
  const [columns, setColumns] = useState(4);
  const [formFields, setFormFields] = useState(5);

  const preview = <SkeletonLayout assembly={assembly as SkeletonAssembly} metrics={metrics} rows={rows} columns={columns} fields={formFields} />;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/skeleton">{str.moduleName}</Link> → {str.simulatorBreadcrumb}
        </div>
        <h1>{str.simulatorTitle}</h1>
        <p className="doc-description">
          {str.simulatorDescription}
        </p>
      </div>

      {/* Conteneur unique (même mise en page que Commentaires, Calendrier, Tableau blanc) */}
      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        {/* Barre de contrôle (style barre contexte des autres simulateurs) */}
        <div
          className="px-4 py-3 border-b"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-secondary)" }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--bpm-text-primary)" }}>{str.assemblyLabel}</label>
          <Selectbox
            options={str.assemblyOptions}
            value={assembly}
            onChange={(v) => setAssembly(v ?? "dashboard")}
            placeholder={str.assemblyPlaceholder}
          />
          {(assembly === "dashboard" || assembly === "list") && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assembly === "dashboard" && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{str.metricsLabel}</label>
                    <Slider value={metrics} min={1} max={6} onChange={setMetrics} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{str.tableRowsLabel}</label>
                    <Slider value={rows} min={1} max={15} onChange={setRows} />
                  </div>
                </>
              )}
              {assembly === "list" && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{str.rowsLabel}</label>
                    <Slider value={rows} min={1} max={20} onChange={setRows} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{str.columnsLabel}</label>
                    <Slider value={columns} min={1} max={6} onChange={setColumns} />
                  </div>
                </>
              )}
            </div>
          )}
          {assembly === "form" && (
            <div className="mt-4">
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--bpm-text-secondary)" }}>{str.fieldsLabel}</label>
              <Slider value={formFields} min={1} max={10} onChange={setFormFields} />
            </div>
          )}
        </div>

        {/* Zone aperçu (même bloc que le contenu principal des autres simulateurs) */}
        <div className="p-4">
          {preview}
        </div>
      </div>

      <nav className="doc-pagination mt-8">
        <Link href="/modules/skeleton" style={{ color: "var(--bpm-accent-cyan)" }}>{str.backToModule}</Link>
        <Link href="/modules/skeleton/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{str.documentationLink}</Link>
      </nav>
    </div>
  );
}
