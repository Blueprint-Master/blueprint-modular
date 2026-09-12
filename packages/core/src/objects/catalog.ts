import {MOON_PARENTS,planetProvenance} from "./universe";
import {WEATHER_IDS,WEATHER_NAMES,WEATHER_VERSION} from "./weather";
import {FORM_IDS,FORM_NAMES,FORMS_VERSION} from "./forms";
import {WATER_IDS,WATER_NAMES,WATER_VERSION} from "./water";
/** Versioned, data-only objects. No remote assets, arbitrary code or user data. */
export const OBJECT_CATALOG_VERSION = "1.0.0" as const;
export type ObjectFamily = "space" | "weather" | "forms" | "water" | "buildings" | "mobility" | "logistics";
export type ObjectShape = "planet" | "star" | "moon" | "atmosphere" | "sculpture" | "water" | "house" | "building" | "warehouse" | "factory" | "car" | "van" | "truck" | "pallet" | "parcel" | "container";
export interface ModularObjectDefinition {
  readonly id: string;
  readonly version: string;
  readonly name: Readonly<{ fr: string; en: string }>;
  readonly family: ObjectFamily;
  readonly shape: ObjectShape;
  readonly color: string;
  readonly rings: boolean;
  readonly parent?: string;
  readonly license: "Apache-2.0" | "CC-BY-4.0" | "LicenseRef-NASA-Media" | "CC-BY-3.0" | "CC-BY-SA-4.0";
  readonly fidelity: "stylized-illustration" | "textured-sphere" | "living-atmosphere" | "deforming-surface";
}
function object(id: string, fr: string, en: string, family: ObjectFamily, shape: ObjectShape, color: string, rings = false): ModularObjectDefinition {
  return Object.freeze({ id, version: OBJECT_CATALOG_VERSION, name: Object.freeze({ fr, en }), family, shape, color, rings,
    license: "Apache-2.0", fidelity: "stylized-illustration" });
}
export const MODULAR_OBJECTS: readonly ModularObjectDefinition[] = Object.freeze([
  object("mercury", "Mercure", "Mercury", "space", "planet", "#a99e91"),
  object("venus", "Vénus", "Venus", "space", "planet", "#dcac69"),
  object("earth", "Terre", "Earth", "space", "planet", "#438fc8"),
  object("mars", "Mars", "Mars", "space", "planet", "#c76b48"),
  object("jupiter", "Jupiter", "Jupiter", "space", "planet", "#d1a580"),
  object("saturn", "Saturne", "Saturn", "space", "planet", "#d5bc84", true),
  object("uranus", "Uranus", "Uranus", "space", "planet", "#79c4cc"),
  object("neptune", "Neptune", "Neptune", "space", "planet", "#5269d3"),
  object("sun", "Soleil", "Sun", "space", "star", "#f4bd55"),
  object("moon", "Lune", "Moon", "space", "moon", "#b8c3d2"),
  object("house", "Maison", "House", "buildings", "house", "#d6926b"),
  object("building", "Immeuble", "Building", "buildings", "building", "#809fae"),
  object("warehouse", "Entrepôt", "Warehouse", "buildings", "warehouse", "#87aa9b"),
  object("factory", "Usine", "Factory", "buildings", "factory", "#a79bba"),
  object("car", "Voiture", "Car", "mobility", "car", "#6cabb9"),
  object("van", "Utilitaire", "Van", "mobility", "van", "#c2b69d"),
  object("truck", "Camion", "Truck", "mobility", "truck", "#b98578"),
  object("pallet", "Palette", "Pallet", "logistics", "pallet", "#b69a70"),
  object("parcel", "Colis", "Parcel", "logistics", "parcel", "#cdaa78"),
  object("container", "Conteneur", "Container", "logistics", "container", "#60978f"),
]);

/** The immutable v1 catalogue stays intact. New moons are available only at v2. */
export const MOON_OBJECTS:readonly ModularObjectDefinition[]=Object.freeze([
  ["io","Io","Io"],["europa","Europe","Europa"],["ganymede","Ganymède","Ganymede"],["callisto","Callisto","Callisto"],
  ["titan","Titan","Titan"],["enceladus","Encelade","Enceladus"],["titania","Titania","Titania"],["triton","Triton","Triton"],
].map(([id,fr,en])=>Object.freeze({...object(id,fr,en,"space","moon","#bbc1c9"),version:"2.0.0",parent:MOON_PARENTS[id as keyof typeof MOON_PARENTS],license:planetProvenance(id).license as ModularObjectDefinition["license"],fidelity:"textured-sphere" as const})));
export const WEATHER_OBJECTS:readonly ModularObjectDefinition[]=Object.freeze(WEATHER_IDS.map(id=>Object.freeze({
  ...object(id,WEATHER_NAMES[id].fr,WEATHER_NAMES[id].en,"weather","atmosphere","#91adc9"),
  version:WEATHER_VERSION,fidelity:"living-atmosphere" as const,
})));
export const FORM_OBJECTS:readonly ModularObjectDefinition[]=Object.freeze(FORM_IDS.map(id=>Object.freeze({
  ...object(id,FORM_NAMES[id].fr,FORM_NAMES[id].en,"forms","sculpture","#549fa2"),
  version:FORMS_VERSION,fidelity:"deforming-surface" as const,
})));
export const WATER_OBJECTS:readonly ModularObjectDefinition[]=Object.freeze(WATER_IDS.map(id=>Object.freeze({
  ...object(id,WATER_NAMES[id].fr,WATER_NAMES[id].en,"water","water","#2f99bd"),
  version:WATER_VERSION,fidelity:"deforming-surface" as const,
})));
export const DISCOVERABLE_OBJECTS=Object.freeze([...MODULAR_OBJECTS,...MOON_OBJECTS,...WEATHER_OBJECTS,...FORM_OBJECTS,...WATER_OBJECTS]);

/** Exact resolution only. An unknown ID/version must never pick a lookalike. */
export const MODULAR_OBJECT_VERSIONS:readonly ModularObjectDefinition[]=Object.freeze([
  ...MODULAR_OBJECTS,...MOON_OBJECTS,...WEATHER_OBJECTS,...FORM_OBJECTS,...WATER_OBJECTS,
  ...MODULAR_OBJECTS.filter(item=>item.family==="space").map(item=>Object.freeze({...item,version:"2.0.0",license:"CC-BY-4.0" as const,fidelity:"textured-sphere" as const})),
]);
export function resolveModularObject(id: string, version: string = OBJECT_CATALOG_VERSION): ModularObjectDefinition | undefined {
  return MODULAR_OBJECT_VERSIONS.find(item => item.id === id && item.version === version);
}
export function searchModularObjects(query = "", family?: ObjectFamily): readonly ModularObjectDefinition[] {
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return DISCOVERABLE_OBJECTS.filter(item => (!family || item.family === family) &&
    words.every(word => normalize(`${item.id} ${item.name.fr} ${item.name.en} ${item.parent??""}`).includes(word)));
}
