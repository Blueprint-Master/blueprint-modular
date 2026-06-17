/**
 * Sonde de disponibilité publique pour la page /status.
 *
 * Mesure la VRAIE disponibilité côté public (DNS + nginx + SSL + app), pas un
 * `/health` interne complaisant : on appelle les URLs publiques réelles.
 *   - Vitrine : GET https://blueprint-modular.com (200-399 = up).
 *   - MCP     : POST https://mcp.blueprint-modular.com/api/mcp avec un JSON-RPC
 *               `tools/list`. 200 (JSON ou SSE) = up. JAMAIS de GET (le GET
 *               renvoie 405 = sain mais non représentatif ; le HEAD se bloque).
 *
 * ANGLE MORT ASSUMÉ : la sonde s'exécute sur bpm-prod (cron → route POST). Si
 * l'app Next.js elle-même est à terre, aucune mesure n'est écrite — la journée
 * apparaît alors en `no_data`, pas en `outage`. La sonde reste néanmoins fidèle
 * pour toute panne en aval des cibles publiques (DNS, certificat, nginx, build
 * cassé d'un service distinct), contrairement au modèle Maker qui dérivait
 * l'uptime de l'activité applicative.
 */
import { prisma } from "@/lib/prisma";
import type { ServiceKey, StatusLevel } from "./types";

const PROBE_TIMEOUT_MS = 5000;

const VITRINE_URL = process.env.STATUS_PROBE_VITRINE_URL ?? "https://blueprint-modular.com";
const MCP_URL =
  process.env.STATUS_PROBE_MCP_URL ?? "https://mcp.blueprint-modular.com/api/mcp";

export interface ProbeResult {
  service: ServiceKey;
  ok: boolean;
  status: StatusLevel;
  httpCode: number | null;
  latencyMs: number | null;
  detail: string | null;
}

function withTimeout(ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cancel: () => clearTimeout(timer) };
}

/** Sonde la vitrine publique : un GET dont le statut < 400 vaut « up ». */
export async function probeVitrine(): Promise<ProbeResult> {
  const start = Date.now();
  const { signal, cancel } = withTimeout(PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(VITRINE_URL, {
      method: "GET",
      signal,
      redirect: "follow",
      cache: "no-store",
      headers: { "user-agent": "blueprint-modular-status-probe" },
    });
    const ok = res.status >= 200 && res.status < 400;
    return {
      service: "vitrine",
      ok,
      status: ok ? "operational" : "outage",
      httpCode: res.status,
      latencyMs: Date.now() - start,
      detail: ok ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      service: "vitrine",
      ok: false,
      status: "outage",
      httpCode: null,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  } finally {
    cancel();
  }
}

/**
 * Sonde l'endpoint MCP : POST JSON-RPC `tools/list`. Un 200 (JSON ou SSE) vaut
 * « up ». On n'inspecte pas le corps : le but est de prouver que l'endpoint est
 * joignable et répond, pas d'ouvrir une session MCP complète.
 */
export async function probeMcp(): Promise<ProbeResult> {
  const start = Date.now();
  const { signal, cancel } = withTimeout(PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(MCP_URL, {
      method: "POST",
      signal,
      cache: "no-store",
      headers: {
        "content-type": "application/json",
        // mcp-handler exige un Accept couvrant JSON et SSE.
        accept: "application/json, text/event-stream",
        "user-agent": "blueprint-modular-status-probe",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list", params: {} }),
    });
    const contentType = res.headers.get("content-type") ?? "";
    const isSse = contentType.includes("text/event-stream");
    const ok = res.status === 200 || isSse;
    return {
      service: "mcp",
      ok,
      status: ok ? "operational" : "outage",
      httpCode: res.status,
      latencyMs: Date.now() - start,
      detail: ok ? null : `HTTP ${res.status}`,
    };
  } catch (err) {
    return {
      service: "mcp",
      ok: false,
      status: "outage",
      httpCode: null,
      latencyMs: Date.now() - start,
      detail: err instanceof Error ? err.message : String(err),
    };
  } finally {
    cancel();
  }
}

/**
 * Exécute toutes les sondes et persiste un point de mesure par service.
 * Renvoie les résultats bruts (utile pour la réponse du cron / debug).
 */
export async function runProbe(): Promise<ProbeResult[]> {
  const results = await Promise.all([probeVitrine(), probeMcp()]);
  await prisma.statusCheck.createMany({
    data: results.map((r) => ({
      service: r.service,
      ok: r.ok,
      status: r.status,
      httpCode: r.httpCode ?? undefined,
      latencyMs: r.latencyMs ?? undefined,
      detail: r.detail ?? undefined,
    })),
  });
  return results;
}
