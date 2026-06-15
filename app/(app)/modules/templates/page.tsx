"use client";

import React, { useState } from "react";
import { Tabs, CodeBlock, Selectbox, Input, Button, useToast } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

function DocContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.aboutHeading}</h2>
      <p className="mb-6" style={{ color: "var(--bpm-text-secondary)", maxWidth: "60ch" }}>
        {s.aboutBefore} <strong>{s.aboutStrong}</strong> {s.aboutAfter}
      </p>
      <CodeBlock code={'bpm.title("Modèles")\nbpm.selectbox(options=modeles, label="Choisir un modèle")'} language="python" />
    </>
  );
}

function SimuContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const canCreate = Boolean(selectedModel && documentName.trim());

  const handleCreate = () => {
    if (!selectedModel || !documentName.trim()) {
      setFormError(s.validationError);
      return;
    }
    setFormError(null);
    const modelLabel = s.templateOptions.find((o) => o.value === selectedModel)?.label ?? selectedModel;
    showToast(s.toastCreated(documentName.trim(), modelLabel), "success", 5000, s.toastTitle, s.moduleName, null);
  };

  return (
    <>
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>{s.simuHeading}</h2>
      <div className="rounded-lg border p-6 mt-4" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
        <Selectbox
          options={s.templateOptions}
          value={selectedModel}
          onChange={(v) => { setSelectedModel(v); setFieldValues({}); setFormError(null); }}
          placeholder={s.selectboxPlaceholder}
          label={s.selectboxLabel}
        />
        {selectedModel && (
          <>
            <Input label={s.documentNameLabel} placeholder={s.documentNamePlaceholder} value={documentName} onChange={setDocumentName} className="mt-4" />
            {(s.overviewFields[selectedModel] ?? []).map((f) => (
              <Input key={f.key} label={f.label} placeholder={f.placeholder} value={fieldValues[f.key] ?? ""} onChange={(v) => setFieldValues((prev) => ({ ...prev, [f.key]: v }))} className="mt-4" />
            ))}
            {formError && <p className="text-sm mt-3" style={{ color: "#e74c3c" }}>{formError}</p>}
            <Button className="mt-4" onClick={handleCreate} disabled={!canCreate}>{s.createButton}</Button>
          </>
        )}
        {!selectedModel && <p className="text-sm mt-4" style={{ color: "var(--bpm-text-secondary)" }}>{s.emptyStateShort}</p>}
      </div>
    </>
  );
}

export default function TemplatesModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        breadcrumbCurrent={s.moduleName}
        title={s.moduleName}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/templates/simulateur", label: s.openSimulator }]}
      />
      <Tabs tabs={[{ label: s.tabDocumentation, content: <DocContent /> }, { label: s.tabSimulator, content: <SimuContent /> }]} defaultTab={0} />
    </div>
  );
}
