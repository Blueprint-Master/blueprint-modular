"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";
import ReservationCreneauxSimulateur from "../simulateur-content";

export default function ReservationCreneauxSimulateurPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">{s.modules}</Link> →{" "}
          <Link href="/modules/reservation-creneaux">{s.moduleName}</Link> → {s.simulator}
        </div>
        <h1>{s.simPageTitle}</h1>
        <p className="doc-description">{s.simPageDescription}</p>
      </div>
      <ReservationCreneauxSimulateur />
    </div>
  );
}
