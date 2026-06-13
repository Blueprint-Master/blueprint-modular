"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function VeilleSimulateurPage() {
  const router = useRouter();
  const { locale } = useI18n();
  useEffect(() => {
    router.replace("/modules/veille");
  }, [router]);
  return (
    <p style={{ color: "var(--bpm-text-secondary)", padding: "1rem" }}>
      {STR[locale].redirecting}
    </p>
  );
}
