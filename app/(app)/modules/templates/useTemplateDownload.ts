"use client";
import { useRef, useState } from "react";
import { useToast } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

export function useTemplateDownload() {
  const { locale } = useI18n();
  const strings = STR[locale];
  const { showToast } = useToast();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function download(model: string | null, name: string, fields: Record<string, string>) {
    if (pending.current || !model) return;
    pending.current = true;
    setBusy(true);
    setFormError(null);
    try {
      const response = await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, name, locale, fields }) });
      if (response.status === 400) {
        const details: { fields: string[] } = await response.json();
        const invalid = strings.simulatorFields[model].filter(field => details.fields.includes("fields." + field.key)).map(field => field.label);
        if (details.fields.includes("name")) invalid.unshift(strings.documentNameLabel);
        setFormError((locale === "en" ? "Check these fields" : "Champs à vérifier") + " · " + invalid.join(", "));
        return;
      }
      if (!response.ok) throw new Error("generation");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      try {
        anchor.href = url;
        const filename = response.headers.get("Content-Disposition")?.match(/filename\*=UTF-8''(.+)$/)?.[1];
        anchor.download = filename ? decodeURIComponent(filename) : "document." + (model === "email" ? "eml" : "html");
        document.body.appendChild(anchor);
        anchor.click();
      } finally {
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      const label = strings.templateOptions.find(option => option.value === model)!.label;
      showToast(strings.toastCreated(name.trim(), label), "success", 5000, strings.toastTitle, strings.moduleName, null);
    } catch {
      setFormError(locale === "en" ? "The document could not be generated. Retry." : "Le document n’a pas pu être généré. Réessaie.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return { busy, formError, setFormError, download };
}
