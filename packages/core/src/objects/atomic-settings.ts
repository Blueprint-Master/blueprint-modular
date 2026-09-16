export interface AtomicLayerSettings { representation: "density" | "sphere"; density: boolean; nucleus: boolean; opacity: number; }
export const DEFAULT_ATOMIC_SETTINGS: Readonly<AtomicLayerSettings> = Object.freeze({ representation: "density", density: true, nucleus: true, opacity: 1 });
export function parseAtomicSettings(raw: unknown): AtomicLayerSettings | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return;
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).some(k => !["representation", "density", "nucleus", "opacity"].includes(k)) || !["density", "sphere"].includes(v.representation as string) || typeof v.density !== "boolean" || typeof v.nucleus !== "boolean" || typeof v.opacity !== "number" || !Number.isFinite(v.opacity) || v.opacity < 0 || v.opacity > 1) return;
  return { representation: v.representation as AtomicLayerSettings["representation"], density: v.density, nucleus: v.nucleus, opacity: v.opacity };
}
