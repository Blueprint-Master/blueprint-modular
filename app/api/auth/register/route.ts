import { z } from "zod";
import { isEmailAuthorized } from "@/lib/auth";
import { beginEnrollment, completeEnrollment, registrationEnabled } from "@/lib/auth/enrollment";

const email = z.string().trim().email().max(254).transform(value => value.toLowerCase());
const purpose = z.enum(["register", "recover"]).default("register");
const requestCode = z.object({ email, purpose, locale: z.enum(["fr", "en"]).optional() }).strict();
const confirmation = z.object({
  email, purpose, id: z.string().uuid(), code: z.string().regex(/^\d{8}$/),
  name: z.string().trim().max(100).optional(), password: z.string().min(12).max(256),
}).strict();

export async function POST(request: Request) {
  if (!registrationEnabled()) return Response.json({ error: "unavailable" }, { status: 503 });
  const body = await request.json().catch(() => null);
  const first = requestCode.safeParse(body);
  if (first.success) {
    if (!isEmailAuthorized(first.data.email)) return Response.json({ error: "restricted" }, { status: 403 });
    try {
      const id = await beginEnrollment(first.data.email, first.data.locale === "en", undefined, first.data.purpose);
      return Response.json({ id }, { status: 202 });
    } catch { return Response.json({ error: "unavailable" }, { status: 503 }); }
  }
  const input = confirmation.safeParse(body);
  if (!input.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { email: address, id, code, name, password } = input.data;
  if (!isEmailAuthorized(address)) return Response.json({ error: "restricted" }, { status: 403 });
  const ok = await completeEnrollment(address, id, code, name, password, input.data.purpose);
  return ok ? new Response(null, { status: 201 }) : Response.json({ error: "invalid_code" }, { status: 400 });
}
