"use client";

import Link from "next/link";
import { Button } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ContractDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { locale } = useI18n();
  const t = STR[locale].errorBoundary;
  return (
    <div className="doc-page error-boundary" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        className="rounded-lg border p-8 max-w-md w-full text-center"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: "var(--bpm-error)" }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h2 className="text-lg font-semibold mb-2">{t.title}</h2>
        <p className="text-sm mb-6" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.desc}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="primary" onClick={reset} aria-label={t.retryAria}>
            {t.retry}
          </Button>
          <Link href="/modules/contracts">
            <Button variant="secondary" aria-label={t.backToListAria}>
              {t.backToList}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
