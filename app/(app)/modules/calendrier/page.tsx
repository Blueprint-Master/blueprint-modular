"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { str } from "./strings";

/**
 * La page Calendrier unique est le simulateur (/modules/calendrier/simulateur).
 * Redirection pour ne plus maintenir deux pages.
 */
export default function CalendrierModulePage() {
  const router = useRouter();
  const { locale } = useI18n();
  const s = str(locale);
  useEffect(() => {
    router.replace("/modules/calendrier/simulateur");
  }, [router]);

  return (
    <div className="doc-page flex items-center justify-center min-h-[200px]">
      <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.redirecting}
      </p>
    </div>
  );
}
