import { changeLoan } from "@/lib/asset-manager/assignments";
import { NextResponse } from "next/server";
import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }> | { id: string };

async function resolveParams(params: Params): Promise<{ id: string }> {
  return typeof (params as Promise<{ id: string }>)?.then === "function"
    ? await (params as Promise<{ id: string }>)
    : (params as { id: string });
}

export async function POST(_request: Request, context: { params: Promise<Awaited<Params>> }) {
  const result = await getPersonalModuleSession();
  if (!result) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(result.user);
  if (forbidden) return forbidden;

  const { id } = await resolveParams(context.params);
  return changeLoan(id, { status: "returned" }, true);
}
