import { NextResponse } from "next/server";
import { z } from "zod";
import { getPersonalModuleSession } from "@/lib/auth";
import { advanceWorkflow } from "@/lib/workflow/entity";

export const dynamic = "force-dynamic";
const command = z.object({
  revision: z.number().int().nonnegative(),
  to: z.enum(["brouillon", "validé", "archivé"]),
}).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const input = command.safeParse(await request.json().catch(() => null));
  if (!id.trim() || id.length > 256 || !input.success) return NextResponse.json({ error: "Invalid transition" }, { status: 400 });
  const result = await advanceWorkflow(session.user.id, id, input.data.revision, input.data.to);
  return result ? NextResponse.json(result) : NextResponse.json({ error: "Workflow conflict" }, { status: 409 });
}
