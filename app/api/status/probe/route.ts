import { NextResponse } from "next/server";
import { runProbe } from "@/lib/status/probe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/status/probe — exécute la sonde de disponibilité et persiste un
 * point de mesure par service. Déclenché par cron sur bpm-prod (voir
 * `deploy/status-probe.crontab`), pas par le public.
 *
 * Protégé par un jeton partagé (`STATUS_PROBE_TOKEN`, en-tête
 * `x-status-probe-token`) : écrire des points de mesure ne doit pas être
 * ouvert à tous. Fail-closed : sans jeton configuré, l'endpoint refuse —
 * aucune mesure n'est écrite tant que l'ops n'a pas armé le cron + le jeton.
 */
export async function POST(req: Request) {
  const expected = process.env.STATUS_PROBE_TOKEN?.trim();
  if (!expected) {
    return NextResponse.json(
      { error: "probe disabled: STATUS_PROBE_TOKEN not configured" },
      { status: 503 },
    );
  }
  const provided = req.headers.get("x-status-probe-token")?.trim();
  if (!provided || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const results = await runProbe();
    return NextResponse.json({ ok: true, results, checkedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[status/probe] error:", err);
    return NextResponse.json({ ok: false, error: "probe failed" }, { status: 500 });
  }
}
