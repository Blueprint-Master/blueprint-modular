"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { str } from "../strings";

export default function IASimulateurPage() {
  const router = useRouter();
  const { locale } = useI18n();
  useEffect(() => {
    router.replace("/modules/ia");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      {str(locale).simulateur.redirecting}
    </p>
  );
}
