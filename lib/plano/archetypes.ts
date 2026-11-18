/**
 * Archétypes de FORME des plans cyanotypes. Chaque composant reçoit le dessin
 * technique de sa forme (métrique, tableau, courbe, jauge, suivi d'étapes…),
 * choisi de façon DÉTERMINISTE : d'abord la table explicite par slug, puis des
 * motifs sur le nom (composant futur), enfin le plan de sa famille. Module PUR,
 * tenu par `tests/plano-archetypes.test.ts`.
 */

export const ARCHETYPES = [
  "metrique",
  "tableau",
  "courbe",
  "barres",
  "donut",
  "radar",
  "nuage",
  "jauge",
  "etapes",
  "timeline",
  "badge",
  "bouton",
  "champ",
  "selecteur",
  "case",
  "curseur",
  "calendrier",
  "onglets",
  "carte",
  "liste",
  "arbre",
  "modale",
  "alerte",
  "progression",
  "avatar",
  "geo",
  "orbite",
  "titre",
  "media",
  "formulaire",
  "code",
  "conversation",
  "codebarre",
  "tableau-bord",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

/** Table explicite : la forme de chaque composant du registre, relue à la main. */
const BY_SLUG: Record<Archetype, readonly string[]> = {
  metrique: ["metric", "metricrow", "labelvalue", "highlightbox"],
  tableau: ["table", "pivottable", "dataexplorer", "crud"],
  courbe: ["linechart", "areachart", "livechart", "predictivechart", "sparkline", "flightprofile"],
  barres: ["barchart", "waterfall", "funnelchart"],
  donut: ["progressring", "treemap"],
  radar: ["radarchart"],
  nuage: ["scatterchart", "heatmap", "altairchart", "plotlychart"],
  jauge: ["livegauge", "flightinstruments"],
  etapes: ["statustracker", "stepper", "approvalflow", "wizardform"],
  timeline: ["timeline", "activityfeed", "changelog"],
  badge: ["badge", "chip", "nfcbadge", "statusbox"],
  bouton: ["button", "fab", "exportbutton"],
  champ: ["input", "textarea", "numberinput", "inlineedit", "addressinput", "locationfield", "promptinput", "aiquerybar", "richtexteditor"],
  selecteur: ["selectbox", "autocomplete", "modelselector", "colorpicker", "commandpalette", "contextmenu"],
  case: ["checkbox", "radiogroup", "toggle", "theme"],
  curseur: ["slider", "rating"],
  calendrier: ["dateinput", "daterangepicker", "timeinput", "scheduler", "gantt"],
  onglets: ["tabs", "breadcrumb", "breadcrumbs", "pagination", "topnav", "tour"],
  carte: ["card", "panel", "container", "suggestioncard", "comparison", "expander", "accordion", "emptystate", "empty"],
  liste: ["masterdetail", "groupedlist", "notificationcenter", "drilldown", "airportboard"],
  arbre: ["treeview", "orgchart", "decisiontree", "relationgraph", "flowdiagram", "statemachine"],
  modale: ["modal", "drawer", "confirmmodal", "popover", "tooltip", "splitview"],
  alerte: ["message", "anomalyalert", "alarmpanel", "toast", "offlineindicator"],
  progression: ["progress", "loadingbar", "spinner", "spinnerdot", "skeleton"],
  avatar: ["avatar"],
  geo: ["map", "mapview", "cartographicmap", "gps", "geofence", "flightmap", "maplayercontrol", "maplegend", "routeplanner", "aircraftmarker", "seatmap"],
  orbite: ["skymap", "celestialbody", "celestialscene", "galaxyview", "moonphase", "orbitalsystem", "solarsystem"],
  titre: ["title", "title1", "title2", "title3", "title4", "titlebpm", "text", "caption", "markdown", "streamingtext", "html"],
  media: ["image", "audio", "video", "pdfviewer", "filepreview", "fileuploader", "signaturepad"],
  formulaire: ["filterpanel", "emailcomposer", "invoicetemplate", "reportpage", "printlayout", "page", "pagelayout"],
  code: ["codeblock", "codeeditor", "jsoneditor", "jsonviewer", "diffviewer"],
  conversation: ["chat", "chatinterface", "assistantpanel", "commentthread"],
  codebarre: ["barcode", "qrcode"],
  "tableau-bord": ["sensorgrid", "machinestatus", "plcconnector", "grid", "column", "divider", "scrollcontainer", "transition", "free"],
};

const SLUG_TO_ARCHETYPE: ReadonlyMap<string, Archetype> = new Map(
  (Object.entries(BY_SLUG) as [Archetype, readonly string[]][]).flatMap(([a, slugs]) => slugs.map((s) => [s, a] as const)),
);

/** Motifs sur le nom, pour un composant que la table ne connaît pas encore. */
const PATTERNS: [RegExp, Archetype][] = [
  [/gauge|jauge/, "jauge"],
  [/metric|kpi/, "metrique"],
  [/table|grid/, "tableau"],
  [/line|area|spark|trend/, "courbe"],
  [/bar|histogram|funnel/, "barres"],
  [/pie|donut|ring/, "donut"],
  [/step|tracker|flow|wizard/, "etapes"],
  [/timeline|feed|log/, "timeline"],
  [/badge|chip|tag/, "badge"],
  [/button|fab/, "bouton"],
  [/select|picker|palette|menu/, "selecteur"],
  [/input|field|edit|query/, "champ"],
  [/check|radio|toggle|switch/, "case"],
  [/slider|range|rating/, "curseur"],
  [/date|time|calendar|schedul|gantt/, "calendrier"],
  [/tab|nav|crumb|pagination/, "onglets"],
  [/card|panel/, "carte"],
  [/list/, "liste"],
  [/tree|graph|chart/, "arbre"],
  [/modal|drawer|dialog|popover|tooltip/, "modale"],
  [/alert|alarm|toast|message/, "alerte"],
  [/progress|loading|spinner|skeleton/, "progression"],
  [/avatar/, "avatar"],
  [/map|geo|route/, "geo"],
  [/title|text|caption|markdown/, "titre"],
  [/image|video|audio|pdf|file/, "media"],
  [/form/, "formulaire"],
  [/code|json|diff/, "code"],
  [/chat|comment|assistant/, "conversation"],
];

export function archetypeOf(slug: string): Archetype | null {
  const s = slug.toLowerCase();
  const exact = SLUG_TO_ARCHETYPE.get(s);
  if (exact) return exact;
  for (const [re, a] of PATTERNS) if (re.test(s)) return a;
  return null;
}

/** Slugs de la table explicite (pour le test de couverture). */
export function explicitSlugs(): string[] {
  return [...SLUG_TO_ARCHETYPE.keys()];
}

/**
 * Props clés d'une pièce, lues dans la chaîne `props` du registre MCP
 * (`  label*: string  — …`) : les requises d'abord, puis les optionnelles,
 * trois au plus. Rien de connu ⇒ tableau vide (la tuile montre sa famille).
 */
export function keyPropsFrom(props: string | undefined | null, max = 3): string[] {
  if (!props) return [];
  const required: string[] = [];
  const optional: string[] = [];
  for (const line of props.split("\n")) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)(\*|\?)?\s*:/.exec(line);
    if (!m) continue;
    const name = m[1];
    if (name === "className" || name === "style" || name === "children" || name === "id" || /^on[A-Z]/.test(name)) continue;
    (m[2] === "*" ? required : optional).push(name);
  }
  return [...required, ...optional].slice(0, max);
}
