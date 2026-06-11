import { NextResponse } from "next/server";
import { CONNECTOR_NAME, CONNECTOR_VERSION } from "@/lib/mcp/meta";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: CONNECTOR_NAME,
    version: CONNECTOR_VERSION,
    timestamp: new Date().toISOString(),
  });
}
