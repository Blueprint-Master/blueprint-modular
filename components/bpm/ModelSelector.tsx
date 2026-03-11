"use client";

import React, { useState } from "react";

export interface ModelOption {
  id: string;
  label: string;
  provider: string;
  capabilities?: string[];
  contextWindow?: number;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onChange: (modelId: string) => void;
  showCapabilities?: boolean;
  className?: string;
}

export function ModelSelector({
  models,
  selected,
  onChange,
  showCapabilities = true,
  className = "",
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const selectedModel = models.find((m) => m.id === selected);
  const byProvider = models.reduce<Record<string, ModelOption[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  return (
    <div
      className={className ? `bpm-model-selector ${className}`.trim() : "bpm-model-selector"}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          border: "1px solid var(--bpm-border)",
          borderRadius: "var(--bpm-radius-sm)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
          fontSize: 14,
          cursor: "pointer",
          minWidth: 180,
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>
          {selectedModel ? selectedModel.label : "Sélectionner un modèle"}
        </span>
        <span style={{ color: "var(--bpm-text-muted)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <>
          <div
            role="presentation"
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: 4,
              zIndex: 9999,
              minWidth: 280,
              maxHeight: 320,
              overflowY: "auto",
              border: "1px solid var(--bpm-border)",
              borderRadius: "var(--bpm-radius-md)",
              background: "var(--bpm-bg-primary)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
          >
            {Object.entries(byProvider).map(([provider, list]) => (
              <div key={provider}>
                <div
                  style={{
                    padding: "8px 12px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--bpm-text-muted)",
                    textTransform: "uppercase",
                    background: "var(--bpm-bg-secondary)",
                  }}
                >
                  {provider}
                </div>
                {list.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 12px",
                      border: "none",
                      background: m.id === selected ? "var(--bpm-accent-light)" : "transparent",
                      color: "var(--bpm-text-primary)",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: m.id === selected ? 600 : 400 }}>{m.label}</div>
                    {showCapabilities && (m.capabilities?.length ?? 0) > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 4,
                          fontSize: 11,
                          color: "var(--bpm-text-muted)",
                        }}
                      >
                        {m.capabilities!.map((c) => (
                          <span
                            key={c}
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--bpm-bg-tertiary)",
                            }}
                          >
                            {c}
                          </span>
                        ))}
                        {m.contextWindow != null && (
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: "var(--bpm-bg-tertiary)",
                            }}
                          >
                            {m.contextWindow.toLocaleString()} ctx
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
