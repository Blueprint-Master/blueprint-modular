"use client";

import { useState } from "react";
import Link from "next/link";
import { AIChat } from "@/components/AIChat/AIChat";

const ASSISTANT_NAME = "Assistant";

export default function IAPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [newDiscussionTrigger, setNewDiscussionTrigger] = useState(0);

  return (
    <div style={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      <div className="doc-page-header" style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div className="doc-breadcrumb">
            <Link href="/modules">Modules</Link> → IA
          </div>
          <h1 style={{ margin: 0 }}>{ASSISTANT_NAME}</h1>
          <p className="doc-description" style={{ margin: "0.25rem 0 0" }}>
            Assistant conversationnel (Ollama par défaut, Claude en fallback). Contexte Wiki et Documents.
          </p>
          <div className="doc-meta" style={{ marginTop: 4 }}>
            <span className="doc-badge doc-badge-category">Ollama</span>
            <span className="doc-reading-time">⏱ 1 min</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setNewDiscussionTrigger((t) => t + 1)}
            aria-label="Nouvelle discussion"
            title="Nouvelle discussion"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              padding: 0,
              border: "1px solid var(--bpm-border)",
              borderRadius: 8,
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
              cursor: "pointer",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen((prev) => !prev)}
            aria-label={`Historique des échanges avec ${ASSISTANT_NAME}`}
            title="Historique"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              padding: 0,
              border: "1px solid var(--bpm-border)",
              borderRadius: 8,
              background: "var(--bpm-bg-primary)",
              color: "var(--bpm-text-primary)",
              cursor: "pointer",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor">
              <path d="M160-120q-33 0-56.5-23.5T80-200v-560q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v560q0 33-23.5 56.5T800-120H160Zm0-80h640v-560H160v560Zm80-80h480v-400H240v400Zm0-400v400-400Z" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
        <AIChat
          historyOpen={historyOpen}
          onCloseHistory={() => setHistoryOpen(false)}
          newDiscussionTrigger={newDiscussionTrigger}
          assistantName={ASSISTANT_NAME}
        />
      </div>
    </div>
  );
}
