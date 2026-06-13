"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";
import { useAIHeader } from "@/contexts/AIHeaderContext";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { str } from "./strings";

const BPM_ASSISTANT_NAME_STORAGE = "bpm-assistant-name";

function useStoredAssistantName(): string {
  const [name, setName] = useState("Assistant");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BPM_ASSISTANT_NAME_STORAGE);
      if (stored?.trim()) setName(stored.trim());
    } catch {
      // ignore
    }
    const onUpdate = (e: CustomEvent<string>) => {
      if (e.detail?.trim()) setName(e.detail.trim());
    };
    window.addEventListener("bpm-assistant-name-updated", onUpdate as EventListener);
    return () => window.removeEventListener("bpm-assistant-name-updated", onUpdate as EventListener);
  }, []);
  return name;
}

export default function IAPage() {
  const ctx = useAIHeader();
  const assistantName = useStoredAssistantName();
  const { locale } = useI18n();
  const t = str(locale).page;

  return (
    <div
      className="ia-page-full-height"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <div id="documentation" className="doc-page-header" style={{ flexShrink: 0 }}>
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → {t.breadcrumbIa}
          </div>
          <h1 style={{ margin: 0 }}>{assistantName}</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            {t.description}
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">{t.badge}</span>
            <span className="doc-reading-time">{t.readingTime}</span>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}>
        {ctx ? (
          <AIChat
            historyOpen={ctx.historyOpen}
            onCloseHistory={() => ctx.setHistoryOpen(false)}
            newDiscussionTrigger={ctx.newDiscussionTrigger}
            assistantName={assistantName}
          />
        ) : (
          <AIChat assistantName={assistantName} />
        )}
      </div>
    </div>
  );
}
