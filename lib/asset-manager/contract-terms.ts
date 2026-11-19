const dayLength = 86_400_000;
type Terms = { endDate: Date | string; autoRenewal: boolean; noticeDays: number; alertDaysBefore: number };

export function contractAlert(terms: Terms, now = new Date()) {
  const end = Math.floor(new Date(terms.endDate).getTime() / dayLength);
  const today = Math.floor(now.getTime() / dayLength);
  const deadline = end - (terms.autoRenewal ? terms.noticeDays : 0);
  return today <= end && today >= deadline - terms.alertDaysBefore;
}

export function coveredIds(value: string | null): string[] {
  try {
    const data = JSON.parse(value ?? "[]");
    return Array.isArray(data) ? data.filter(id => typeof id === "string") : [];
  } catch { return []; }
}

export function contractNumber(value: string) {
  return Number(value.trim().replace(/[\u00a0\u202f ]/g, "").replace(",", "."));
}

export function contractDocumentHref(value: string | null) {
  if (!value || /[\\\u0000-\u001f]/.test(value)) return null;
  if (/^\/(?!\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
