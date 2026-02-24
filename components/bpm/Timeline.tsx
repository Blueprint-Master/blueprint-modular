"use client";

import React from "react";

export interface TimelineItem {
  id?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  date?: string;
  status?: "done" | "current" | "upcoming";
}

export interface TimelineProps {
  items?: TimelineItem[];
  className?: string;
}

export function Timeline({ items = [], className = "" }: TimelineProps) {
  return (
    <div className={"bpm-timeline " + className} style={{ color: "var(--bpm-text-primary)" }}>
      {items.map((item, i) => {
        const status = item.status ?? (i === 0 ? "current" : "upcoming");
        const isDone = status === "done";
        const isCurrent = status === "current";
        return (
          <div key={item.id ?? String(i)} className="flex gap-4">
            <div className="flex flex-col items-center shrink-0">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  background: isDone || isCurrent ? "var(--bpm-accent-cyan)" : "transparent",
                  borderColor: isDone || isCurrent ? "var(--bpm-accent-cyan)" : "var(--bpm-border)",
                }}
              />
              {i < items.length - 1 && (
                <div className="w-0.5 flex-1 min-h-[24px]" style={{ background: "var(--bpm-border)" }} />
              )}
            </div>
            <div className="pb-6">
              {item.date && (
                <p className="text-xs m-0 mb-0.5" style={{ color: "var(--bpm-text-secondary)" }}>{item.date}</p>
              )}
              <p className="font-medium m-0 text-sm">{item.title}</p>
              {item.description != null && (
                <p className="text-sm m-0 mt-1" style={{ color: "var(--bpm-text-secondary)" }}>{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
