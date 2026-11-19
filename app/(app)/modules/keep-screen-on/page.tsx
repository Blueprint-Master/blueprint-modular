"use client";

import { useScreenWakeLock } from "@/components/bpm/useScreenWakeLock";
import Link from "next/link";
import { Button, Spinner } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function KeepScreenOnPage() {
  const { locale } = useI18n();
  const str = STR[locale];
  const { supported, duration: durationChoice, active, remainingSeconds, error, chooseDuration } = useScreenWakeLock();

  return (
    <div className="doc-page">
      <ModulePageHeader
        className="mb-6"
        breadcrumb={
          <>
            <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{str.breadcrumbModules}</Link> →{" "}
            <Link href="/modules/keep-screen-on" style={{ color: "var(--bpm-accent-cyan)" }}>{str.moduleName}</Link>
          </>
        }
        title={str.pageTitle}
        description={str.pageDescription}
        category={str.badgeCategory}
      />

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}
      >
        <div
          className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-2"
          style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-sidebar-bg)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
            {str.panelTitle}
          </span>
          <Link
            href="/modules/keep-screen-on/documentation"
            className="text-sm underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {str.documentationLink}
          </Link>
        </div>
        <div className="p-6">
          {supported === null && (
            <div className="flex items-center gap-3 py-4" style={{ color: "var(--bpm-text-secondary)" }}>
              <Spinner size="small" />
              <span className="text-sm">{str.checkingSupport}</span>
            </div>
          )}

          {supported === false && (
            <p className="text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "52ch" }}>
              {str.unsupportedBefore}<strong>{str.unsupportedStrong}</strong>{str.unsupportedAfter}
            </p>
          )}

          {supported === true && (
            <>
              <div className="flex flex-wrap gap-2 mb-6">
                {str.durations.map((d) => (
                  <Button
                    key={d.value}
                    size="small"
                    variant={durationChoice === d.value ? "primary" : "outline"}
                    onClick={() => chooseDuration(d.value)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: "var(--bpm-status-error, #dc2626)" }}>
                  {error.message || str.wakeLockErrorFallback}
                </p>
              )}

              <div className="flex items-center gap-3">
                <span
                  className="inline-flex w-3 h-3 rounded-full shrink-0"
                  style={{
                    background: active ? "var(--bpm-accent-mint, #22c55e)" : "var(--bpm-border)",
                  }}
                  aria-hidden
                />
                <span className="text-sm font-medium" style={{ color: "var(--bpm-text-primary)" }}>
                  {active
                    ? remainingSeconds !== null
                      ? str.statusOnRemaining(formatRemaining(remainingSeconds))
                      : str.statusOnIndefinite
                    : str.statusOff}
                </span>
              </div>
              <p className="text-xs mt-3" style={{ color: "var(--bpm-text-secondary)" }}>
                {str.visibilityNote}
              </p>
            </>
          )}
        </div>
      </div>

      <nav className="doc-pagination mt-8 flex flex-wrap gap-4">
        <Link href="/modules" style={{ color: "var(--bpm-accent-cyan)" }}>{str.backToModules}</Link>
        <Link href="/modules/keep-screen-on/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>{str.documentationLink}</Link>
      </nav>
    </div>
  );
}
