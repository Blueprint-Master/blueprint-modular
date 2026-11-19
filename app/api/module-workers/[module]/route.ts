import { execFile } from "node:child_process";
import { isAbsolute } from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionOrTestUser, hasWriteRole } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const add = z.object({
  action: z.literal("add"), requestId: z.string().uuid(),
  file: z.string().regex(/^[a-z0-9][a-z0-9_-]{0,79}\.(csv|pdf)$/),
  frequency: z.enum(["daily", "weekly", "monthly"]), hour: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  zone: z.string().min(1).max(80), recipients: z.array(z.string().email().max(254)).min(1).max(100),
}).strict();
const control = z.object({ action: z.enum(["pause", "resume"]), id: z.string().min(1).max(80) }).strict();
const send = z.object({ action: z.literal("send"), id: z.string().regex(/^[a-f0-9]{32}$/), requestId: z.string().uuid() }).strict();
type Context = { params: Promise<{ module: string }> };
const error = (status: number, code: string) => NextResponse.json({ error: code }, { status });

async function handle(request: Request, context: Context) {
  const { module } = await context.params;
  if (module !== "webhooks" && module !== "export-planifie") return error(404, "unknown");
  const session = await getSessionOrTestUser({ allowTestUser: false });
  if (!session) return error(401, "login");
  if (!hasWriteRole(session.user)) return error(403, "forbidden");
  const db = module === "webhooks" ? process.env.BPM_WEBHOOKS_DB : process.env.BPM_EXPORTS_DB;
  if (!db || !isAbsolute(db)) return error(503, "unconfigured");

  let input: object = { action: "snapshot" };
  if (request.method === "POST") {
    // Cross-origin browser forms cannot supply this JSON-only request header.
    if (request.headers.get("content-type")?.split(";")[0] !== "application/json" ||
        request.headers.get("sec-fetch-site") === "cross-site") return error(415, "invalid");
    const payload = await request.json().catch(() => null);
    const parsed = (module === "webhooks" ? control : z.union([add, control, send])).safeParse(payload);
    if (!parsed.success) return error(400, "invalid");
    input = parsed.data;
  }
  return new Promise<NextResponse>((resolve) => {
    const child = execFile("python3", ["-m", "bpm.worker_console", module, db], {
      timeout: 10000, maxBuffer: 4 * 1024 * 1024, encoding: "utf8",
      env: { NODE_ENV: process.env.NODE_ENV, PATH: process.env.PATH, LANG: "C.UTF-8", BPM_EXPORT_REPORTS: process.env.BPM_EXPORT_REPORTS },
    }, (failure, output) => {
      if (failure) return resolve(failure.code === 2 ? error(400, "invalid") : error(503, "unavailable"));
      try {
        resolve(NextResponse.json(JSON.parse(output), { headers: { "Cache-Control": "private, no-store" } }));
      } catch {
        resolve(error(503, "unavailable"));
      }
    });
    child.stdin?.on("error", () => { /* execFile reports spawn and exit failures. */ });
    child.stdin?.end(JSON.stringify(input));
  });
}

export { handle as GET, handle as POST };
