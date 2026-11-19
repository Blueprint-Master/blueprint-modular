"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Selectbox, Input, Textarea, Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { useTemplateDownload } from "../useTemplateDownload";
import { STR } from "../strings";

export default function TemplatesSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const { formError, setFormError, busy, download } = useTemplateDownload();
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const canCreate = Boolean(selectedModel && documentName.trim());
  const fields = selectedModel ? s.simulatorFields[selectedModel] ?? [] : [];

  const handleCreate = () => download(selectedModel, documentName, fieldValues);

  const updateField = (key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → <Link href="/modules/templates">{s.moduleName}</Link> → {s.breadcrumbSimulator}
        </div>
        <h1>{s.simulatorTitle}</h1>
        <p className="doc-description">{s.simulatorDescription}</p>
      </div>

      <div
        className="rounded-lg border p-6"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
        }}
      >
        <p className="text-xs font-medium mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          {s.step1}
        </p>
        <Selectbox
          options={s.templateOptions}
          value={selectedModel}
          onChange={(v) => {
            setSelectedModel(v);
            setFieldValues({});
            setFormError(null);
          }}
          placeholder={s.selectboxPlaceholder}
          label={s.selectboxLabel}
        />

        {selectedModel && (
          <>
            <p className="text-xs font-medium mt-6 mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
              {s.step2}
            </p>
            <Input
              label={s.documentNameLabel}
              placeholder={s.documentNamePlaceholder}
              value={documentName}
              onChange={setDocumentName}
              className="mb-4"
            />
            {fields.length > 0 && (
              <div className="space-y-3 mt-4">
                {fields.map((f) => (
                  f.key === "corps" ? <Textarea key={f.key} label={f.label} aria-label={f.label} value={fieldValues[f.key] ?? ""} rows={4}
                    onChange={v => updateField(f.key, v)} /> :
                  <Input
                    key={f.key}
                    label={f.label}
                    placeholder={f.placeholder}
                    value={fieldValues[f.key] ?? ""}
                    onChange={(v) => updateField(f.key, v)}
                  />
                ))}
              </div>
            )}

            {formError && (
              <p role="alert" className="text-sm mt-3" style={{ color: "#e74c3c" }}>
                {formError}
              </p>
            )}
            <div className="mt-4">
              <Button onClick={handleCreate} disabled={!canCreate || busy}>
                {s.createButton}
              </Button>
            </div>
          </>
        )}

        {!selectedModel && (
          <p className="text-sm mt-4" style={{ color: "var(--bpm-text-secondary)" }}>
            {s.emptyStateLong}
          </p>
        )}
      </div>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link href="/modules/templates" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.backToModule}
        </Link>
      </p>
    </div>
  );
}
