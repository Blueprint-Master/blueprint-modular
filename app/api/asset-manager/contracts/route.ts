import { getPersonalModuleSession, hasWriteRole } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { getDomainConfig } from "@/lib/asset-manager/get-domain-config";
import { contractCreate, createContract } from "@/lib/asset-manager/contracts";
import { contractAlert } from "@/lib/asset-manager/contract-terms";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const query = new URL(request.url).searchParams;
  const domainId = query.get("domainId");
  if (!getDomainConfig(domainId)) return Response.json({ error: "Domaine invalide." }, { status: 400 });
  const contracts = await prisma.assetContract.findMany({
    where: { domainId, type: query.get("type") || undefined },
    orderBy: [{ endDate: "asc" }, { updatedAt: "desc" }],
  });
  const now = new Date();
  const list = query.get("alert") === "1" ? contracts.filter(row => contractAlert(row, now)) : contracts;
  return Response.json(list, { headers: { "X-Can-Edit": String(hasWriteRole(session.user)) } });
}

export async function POST(request: Request) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const result = contractCreate.safeParse(await request.json().catch(() => null));
  if (!result.success) return Response.json({ error: result.error.issues[0].message }, { status: 400 });
  return createContract(session.user.id, result.data);
}
