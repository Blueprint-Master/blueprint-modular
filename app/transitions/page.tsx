"use client";

import React, { useState, useRef } from "react";

const FONT_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');
`;

const ANIMATION_CSS = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideIn {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.ui-transitions-page { font-family: 'Instrument Serif', serif; background: #0a0a0a; color: #e5e5e5; min-height: 100vh; }
.ui-transitions-page .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
.ui-transitions-page .fade-up { animation: fadeUp 0.4s ease-out forwards; }
.ui-transitions-page .slide-in { animation: slideIn 0.35s ease-out forwards; }
.ui-transitions-page .scale-up { animation: scaleUp 0.3s ease-out forwards; }
.ui-transitions-page .skeleton { background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%); background-size: 200% 100%; animation: shimmer 1.2s ease-in-out infinite; border-radius: 6px; }
`;

type TabContentItem = { label: string; value: string; delta: string };
const tabContent: Record<string, TabContentItem[]> = {
  Overview: [
    { label: "Active users", value: "2,847", delta: "+12%" },
    { label: "Revenue", value: "€42.1k", delta: "+8%" },
    { label: "Sessions", value: "18.2k", delta: "-2%" },
  ],
  Activity: [
    { label: "Events today", value: "1,204", delta: "+24%" },
    { label: "Avg. duration", value: "4m 32s", delta: "+5%" },
    { label: "Bounce rate", value: "42%", delta: "-3%" },
  ],
  Settings: [
    { label: "API calls", value: "12.4k", delta: "+0%" },
    { label: "Errors", value: "0.02%", delta: "-0.01%" },
    { label: "Uptime", value: "99.98%", delta: "+0%" },
  ],
};

type ListItem = { id: number; name: string; cat: string; stat: string; n: string };
const ITEMS: ListItem[] = [
  { id: 1, name: "Project Alpha", cat: "Design", stat: "In progress", n: "3" },
  { id: 2, name: "Project Beta", cat: "Engineering", stat: "Review", n: "7" },
  { id: 3, name: "Project Gamma", cat: "Marketing", stat: "Done", n: "12" },
];

function ContextDemo() {
  const [tab, setTab] = useState<"Overview" | "Activity" | "Settings">("Overview");
  const [loading, setLoading] = useState(false);
  const [key, setKey] = useState(0);

  const switchTab = (t: "Overview" | "Activity" | "Settings") => {
    if (t === tab) return;
    setLoading(true);
    setTimeout(() => {
      setTab(t);
      setKey((k) => k + 1);
      setLoading(false);
    }, 320);
  };

  const items = tabContent[tab] ?? [];
  const tabs: ("Overview" | "Activity" | "Settings")[] = ["Overview", "Activity", "Settings"];

  return (
    <div style={{ marginBottom: 48 }}>
      <h3 className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "#737373", marginBottom: 12, textTransform: "uppercase" }}>
        Context (tabs + skeleton → content)
      </h3>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            style={{
              padding: "8px 14px",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: tab === t ? 500 : 400,
              color: tab === t ? "#e5e5e5" : "#737373",
              background: tab === t ? "#262626" : "transparent",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <div key={key} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 72 }}
              />
            ))
          : items.map((item, i) => (
              <div
                key={item.label}
                className="fade-up"
                style={{
                  animationDelay: `${i * 40}ms`,
                  opacity: 0,
                  padding: 14,
                  background: "#141414",
                  borderRadius: 8,
                  border: "1px solid #262626",
                }}
              >
                <div className="mono" style={{ fontSize: 11, color: "#737373", marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 400 }}>{item.value}</div>
                <div className="mono" style={{ fontSize: 12, color: "#a3a3a3" }}>{item.delta}</div>
              </div>
            ))}
      </div>
    </div>
  );
}

function DrillDemo() {
  const [selected, setSelected] = useState<ListItem | null>(null);
  const [listKey, setListKey] = useState(0);
  const [detailKey, setDetailKey] = useState(0);

  const openDetail = (item: ListItem) => {
    setSelected(item);
    setDetailKey((k) => k + 1);
  };

  const goBack = () => {
    setSelected(null);
    setListKey((k) => k + 1);
  };

  return (
    <div style={{ marginBottom: 48 }}>
      <h3 className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "#737373", marginBottom: 12, textTransform: "uppercase" }}>
        Drill (list → detail, slide-in)
      </h3>
      <div style={{ position: "relative", minHeight: 200 }}>
        {selected == null ? (
          <div key={`l-${listKey}`} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openDetail(item)}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "#1a1a1a";
                  e.currentTarget.style.borderColor = "#333";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = "#141414";
                  e.currentTarget.style.borderColor = "#262626";
                }}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontFamily: "inherit",
                  fontSize: 14,
                  color: "#e5e5e5",
                  background: "#141414",
                  border: "1px solid #262626",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span className="mono" style={{ fontSize: 12, color: "#737373", marginLeft: 8 }}>{item.cat}</span>
              </button>
            ))}
          </div>
        ) : (
          <div
            key={`d-${detailKey}`}
            className="slide-in"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              padding: 16,
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: 8,
            }}
          >
            <button
              type="button"
              onClick={goBack}
              style={{
                marginBottom: 12,
                padding: "6px 10px",
                fontFamily: "inherit",
                fontSize: 13,
                color: "#a3a3a3",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              ← back
            </button>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{selected.name}</div>
            <div className="mono" style={{ fontSize: 12, color: "#737373", marginBottom: 4 }}>{selected.cat}</div>
            <div style={{ fontSize: 14, color: "#a3a3a3" }}>Status: {selected.stat}</div>
            <div className="mono" style={{ fontSize: 12, color: "#737373", marginTop: 4 }}>Items: {selected.n}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContinuityDemo() {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ marginBottom: 48 }}>
      <h3 className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", color: "#737373", marginBottom: 12, textTransform: "uppercase" }}>
        Continuity (card → overlay, scale-up)
      </h3>
      <div style={{ position: "relative" }}>
        <div
          ref={cardRef}
          style={{
            padding: 16,
            background: "#141414",
            border: "1px solid #262626",
            borderRadius: 8,
            maxWidth: 280,
            opacity: expanded ? 0.3 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          <div style={{ fontSize: 16, marginBottom: 8 }}>Storage</div>
          <div style={{ height: 6, background: "#262626", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: "68%", height: "100%", background: "#a3a3a3", borderRadius: 3 }} />
          </div>
          <div className="mono" style={{ fontSize: 12, color: "#737373", marginBottom: 12 }}>68% used</div>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            style={{
              padding: "6px 12px",
              fontFamily: "inherit",
              fontSize: 13,
              color: "#e5e5e5",
              background: "#262626",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            expand ↗
          </button>
        </div>
        {expanded && (
          <div
            className="scale-up"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              transformOrigin: "top left",
              padding: 20,
              background: "#141414",
              border: "1px solid #262626",
              borderRadius: 8,
              minWidth: 320,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 18 }}>Storage (expanded)</div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                style={{
                  padding: "4px 10px",
                  fontFamily: "inherit",
                  fontSize: 13,
                  color: "#a3a3a3",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                ✕ close
              </button>
            </div>
            <div style={{ height: 8, background: "#262626", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: "68%", height: "100%", background: "#737373", borderRadius: 4 }} />
            </div>
            <div className="mono" style={{ fontSize: 12, color: "#737373" }}>68% used — 12.4 GB of 18 GB</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UITransitions() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORTS + ANIMATION_CSS }} />
      <div className="ui-transitions-page" style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 400, marginBottom: 8 }}>UI Transitions</h1>
        <p className="mono" style={{ fontSize: 14, color: "#737373", marginBottom: 40 }}>
          Context, drill-down, and continuity patterns — CSS only.
        </p>
        <ContextDemo />
        <DrillDemo />
        <ContinuityDemo />
      </div>
    </>
  );
}
