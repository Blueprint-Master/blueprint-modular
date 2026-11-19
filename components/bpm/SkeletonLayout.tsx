"use client";

import React from "react";
import { useBpmLocale } from "./i18n";
import { Skeleton } from "./Skeleton";
import "./SkeletonLayout.css";

export type SkeletonAssembly = "dashboard" | "list" | "article" | "form" | "detail" | "chart";

interface LayoutProps {
  assembly: SkeletonAssembly;
  metrics?: number;
  rows?: number;
  columns?: number;
  fields?: number;
}

function count(value: number | undefined, fallback: number, max: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(1, Math.trunc(value))) : fallback;
}

export function SkeletonLayout({ assembly, metrics, rows, columns, fields }: LayoutProps) {
  switch (assembly) {
    case "list": return <SkeletonList rows={count(rows, 8, 100)} columns={count(columns, 4, 6)} />;
    case "article": return <SkeletonArticle />;
    case "form": return <SkeletonForm fields={count(fields, 5, 100)} />;
    case "detail": return <SkeletonDetail />;
    case "chart": return <SkeletonChart />;
    default: return <SkeletonDashboard metrics={count(metrics, 3, 12)} rows={count(rows, 5, 100)} />;
  }
}

function SkeletonDashboard({ metrics = 3, rows = 5 }: { metrics?: number; rows?: number }) {
  const locale = useBpmLocale();
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <div className="flex items-center justify-between gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="circular" width={36} height={36} />
      </div>
      <div className="mb-6">
        <Skeleton variant="rectangular" width="55%" height={28} className="mb-3" />
        <Skeleton variant="text" width="90%" height={12} className="mb-2" />
        <Skeleton variant="text" width="70%" height={12} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.min(metrics, 4)}, minmax(0, 1fr))` }}>
        {Array.from({ length: metrics }, (_, i) => (
          <Skeleton key={i} variant="rectangular" width="100%" height={72} rounded="lg" />
        ))}
      </div>
      <div className="mb-6">
        <Skeleton variant="rectangular" width="100%" height={24} className="mb-3" />
        <Skeleton variant="text" width="100%" height={12} className="mb-2" />
        <Skeleton variant="text" width="95%" height={12} />
      </div>
      <div>
        <div className="flex gap-4 mb-3 pb-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
          <Skeleton variant="rectangular" width={120} height={16} />
          <Skeleton variant="rectangular" width={160} height={16} />
          <Skeleton variant="rectangular" width={100} height={16} />
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-4 py-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
            <Skeleton variant="rectangular" width={120} height={14} />
            <Skeleton variant="rectangular" width={160} height={14} />
            <Skeleton variant="rectangular" width={100} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonList({ rows = 8, columns = 4 }: { rows?: number; columns?: number }) {
  const locale = useBpmLocale();
  const cols = Math.min(Math.max(columns, 1), 6);
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <div className="flex items-center justify-between gap-4 mb-4 pb-3" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="rectangular" width="30%" height={20} />
        <Skeleton variant="rectangular" width={200} height={36} rounded="md" />
      </div>
      <Skeleton variant="rectangular" width="100%" height={40} className="mb-4" rounded="md" />
      <div className="flex gap-4 mb-3 pb-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} variant="rectangular" width={i === 0 ? 80 : 100} height={16} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 py-2" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton key={j} variant="rectangular" width={j === 0 ? 80 : 100} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonArticle() {
  const locale = useBpmLocale();
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <Skeleton variant="rectangular" width="80%" height={32} className="mb-4" rounded="md" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="95%" height={14} className="mb-2" />
      <Skeleton variant="text" width="88%" height={14} className="mb-4" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="70%" height={14} className="mb-4" />
      <Skeleton variant="rectangular" width="60%" height={20} className="mb-2" rounded="sm" />
      <Skeleton variant="text" width="100%" height={14} className="mb-2" />
      <Skeleton variant="text" width="90%" height={14} />
    </div>
  );
}

function SkeletonForm({ fields = 5 }: { fields?: number }) {
  const locale = useBpmLocale();
  const n = Math.min(Math.max(fields, 1), 10);
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6 max-w-md"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <Skeleton variant="rectangular" width="50%" height={24} className="mb-6" rounded="md" />
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="mb-4">
          <Skeleton variant="rectangular" width={100} height={14} className="mb-2" rounded="sm" />
          <Skeleton variant="rectangular" width="100%" height={40} rounded="md" />
        </div>
      ))}
      <div className="flex gap-2 mt-6">
        <Skeleton variant="rectangular" width={100} height={36} rounded="md" />
        <Skeleton variant="rectangular" width={80} height={36} rounded="md" />
      </div>
    </div>
  );
}

function SkeletonDetail() {
  const locale = useBpmLocale();
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <div className="flex items-center justify-between gap-4 mb-6 pb-4" style={{ borderBottom: "1px solid var(--bpm-border)" }}>
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="rectangular" width={80} height={32} rounded="md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton variant="rectangular" width="70%" height={28} className="mb-4" rounded="md" />
          <Skeleton variant="text" width="100%" height={14} className="mb-2" />
          <Skeleton variant="text" width="95%" height={14} className="mb-2" />
          <Skeleton variant="text" width="88%" height={14} />
        </div>
        <div className="space-y-3">
          <Skeleton variant="rectangular" width={120} height={16} className="mb-2" rounded="sm" />
          <Skeleton variant="text" width="100%" height={12} className="mb-2" />
          <Skeleton variant="text" width="90%" height={12} className="mb-2" />
          <Skeleton variant="rectangular" width="100%" height={14} className="mb-2" rounded="sm" />
          <Skeleton variant="text" width="80%" height={12} />
        </div>
      </div>
    </div>
  );
}

function SkeletonChart() {
  const locale = useBpmLocale();
  return (
    <div
      className="bpm-skeleton-container rounded-xl border p-6"
      style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={locale === "en" ? "Loading" : "Chargement"}
    >
      <Skeleton variant="rectangular" width="40%" height={20} className="mb-4" rounded="md" />
      <div className="flex gap-4 items-end" style={{ height: 200 }}>
        <div className="flex flex-col gap-2 w-8 shrink-0">
          {[100, 80, 60, 40, 20].map((h, i) => (
            <Skeleton key={i} variant="rectangular" width={24} height={14} rounded="sm" />
          ))}
        </div>
        <div className="flex-1 flex items-end gap-2 justify-around pt-2" style={{ height: "100%" }}>
          {[60, 90, 45, 70, 85, 55].map((h, i) => (
            <Skeleton key={i} variant="rectangular" width="12%" height={`${h}%`} rounded="md" />
          ))}
        </div>
      </div>
      <div className="flex justify-around mt-2 gap-2">
        {["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"].map((label, i) => (
          <Skeleton key={i} variant="rectangular" width={32} height={12} rounded="sm" />
        ))}
      </div>
    </div>
  );
}
