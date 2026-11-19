import { getPersonalModuleSession } from "@/lib/auth";
import { requireApproveRole } from "@/lib/asset-manager/authz";
import { ballotInput, voteChange } from "@/lib/asset-manager/change-workflow";

export async function recordVote(request: Request, params: Promise<{ id: string }>, approve: boolean) {
  const session = await getPersonalModuleSession();
  if (!session) return Response.json({ error: "Non autorisé" }, { status: 401 });
  const forbidden = requireApproveRole(session.user);
  if (forbidden) return forbidden;
  const body = await request.text();
  let fields: unknown = {};
  if (body) {
    try { fields = JSON.parse(body); } catch { return Response.json({ error: "Vote invalide." }, { status: 400 }); }
  }
  const parsed = ballotInput.safeParse(fields);
  if (!parsed.success) return Response.json({ error: "Vote invalide." }, { status: 400 });
  return voteChange((await params).id, session.user.id, approve, parsed.data);
}
