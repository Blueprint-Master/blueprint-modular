import { z } from "zod";
import { access, error, revision, update, type Context } from "@/lib/newsletter/articles";

export const dynamic = "force-dynamic";
const command = z.object({ archived: z.boolean().optional(), revision }).strict();

export async function PATCH(request: Request, ctx: Context) {
  const article = await access(ctx);
  if (article instanceof Response) return article;
  const input = command.safeParse(await request.json().catch(() => null));
  if (!input.success) return error(400, "Commande d’archivage invalide");
  return update(article.id, article.authorId, input.data.revision ?? article.revision, { archived: input.data.archived ?? !article.archived });
}
