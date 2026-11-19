import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { readWorkflow } from "@/lib/workflow/entity";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getPersonalModuleSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (!id.trim() || id.length > 256) return NextResponse.json({ error: "Invalid entity id" }, { status: 400 });
  return NextResponse.json(await readWorkflow(session.user.id, id));
}
