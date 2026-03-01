import { NextResponse } from "next/server";

/**
 * POST /api/export/preview — Créer une preview temporaire (Phase 2).
 * Retourne 501 jusqu'à implémentation.
 */
export async function POST() {
  return NextResponse.json(
    { status: "not_implemented", phase: 2 },
    { status: 501 }
  );
}
