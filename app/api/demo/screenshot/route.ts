import { NextResponse } from "next/server";

// TODO Phase 3 : installer Puppeteer et implémenter le screenshot de la démo /demo/production

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "not_implemented",
      message: "Puppeteer non installé",
    },
    { status: 501 }
  );
}
