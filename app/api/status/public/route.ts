import { NextResponse } from "next/server";
import { getStatusPayload } from "@/lib/status/data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/status/public — données agrégées de la page /status, en JSON.
 * Public, pas d'auth, pas de données personnelles (uniquement l'état
 * d'endpoints publics). Utile pour un monitoring externe ou un widget.
 */
export async function GET() {
  try {
    const payload = await getStatusPayload();
    return NextResponse.json(payload);
  } catch (err) {
    console.error("[status/public] error:", err);
    return NextResponse.json(
      { status: "no_data", services: [], incidents: [], generatedAt: new Date().toISOString() },
      { status: 200 },
    );
  }
}
