import { NextResponse } from "next/server";
import { getProvider } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = getProvider();
  const available = await provider.isAvailable();
  return NextResponse.json({
    available,
    provider: provider.getProviderName(),
    model: provider.getModelName(),
    timestamp: new Date().toISOString(),
  });
}
