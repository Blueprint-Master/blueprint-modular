"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

export default function ReservationCreneauxDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.modules}</Link> →{" "}
          <Link href="/modules/reservation-creneaux">{s.moduleName}</Link> → {s.documentation}
        </nav>
        <h1>{s.docPageTitle}</h1>
        <p className="doc-description">{s.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.dataModelTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.dm1}
        <strong>{s.dmResource}</strong>
        {s.dm2}
        <strong>{s.dmSlot}</strong>
        {s.dm3}
        <strong>{s.dmBooking}</strong>
        {s.dm4}
      </p>
      <CodeBlock code={s.dataModelCode} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.rulesTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        <li>
          <strong>{s.rule1Title}</strong>
          {s.rule1Text}
        </li>
        <li>
          <strong>{s.rule2Title}</strong>
          {s.rule2Text}
        </li>
        <li>
          <strong>{s.rule3Title}</strong>
          {s.rule3TextA}
          <code>bpm.confirmModal</code>
          {s.rule3TextB}
        </li>
        <li>
          <strong>{s.rule4Title}</strong>
          {s.rule4Text}
        </li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.indicatorsTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.indicatorsText}
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.calendarTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.cal1}
        <code>resources</code> / <code>bookings</code>
        {s.cal2}
        <Link href="/modules/calendrier" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.calLink}
        </Link>
        {s.cal3}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/reservation-creneaux/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
