/** Data-only Earth composition. Angles are artistic light positions, not ephemerides. */
export interface EarthLayers {
  lighting: "day" | "night" | "coordinated";
  sunAzimuth: number;
  clouds: boolean;
  cloudCoverage: number;
  cloudOpacity: number;
  cloudSpeed: number;
  cloudEvolution: number;
  atmosphere: boolean;
  atmosphereIntensity: number;
  lights: boolean;
  lightsIntensity: number;
  auroras: boolean;
  auroraIntensity: number;
}
export const DEFAULT_EARTH_LAYERS: Readonly<EarthLayers> = Object.freeze({
  lighting: "coordinated", sunAzimuth: 0, clouds: true, cloudCoverage: .5,
  cloudOpacity: .86, cloudSpeed: 1, cloudEvolution: 1,
  atmosphere: true, atmosphereIntensity: 1, lights: true, lightsIntensity: 1,
  auroras: false, auroraIntensity: 1,
});
const bounds = {
  sunAzimuth: [-180, 180], cloudCoverage: [0, 1], cloudOpacity: [0, 1],
  cloudSpeed: [0, 3], cloudEvolution: [0, 3], atmosphereIntensity: [0, 2],
  lightsIntensity: [0, 3], auroraIntensity: [0, 2],
} as const;
/** Partial public props are completed; invalid/unknown transport fields are rejected. */
export function parseEarthLayers(raw: unknown): EarthLayers | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const value = raw as Record<string, unknown>;
  for (const [key, item] of Object.entries(value)) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_EARTH_LAYERS, key)) return;
    if (key === "lighting") { if (!["day", "night", "coordinated"].includes(item as string)) return; }
    else if (key in bounds) {
      const [min, max] = bounds[key as keyof typeof bounds];
      if (typeof item !== "number" || !Number.isFinite(item) || item < min || item > max) return;
    } else if (typeof item !== "boolean") return;
  }
  return { ...DEFAULT_EARTH_LAYERS, ...value } as EarthLayers;
}
export function earthLayers(value?: Partial<EarthLayers>): EarthLayers {
  return parseEarthLayers(value ?? {}) ?? { ...DEFAULT_EARTH_LAYERS };
}
export const EARTH_PRESETS = {
  clear: { ...DEFAULT_EARTH_LAYERS, lighting: "day", clouds: false },
  light: { ...DEFAULT_EARTH_LAYERS, lighting: "day", cloudCoverage: .25, cloudOpacity: .65 },
  living: { ...DEFAULT_EARTH_LAYERS },
  night: { ...DEFAULT_EARTH_LAYERS, lighting: "night", cloudCoverage: .25, cloudOpacity: .55 },
} satisfies Record<string, EarthLayers>;
