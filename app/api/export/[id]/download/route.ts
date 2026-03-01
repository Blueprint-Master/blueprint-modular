import { NextResponse } from "next/server";

/**
 * GET /api/export/[id]/download — Télécharger le package (Phase 2).
 * Retourne 501 jusqu'à implémentation.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return NextResponse.json(
    { status: "not_implemented", phase: 2, appId: id },
    { status: 501 }
  );
}
