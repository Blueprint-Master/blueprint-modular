"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

/**
 * Redirection /modules/wiki/simulator → /modules/wiki/simulateur
 * pour que les deux URLs pointent vers le mode démo du Wiki.
 */
export default function WikiSimulatorRedirectPage() {
  const { locale } = useI18n();
  const t = STR[locale];
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/wiki/simulateur");
  }, [router]);
  return (
    <div className="doc-page flex flex-col items-center justify-center gap-4 min-h-[200px]" style={{ color: "var(--bpm-text-secondary)" }}>
      <Spinner size="medium" text={t.sandbox.redirectText} />
      <p className="text-sm">{t.sandbox.redirectBody}</p>
    </div>
  );
}
