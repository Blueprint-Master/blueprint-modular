"use client";

import React from "react";
import {
  Metric,
  Button,
  Panel,
  Title,
  Message,
  Spinner,
  Tooltip,
  Selectbox,
  NumberInput,
  CodeBlock,
  Badge,
  Progress,
  Skeleton,
  Card,
  Divider,
  EmptyState,
  Input,
  Textarea,
  Checkbox,
  RadioGroup,
  Slider,
  DateInput,
  ColorPicker,
  Chip,
  Breadcrumb,
  Stepper,
  Avatar,
  Text,
  Caption,
  JsonViewer,
  Rating,
  Container,
  Empty,
  StatusBox,
  Html,
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  Barcode,
  QRCode,
  NfcBadge,
  Pagination,
  LoadingBar,
  Markdown,
  StreamingText,
  Toggle,
  LabelValue,
  SpinnerDot,
} from "@/components/bpm";
import { PlotlyChart } from "@/components/bpm";
import { AircraftMarker, AirportBoard, CelestialBody, CelestialScene, FlightInstruments, FlightMap,
  FlightProfile, GalaxyView, MoonPhase, OrbitalSystem, SeatMap, SolarSystem, CartographicMap, MapLayerControl, MapLegend } from "@/components/bpm";
import { createDemoMapLayers, DEMO_MAP_GROUPS } from "@/components/showcase/cartography-scenes";
import { EXOMOONS, DEMO_FLIGHTS, CABIN } from "@/components/showcase/domain-scenes";

/**
 * Registre des composants rendables en direct dans le playground. Chaque entrée
 * fournit des props de base (données complexes : séries, options, callbacks) sur
 * lesquelles les props éditées par l'utilisateur sont superposées. Les composants
 * du barrel `@/components/bpm` sont importés statiquement — ils sont bundlés, donc
 * aucun `npm install` n'est requis côté visiteur.
 *
 * Les composants absents de ce registre dégradent proprement dans l'UI (formulaire
 * de props + snippets affichés, aperçu remplacé par un lien vers la fiche).
 */

export type PlaygroundProps = Record<string, unknown>;
export type PlaygroundRenderer = (props: PlaygroundProps) => React.ReactNode;

/** Fusionne base + props live ; une valeur live "" laisse la base visible. */
function merge(base: PlaygroundProps, live: PlaygroundProps): PlaygroundProps {
  const out: PlaygroundProps = { ...base };
  for (const [k, v] of Object.entries(live)) {
    if (v === undefined) continue;
    if (v === "" && k in base) continue;
    out[k] = v;
  }
  return out;
}

type AnyComp = React.ComponentType<PlaygroundProps>;

/** Crée un renderer pour un composant + ses props de base. */
function reg(Comp: React.ComponentType<unknown>, base: PlaygroundProps = {}): PlaygroundRenderer {
  const C = Comp as unknown as AnyComp;
  return (live) => <C {...merge(base, live)} />;
}

const noop = () => {};

// Données d'exemple pour les composants à props complexes (non éditables).
const SAMPLE_SERIES = [
  { x: 1, y: 10 },
  { x: 2, y: 24 },
  { x: 3, y: 18 },
  { x: 4, y: 32 },
  { x: 5, y: 27 },
];
const SAMPLE_BARS = [
  { x: "A", y: 40 },
  { x: "B", y: 60 },
  { x: "C", y: 35 },
];
const SAMPLE_PLOTLY = [
  { x: ["Lun", "Mar", "Mer", "Jeu", "Ven"], y: [3420, 3680, 3550, 3890, 4120], type: "scatter", name: "Sessions" },
];

export const PLAYGROUND_RENDERERS: Record<string, PlaygroundRenderer> = {
  cartographicmap: reg(CartographicMap, { layers: createDemoMapLayers(), groups: DEMO_MAP_GROUPS, projection: "simple", center: [50, 50], bounds: [[0, 0], [100, 100]], description: "Territoire imaginaire · données synthétiques" }),
  maplayercontrol: reg(MapLayerControl, { layers: createDemoMapLayers(), groups: DEMO_MAP_GROUPS }),
  maplegend: reg(MapLegend, { layers: createDemoMapLayers("agricultural"), groups: DEMO_MAP_GROUPS, theme: "agricultural" }),
  // — Scènes célestes et aviation : préréglages éditables du catalogue —
  celestialbody: reg(CelestialBody, { label: "Astre", rings: true, color: "#cbb598" }),
  celestialscene: reg(CelestialScene, { objects: [{ id: "star", label: "Étoile", x: 0, y: 0, kind: "star", radius: 20, color: "#ffc071" }] }),
  orbitalsystem: reg(OrbitalSystem, { bodies: EXOMOONS, speed: 3 }),
  solarsystem: reg(SolarSystem),
  galaxyview: reg(GalaxyView, { title: "Galaxie illustrative", starCount: 1200 }),
  moonphase: reg(MoonPhase, { phase: 0.18 }),
  aircraftmarker: reg(AircraftMarker, { heading: 35, size: 64 }),
  flightmap: reg(FlightMap, { flights: DEMO_FLIGHTS, caption: "Vols de démonstration" }),
  flightinstruments: reg(FlightInstruments, { pitch: 8, roll: 15, heading: 82, altitude: 32000, airspeed: 280, verticalSpeed: 1200, caption: "Télémétrie de démonstration" }),
  flightprofile: reg(FlightProfile, { points: [{ id: "a", x: 0, altitude: 0 }, { id: "b", x: 20, altitude: 32000 }, { id: "c", x: 90, altitude: 0 }] }),
  airportboard: reg(AirportBoard, { flights: [{ id: "demo", flightNumber: "DEMO 42", destination: "Lisbonne", scheduledTime: "14:20", status: "Embarquement", direction: "departure" }] }),
  seatmap: reg(SeatMap, { rows: CABIN }),
  // — Texte & affichage —
  title: reg(Title, { level: 2, children: "Titre exemple" }),
  title1: reg(Title, { level: 1, children: "Titre exemple" }),
  title2: reg(Title, { level: 2, children: "Titre exemple" }),
  title3: reg(Title, { level: 3, children: "Titre exemple" }),
  titlebpm: reg(Title, { level: 2, children: "Titre exemple" }),
  text: reg(Text, { children: "Texte de corps." }),
  caption: reg(Caption, { children: "Légende secondaire." }),
  badge: reg(Badge, { children: "Badge", variant: "default" }),
  chip: reg(Chip, { label: "Tag", variant: "default" }),
  nfcbadge: reg(NfcBadge, { label: "Scannable", variant: "primary" }),
  labelvalue: reg(LabelValue, { label: "Nom", value: "Valeur" }),
  html: reg(Html, { html: "<strong>HTML</strong> inline" }),
  markdown: reg(Markdown, { text: "**Gras** et *italique*" }),
  jsonviewer: reg(JsonViewer, { data: { a: 1, b: "x", c: [1, 2] }, defaultExpandedLevel: 1 }),
  divider: reg(Divider, {}),

  // — Feedback / état —
  message: reg(Message, { type: "info", children: "Message d'information." }),
  panel: reg(Panel, { variant: "info", title: "Information", children: "Contenu du panneau." }),
  card: reg(Card, { title: "Titre de carte", children: "Contenu de la carte.", variant: "default" }),
  progress: reg(Progress, { value: 60, max: 100 }),
  skeleton: reg(Skeleton, { variant: "text" }),
  spinner: reg(Spinner, { size: "small", text: "" }),
  spinnerdot: reg(SpinnerDot, {}),
  loadingbar: reg(LoadingBar, { variant: "sweep" }),
  statusbox: reg(StatusBox, { label: "Statut", state: "complete" }),
  streamingtext: reg(StreamingText, { content: "Texte en flux.", isStreaming: false }),
  emptystate: reg(EmptyState, { title: "Aucune donnée", description: "Ajoutez des éléments." }),
  empty: reg(Empty, { children: "—" }),
  container: reg(Container, { children: "Contenu du conteneur" }),
  tooltip: reg(Tooltip, { text: "Aide contextuelle", children: "Survolez-moi" }),

  // — Saisie —
  button: reg(Button, { children: "Action", variant: "primary" }),
  input: reg(Input, { label: "Nom", value: "", placeholder: "Saisir...", onChange: noop }),
  textarea: reg(Textarea, { label: "Commentaire", value: "", rows: 3, onChange: noop }),
  checkbox: reg(Checkbox, { label: "Accepter", checked: false, onChange: noop }),
  toggle: reg(Toggle, { label: "Activer", value: false, onChange: noop }),
  numberinput: reg(NumberInput, { label: "Quantité", value: 10, onChange: noop }),
  slider: reg(Slider, { value: 50, min: 0, max: 100, step: 1, onChange: noop }),
  selectbox: reg(Selectbox, {
    label: "Choix",
    options: [
      { value: "a", label: "Option A" },
      { value: "b", label: "Option B" },
    ],
    value: "a",
    onChange: noop,
  }),
  radiogroup: reg(RadioGroup, {
    options: [
      { value: "a", label: "A" },
      { value: "b", label: "B" },
    ],
    value: "a",
    onChange: noop,
  }),
  dateinput: reg(DateInput, { label: "Date", value: "", onChange: noop }),
  colorpicker: reg(ColorPicker, { value: "#00a3e0", onChange: noop }),
  rating: reg(Rating, { value: 3, max: 5, onChange: noop }),

  // — Navigation —
  breadcrumb: reg(Breadcrumb, {
    items: [
      { label: "Accueil", href: "#" },
      { label: "Doc", href: "#" },
    ],
  }),
  stepper: reg(Stepper, { steps: [{ label: "Étape 1" }, { label: "Étape 2" }], currentStep: 0 }),
  pagination: reg(Pagination, { page: 1, totalPages: 5, onPageChange: noop }),
  avatar: reg(Avatar, { initials: "JD", size: "medium" }),

  // — Codes & médias —
  codeblock: reg(CodeBlock, { code: 'print("hello")', language: "python" }),
  barcode: reg(Barcode, { value: "1234567890123", height: 48 }),
  qrcode: reg(QRCode, { value: "https://blueprint-modular.com", size: 96 }),

  // — Graphiques (rendu différé : PlotlyChart garde déjà le cas data vide) —
  linechart: reg(LineChart, { data: SAMPLE_SERIES, width: 240, height: 120 }),
  barchart: reg(BarChart, { data: SAMPLE_BARS, width: 240, height: 120 }),
  areachart: reg(AreaChart, { data: SAMPLE_SERIES, width: 240, height: 120 }),
  scatterchart: reg(ScatterChart, { data: SAMPLE_SERIES, width: 240, height: 120 }),
  plotlychart: reg(PlotlyChart, { data: SAMPLE_PLOTLY, height: 320 }),

  // — Metric —
  metric: reg(Metric, { value: 142500, label: "Chiffre d'affaires", delta: 3200 }),
};

export function hasRenderer(slug: string): boolean {
  return slug in PLAYGROUND_RENDERERS;
}
