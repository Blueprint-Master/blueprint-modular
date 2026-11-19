import { z } from "zod";

const cursorData = z.tuple([z.string().datetime(), z.string().min(1)]);

export function readHistoryCursor(value: string) {
  try {
    const [date, id] = cursorData.parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    return { date: new Date(date), id };
  } catch {
    return null;
  }
}

export function historyPage<T extends { id: string }>(rows: T[], limit: number, dateOf: (row: T) => Date) {
  const page = rows.slice(0, limit);
  const last = page.at(-1);
  const headers = new Headers();
  if (rows.length > limit && last) {
    headers.set("X-Next-Cursor", Buffer.from(JSON.stringify([dateOf(last), last.id])).toString("base64url"));
  }
  return Response.json(page, { headers });
}
