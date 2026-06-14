"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "./strings";

export default function DemoProductionError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useI18n();
  const t = STR[locale];
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center px-4"
      style={{ background: "var(--bpm-bg-secondary, #f5f5f5)" }}
    >
      <div
        className="rounded-lg border p-6 max-w-md w-full text-center"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <h2 className="text-lg font-semibold mb-2">{t.unavailableTitle}</h2>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.unavailableBody}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.retry}
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}
