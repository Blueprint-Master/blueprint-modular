import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "blueprint-modular",
    timestamp: new Date().toISOString(),
  });
}
