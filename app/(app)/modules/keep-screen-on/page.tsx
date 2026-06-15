"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Button, Spinner } from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

// Sentinel stocké dans l'état d'erreur quand l'exception n'a pas de message :
// résolu en chaîne localisée au rendu (évite de lier requestWakeLock à la locale).
const WAKE_LOCK_ERROR_FALLBACK = "__wake_lock_error_fallback__";

function formatRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function KeepScreenOnPage() {
  const { locale } = useI18n();
  const str = STR[locale];
  const [supported, setSupported] = useState<boolean | null>(null);
  const [durationChoice, setDurationChoice] = useState<number>(0); // 0 = off by default, -1 = indefinite
  const [active, setActive] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endAtRef = useRef<number | null>(null);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    endAtRef.current = null;
    setRemainingSeconds(null);
    setActive(false);
  }, []);

  const requestWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    setError(null);
    try {
      const sentinel = await (navigator as Navigator & { wakeLock: WakeLock }).wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      sentinel.addEventListener("release", () => {
        wakeLockRef.current = null;
      });
      setActive(true);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : WAKE_LOCK_ERROR_FALLBACK;
      setError(msg);
      setActive(false);
      return false;
    }
  }, []);

  // When user selects a duration: 0 = off, -1 = indefinite, else start timer
  useEffect(() => {
    setError(null);
    if (durationChoice === 0) {
      releaseWakeLock();
      return;
    }
    if (durationChoice === -1) {
      // Indefinite: just request lock, no timer
      releaseWakeLock();
      requestWakeLock();
      return;
    }
    // Finite duration: release any existing, then request and start countdown
    releaseWakeLock();
    const durationSeconds = durationChoice * 60;
    requestWakeLock().then((ok) => {
      if (!ok) return;
      endAtRef.current = Date.now() + durationSeconds * 1000;
      setRemainingSeconds(durationSeconds);
      timerRef.current = setInterval(() => {
        const end = endAtRef.current;
        if (!end) return;
        const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
        setRemainingSeconds(left);
        if (left <= 0) {
          releaseWakeLock();
        }
      }, 1000);
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationChoice, requestWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again (if we're in "on" mode)
  useEffect(() => {
    if (supported !== true || durationChoice === 0) return;
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !wakeLockRef.current) {
        if (durationChoice === -1) {
          requestWakeLock();
        } else if (endAtRef.current && Date.now() < endAtRef.current) {
          requestWakeLock();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [supported, durationChoice, requestWakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // Check support on mount (only on client side)
  useEffect(() => {
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      setSupported("wakeLock" in navigator);
    } else {
      setSupported(false);
    }
  }, []);

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
                    onClick={() => setDurationChoice(d.value)}
                  >
                    {d.label}
                  </Button>
                ))}
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: "var(--bpm-status-error, #dc2626)" }}>
                  {error === WAKE_LOCK_ERROR_FALLBACK ? str.wakeLockErrorFallback : error}
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
