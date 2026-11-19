import MailComposer from "nodemailer/lib/mail-composer";
import { z } from "zod";
import { STR } from "@/app/(app)/modules/templates/strings";

const title = z.string().trim().min(1).max(160);
const label = z.string().trim().min(1).max(300);
const common = { name: title, locale: z.enum(["fr", "en"]).default("fr") };
const date = label.refine(value => {
  const fr = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = fr ? [fr[3], fr[2], fr[1]].join("-") : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const parsed = new Date(iso + "T00:00:00Z");
  return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === iso;
});
const amount = z.string().trim().regex(/^-?\d{1,13}([.,]\d{1,2})?$/);
const input = z.discriminatedUnion("model", [
  z.object({ ...common, model: z.literal("rapport"), fields: z.object({ periode: label, responsable: label, ca_realise: amount }).strict() }).strict(),
  z.object({ ...common, model: z.literal("fiche"), fields: z.object({ projet: label, chef: label, date_limite: date }).strict() }).strict(),
  z.object({ ...common, model: z.literal("email"), fields: z.object({
    destinataire: z.string().trim().email().max(254), objet: label.regex(/^[^\r\n]+$/),
    corps: z.string().trim().min(1).max(16000),
  }).strict() }).strict(),
]);

function escapeText(s: string) {
  return s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "fr";
  const strings = STR[locale];
  return Response.json(strings.templateOptions.map(({ value: id, label }) => ({
    id, label, format: id === "email" ? "eml" : "html", fields: strings.simulatorFields[id],
  })));
}

export async function POST(request: Request) {
  const result = input.safeParse(await request.json().catch(() => null));
  if (!result.success) return Response.json({ error: "invalid_document", fields: result.error.issues.map(issue => issue.path.join(".")) }, { status: 400 });
  const doc = result.data;
  const strings = STR[doc.locale];
  let body: string | Uint8Array<ArrayBuffer>;
  if (doc.model === "email") {
    const draft = new MailComposer({ to: doc.fields.destinataire, subject: doc.fields.objet, text: doc.fields.corps,
      headers: { "X-Unsent": "1" }, disableUrlAccess: true, disableFileAccess: true });
    body = Uint8Array.from(await draft.compile().build());
  } else {
    const values: Record<string, string> = { ...doc.fields };
    if (doc.model === "rapport") values.ca_realise = new Intl.NumberFormat(doc.locale, {
      style: "currency", currency: "EUR",
    }).format(Number(doc.fields.ca_realise.replace(",", ".")));
    const rows = strings.simulatorFields[doc.model].map(field =>
      `<dt>${escapeText(field.label)}</dt><dd>${escapeText(values[field.key])}</dd>`).join("\n");
    const modelName = strings.templateOptions.find(o => o.value === doc.model)!.label;
    body = `<!doctype html><html lang="${doc.locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeText(doc.name)}</title>
<style>body{font:1rem/1.5 system-ui;max-width:44rem;margin:3rem auto;padding:0 1rem}dt{font-weight:600;margin-top:1rem}dd{margin:0;white-space:pre-wrap;overflow-wrap:anywhere}@media print{body{margin:0}}</style>
<main><p>${escapeText(modelName)}</p><h1>${escapeText(doc.name)}</h1><dl>${rows}</dl></main></html>`;
  }
  const ext = doc.model === "email" ? "eml" : "html";
  const base = doc.name.replace(/[^\p{L}\p{N} _-]+/gu, "-");
  return new Response(body, { headers: {
    "Content-Type": ext === "eml" ? "message/rfc822" : "text/html; charset=utf-8",
    "Content-Disposition": `attachment; filename="document.${ext}"; filename*=UTF-8''${encodeURIComponent(base)}.${ext}`,
    "Cache-Control": "no-store",
  } });
}
