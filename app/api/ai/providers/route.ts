import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PROVIDERS = [
  { provider_name: "vllm", label: "Ollama", color: "#10A37F", is_configured: true, is_active: true },
  { provider_name: "qwen", label: "Qwen", color: "#6037DB", is_configured: true, is_active: true },
  { provider_name: "mistral", label: "Mistral", color: "#FA4C0A", is_configured: true, is_active: true },
  { provider_name: "claude", label: "Claude", color: "#F97316", is_configured: !!process.env.ANTHROPIC_API_KEY, is_active: true },
  { provider_name: "openai", label: "GPT", color: "#10A37F", is_configured: false, is_active: true },
  { provider_name: "gemini", label: "Gemini", color: "#4285F4", is_configured: false, is_active: true },
  { provider_name: "grok", label: "Grok", color: "#626262", is_configured: false, is_active: true },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ providers: PROVIDERS, default_provider: "vllm" });
}
