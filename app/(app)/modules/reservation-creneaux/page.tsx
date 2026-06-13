"use client";

import Link from "next/link";
import { CodeBlock, Tabs } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR, type ModuleStrings } from "./strings";
import ReservationCreneauxSimulateur from "./simulateur-content";

function docContent(s: ModuleStrings) {
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.aboutText}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsTitle}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code> {s.compSegMetric} <code>bpm.selectbox</code> {s.compSegSelect}{" "}
        <code>bpm.modal</code> {s.compSegModal} <code>bpm.confirmModal</code> {s.compSegConfirm}{" "}
        <code>bpm.input</code>, <code>bpm.badge</code>, <code>bpm.button</code> {s.and}{" "}
        <code>bpm.toast</code>. {s.compSegGrid}
      </p>
      <CodeBlock
        code={`import bpm

salle = bpm.selectbox("Ressource", options=["Salle Hugo", "Salle Colette", "Box Rimbaud"])

bpm.metricRow([
    bpm.metric("Réservations cette semaine", 11),
    bpm.metric("Taux d'occupation", "20 %"),
    bpm.metric("Salle la plus demandée", "Salle Hugo"),
])

# Réserver un créneau libre (contrôle de conflit inclus)
bpm.modal(
    title="Réserver un créneau",
    children=[
        bpm.input("Titre de la réunion", required=True),
        bpm.input("Organisateur", value="Vous"),
        bpm.selectbox("Durée", options=["1 heure", "2 heures"]),
        bpm.button("Confirmer la réservation", on_click=reserver),
    ],
)`}
        language="python"
      />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.settingsTitle}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.settingsText1}{" "}
        <Link href="/modules/reservation-creneaux/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.settingsDocLink}
        </Link>{" "}
        {s.settingsText2}
      </p>
    </div>
  );
}

export default function ReservationCreneauxModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">{s.modules}</Link> → {s.moduleName}
        </div>
        <h1>{s.moduleName}</h1>
        <p className="doc-description">{s.pageDescription}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{s.categoryBadge}</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link
            href="/modules/reservation-creneaux/simulateur"
            className="font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {s.openSimulator}
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: s.documentation, content: docContent(s) },
          { label: s.simulator, content: <ReservationCreneauxSimulateur /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
