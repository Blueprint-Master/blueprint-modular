/** Versioned, data-only objects. No remote assets, arbitrary code or user data. */
export const OBJECT_CATALOG_VERSION = "1.0.0" as const;
export type ObjectFamily = "space" | "buildings" | "mobility" | "logistics";
export type ObjectShape = "planet" | "star" | "moon" | "house" | "building" | "warehouse" | "factory" | "car" | "van" | "truck" | "pallet" | "parcel" | "container";
export interface ModularObjectDefinition {
  readonly id: string;
  readonly version: typeof OBJECT_CATALOG_VERSION;
  readonly name: Readonly<{ fr: string; en: string }>;
  readonly family: ObjectFamily;
  readonly shape: ObjectShape;
  readonly color: string;
  readonly rings: boolean;
  readonly license: "Apache-2.0";
  readonly fidelity: "stylized-illustration";
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

/** Exact resolution only. An unknown ID/version must never pick a lookalike. */
export function resolveModularObject(id: string, version: string = OBJECT_CATALOG_VERSION): ModularObjectDefinition | undefined {
  return MODULAR_OBJECTS.find(item => item.id === id && item.version === version);
}
export function searchModularObjects(query = "", family?: ObjectFamily): readonly ModularObjectDefinition[] {
  const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  return MODULAR_OBJECTS.filter(item => (!family || item.family === family) &&
    words.every(word => normalize(`${item.id} ${item.name.fr} ${item.name.en}`).includes(word)));
}
