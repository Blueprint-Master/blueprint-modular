import { NextResponse } from "next/server";
import { vllmClient } from "@/lib/ai/vllm-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await vllmClient.healthCheck();
  return NextResponse.json(result);
}
