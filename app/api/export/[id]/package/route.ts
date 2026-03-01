import { NextResponse } from "next/server";

/**
 * POST /api/export/[id]/package — Déclencher le packaging (Phase 2).
 * Retourne 501 jusqu'à implémentation.
 */
export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  return NextResponse.json(
    { status: "not_implemented", phase: 2, appId: id },
    { status: 501 }
  );
}
