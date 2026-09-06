"use client";
import React from "react";
import { AircraftMarker, AirportBoard, CelestialBody, CelestialScene, FlightInstruments, FlightMap,
  FlightProfile, GalaxyView, MoonPhase, OrbitalSystem, SeatMap, SolarSystem } from "@/components/bpm";
import type { CabinRow, FlightPosition, OrbitalBody } from "@/components/bpm";
import type { ShowcaseEntry } from "./registry";
import { CARTOGRAPHY_SHOWCASE } from "./cartography-scenes";

export const EXOMOONS: OrbitalBody[] = [
  { id: "star", label: "Aster", kind: "star", radius: 18, color: "#ffc071" },
  { id: "planet", label: "Nacre", kind: "planet", radius: 11, color: "#a7bbff", rings: true, parentId: "star",
    orbit: { semiMajorAxis: 63, eccentricity: 0.2, period: 30, phase: 25 } },
  { id: "moon", label: "Éclat", kind: "moon", radius: 4, color: "#e1dcca", parentId: "planet",
    orbit: { semiMajorAxis: 17, period: 4, inclination: 30 } },
  { id: "comet", label: "Comète", kind: "asteroid", radius: 4, color: "#78dbde", parentId: "star",
    orbit: { semiMajorAxis: 65, eccentricity: 0.65, period: 50, phase: 190, inclination: 20 } },
];
export const DEMO_FLIGHTS: FlightPosition[] = [
  { id: "a", label: "DEMO 104", lat: 46, lon: -24, heading: 265, color: "#f5bd72", description: "Trajet illustratif transatlantique" },
  { id: "b", label: "DEMO 208", lat: 28, lon: 48, heading: 115, color: "#8ecfe1", description: "Trajet illustratif vers l’est" },
];
export const CABIN: CabinRow[] = Array.from({ length: 6 }, (_, i) => ({ id: String(i + 1), label: String(i + 1), exit: i === 3,
  seats: ["A", "B", "", "C", "D"].map(letter => !letter ? null : ({ id: `${i + 1}${letter}`, label: `${i + 1}${letter}`,
    cabin: i < 2 ? "Premium" : "Économie", status: i === 1 && letter === "C" ? "occupied" as const : "available" as const })) }));

function AviationDemo() {
  const [selected, setSelected] = React.useState(DEMO_FLIGHTS[0]);
  return <div style={{ display: "grid", gap: 16 }}>
    <FlightMap flights={DEMO_FLIGHTS} selectedFlightId={selected.id} onFlightSelect={setSelected} caption="Vols de démonstration · sélectionner un avion"
      airports={[{ id: "cdg", code: "CDG", lat: 49.01, lon: 2.55 }, { id: "jfk", code: "JFK", lat: 40.64, lon: -73.78 }, { id: "dxb", code: "DXB", lat: 25.25, lon: 55.36 }]}
      routes={[{ id: "atlantic", from: { lat: 49.01, lon: 2.55 }, to: { lat: 40.64, lon: -73.78 } },
        { id: "east", from: { lat: 49.01, lon: 2.55 }, to: { lat: 25.25, lon: 55.36 } }]} />
    <FlightInstruments title={selected.label} caption="Télémétrie illustrative" heading={selected.heading} pitch={selected.id === "a" ? 3 : 8}
      roll={selected.id === "a" ? -12 : 18} altitude={selected.id === "a" ? 34000 : 28000} airspeed={selected.id === "a" ? 285 : 260} verticalSpeed={selected.id === "a" ? 0 : 900} />
  </div>;
}

/** Working examples: data-only presets and free renderers exercise the same public API. */
export const DOMAIN_SHOWCASE: ShowcaseEntry[] = [
  ...CARTOGRAPHY_SHOWCASE,
  { key: "celestialScene", class: "INTERACTIF", examples: [
    { name: "Nébuleuse libre", note: "Objets fictifs et annotation SVG projetée dans le même repère", render: () => <CelestialScene title="Nébuleuse · composition libre"
      objects={[{ id: "blue", label: "Étoile bleue", x: -32, y: 12, radius: 16, kind: "star", color: "#7bbaff" },
        { id: "red", label: "Géante rouge", x: 44, y: -20, z: 12, radius: 22, kind: "star", color: "#ee986b" }]}
      renderOverlay={({ project }) => { const p = project({ x: 0, y: 0 }); return <g pointerEvents="none">
        <ellipse cx={p.x} cy={p.y} rx="190" ry="80" fill="#5f4fbc" opacity="0.12" />
        <text x={p.x} y={p.y + 105} textAnchor="middle" fill="#b8acd9" fontSize="12">Nuage personnalisé par le LLM</text>
      </g>; }} /> },
  ] },
  { key: "celestialBody", class: "DATA", examples: [{ name: "Astres", render: () => <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
    <CelestialBody kind="star" label="Étoile" color="#ffbd6f" /><CelestialBody label="Planète à anneaux" rings color="#cbb598" />
    <CelestialBody kind="black-hole" label="Trou noir stylisé" color="#dc984e" /></div> }] },
  { key: "orbitalSystem", class: "INTERACTIF", examples: [{ name: "Exoplanète et lune", note: "Hiérarchie, orbite excentrique, comète et animation déclenchée", render: () =>
    <OrbitalSystem bodies={EXOMOONS} speed={3} title="Aster · système imaginaire" scene={{ extent: 125, height: 420 }} /> }] },
  { key: "solarSystem", class: "INTERACTIF", examples: [
    { name: "Huit planètes", render: () => <SolarSystem options={{ speed: 80 }} /> },
    { name: "Planètes internes", render: () => <SolarSystem region="inner" distanceScale="relative" options={{ scene: { camera: { elevation: 0 }, height: 380 } }} /> },
  ] },
  { key: "galaxyView", class: "INTERACTIF", examples: [
    { name: "Voie lactée artistique", render: () => <GalaxyView title="Voie lactée · vue artistique" landmarks={[{ id: "sun", label: "Repère solaire illustratif", x: 55, y: -20, radius: 3, color: "#ffe3a1" }]} /> },
    { name: "Galaxie personnalisée", render: () => <GalaxyView title="Galaxie elliptique" morphology="elliptical" seed={81} palette={["#bd8664", "#f1d1ac"]} /> },
  ] },
  { key: "moonPhase", class: "DATA", examples: [{ name: "Cycle lunaire", render: () => <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
    {[0, 0.15, 0.25, 0.5, 0.75].map(phase => <MoonPhase key={phase} phase={phase} size={100} />)}</div> }] },
  { key: "aircraftMarker", class: "DATA", examples: [{ name: "Flotte", render: () => <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
    {(["jet", "propeller", "helicopter", "drone"] as const).map(kind => <AircraftMarker key={kind} kind={kind} label={kind} size={64} heading={30} />)}</div> }] },
  { key: "flightMap", class: "INTERACTIF", examples: [{ name: "Carte et télémétrie liées", render: () => <AviationDemo /> }] },
  { key: "flightInstruments", class: "DATA", examples: [{ name: "Montée en virage", render: () => <FlightInstruments pitch={8} roll={15} heading={82}
    altitude={32000} airspeed={280} verticalSpeed={1200} caption="Télémétrie de démonstration" /> }] },
  { key: "flightProfile", class: "INTERACTIF", examples: [{ name: "Trajectoire verticale", render: () => <FlightProfile referenceAltitude={32000} points={[
    { id: "a", x: 0, altitude: 0, label: "Décollage" }, { id: "b", x: 15, altitude: 21000, label: "Montée" },
    { id: "c", x: 30, altitude: 32000, label: "Croisière" }, { id: "d", x: 70, altitude: 32000, label: "Début descente" },
    { id: "e", x: 90, altitude: 0, label: "Atterrissage" }]} /> }] },
  { key: "airportBoard", class: "INTERACTIF", examples: [{ name: "Départs", render: () => <AirportBoard title="Départs · démonstration" timezoneLabel="Heure locale · Europe/Paris" flights={[
    { id: "a", flightNumber: "DEMO 104", destination: "New York", scheduledTime: "14:20", gate: "L42", status: "Embarquement", statusColor: "#55b69b", direction: "departure" },
    { id: "b", flightNumber: "DEMO 208", destination: "Dubaï", scheduledTime: "14:45", expectedTime: "15:10", gate: "K21", status: "Retardé", statusColor: "#dcae64", direction: "departure" },
    { id: "c", flightNumber: "DEMO 312", destination: "Lisbonne", scheduledTime: "15:00", gate: "B12", status: "À l’heure", direction: "departure" }]} /> }] },
  { key: "seatMap", class: "INTERACTIF", examples: [{ name: "Cabine 2 + 2", render: () => <SeatMap rows={CABIN} multiple /> }] },
];

/** Mounted on the actual component detail route, not only in a dormant registry. */
export function DomainSceneExamples({ slug }: { slug: string }) {
  const entry = DOMAIN_SHOWCASE.find(item => item.key.toLowerCase() === slug);
  if (!entry) return null;
  return <section aria-label={`Exemples de bpm.${entry.key}`} style={{ marginTop: 28, display: "grid", gap: 24, minWidth: 0 }}>
    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Exemples interactifs</h2>
    {entry.examples.map(example => <div key={example.name} style={{ minWidth: 0 }}>
      <h3 style={{ fontSize: 14, marginBottom: 10 }}>{example.name}</h3>
      {example.note && <p style={{ fontSize: 13, color: "var(--bpm-text-secondary)", marginBottom: 12 }}>{example.note}</p>}
      {example.render()}
    </div>)}
  </section>;
}
