"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * La page Calendrier unique est le simulateur (/modules/calendrier/simulateur).
 * Redirection pour ne plus maintenir deux pages.
 */
export default function CalendrierModulePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/modules/calendrier/simulateur");
  }, [router]);

  return (
    <div className="doc-page flex items-center justify-center min-h-[200px]">
      <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        Redirection vers le calendrier…
      </p>
    </div>
  );
}
