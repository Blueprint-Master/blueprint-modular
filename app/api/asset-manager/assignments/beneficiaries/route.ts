import { getPersonalModuleSession } from "@/lib/auth";
import { requireWriteRole } from "@/lib/asset-manager/authz";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireWriteRole(session.user);
  if (forbidden) return forbidden;
  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: [{ name: "asc" }, { id: "asc" }] });
  return Response.json(users.map(user => ({ id: user.id, label: user.name && user.email ? `${user.name} (${user.email})` : user.name || user.email || user.id })));
}
