"use client";

import Link from "next/link";
import { Suspense } from "react";
import { LocaleSwitch } from "@/components/LocaleSwitch";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { DemoPeriodProvider } from "./DemoPeriodContext";
import { DemoNav } from "./DemoNav";
import { STR } from "./strings";

export function DemoProductionLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bpm-bg-primary, #ffffff)" }}
    >
      <header
        className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 print:hidden"
        style={{
          background: "var(--bpm-bg-primary)",
          borderColor: "var(--bpm-border)",
        }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-lg font-semibold"
            style={{ color: "var(--bpm-text-primary)" }}
          >
            Blueprint Modular
          </Link>
          <span
            className="rounded px-2 py-1 text-sm"
            style={{
              background: "var(--bpm-bg-secondary)",
              color: "var(--bpm-text-secondary)",
            }}
          >
            {t.demoBadge}
          </span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a
            href="https://docs.blueprint-modular.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.documentation}
          </a>
          <Link
            href="/sandbox"
            className="underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.appBuilder}
          </Link>
          <LocaleSwitch />
        </nav>
      </header>

      <div
        className="mx-auto max-w-4xl px-4 py-3 text-center text-sm print:hidden"
        style={{
          background: "rgba(245, 158, 11, 0.12)",
          color: "#8a5a00",
          borderBottom: "1px solid rgba(245, 158, 11, 0.3)",
        }}
      >
        {t.demoBanner}
      </div>

      <Suspense fallback={<div className="h-12" />}>
        <DemoPeriodProvider>
          <div className="print:hidden">
            <DemoNav />
          </div>
          <main className="max-w-6xl mx-auto px-4 py-6 print:py-2">{children}</main>
        </DemoPeriodProvider>
      </Suspense>
    </div>
  );
}
