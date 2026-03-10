"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";

export interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

export interface PageLayoutProps {
  title: string;
  items: SidebarItem[];
  currentItem: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function getIcon(name: string): React.ComponentType<{ size?: number; style?: React.CSSProperties }> {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>>;
  const Icon = icons[name];
  return Icon ?? (LucideIcons.Circle as React.ComponentType<{ size?: number; style?: React.CSSProperties }>);
}

export function PageLayout({
  title,
  items,
  currentItem,
  onNavigate,
  children,
  defaultCollapsed = false,
}: PageLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const ChevronLeft = LucideIcons.ChevronLeft as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  const ChevronRight = LucideIcons.ChevronRight as React.ComponentType<{ size?: number; style?: React.CSSProperties }>;

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--bpm-bg)",
      }}
    >
      <aside
        style={{
          width: isCollapsed ? 48 : 220,
          background: isCollapsed ? "var(--bpm-bg)" : "var(--bpm-surface)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: isCollapsed ? "none" : "block",
            padding: "20px 16px",
            fontSize: 16,
            fontWeight: 600,
            color: "var(--bpm-text)",
          }}
        >
          {title}
        </header>
        <nav style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {items.map((item) => {
            const IconComponent = getIcon(item.icon);
            const isActive = currentItem === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: isCollapsed ? "8px 0" : "8px 16px",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  border: "none",
                  borderLeft: isActive && !isCollapsed ? "2px solid var(--bpm-accent)" : "2px solid transparent",
                  background: isActive ? "var(--bpm-bg)" : "transparent",
                  color: isActive ? "var(--bpm-accent)" : isCollapsed ? "var(--bpm-text-muted)" : "var(--bpm-text-secondary)",
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 14,
                  marginLeft: isCollapsed ? 0 : -2,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bpm-bg)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <IconComponent size={20} style={{ flexShrink: 0 }} />
                <span
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    transition: "opacity 0.15s ease",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => setIsCollapsed((c) => !c)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            padding: "12px 16px",
            border: "none",
            background: "transparent",
            color: "var(--bpm-text-secondary)",
            cursor: "pointer",
          }}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} style={{ flexShrink: 0 }} />
            </>
          )}
        </button>
      </aside>
      <main
        style={{
          flex: 1,
          background: "var(--bpm-bg)",
          overflow: "auto",
          padding: 32,
        }}
      >
        {children}
      </main>
    </div>
  );
}
