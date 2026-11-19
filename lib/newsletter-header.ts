/** Resolve local newsletter artwork from the app root on every screen. */
export function newsletterHeaderUrl(value: string): string | null {
  const text = value.trim();
  if (!text || text.startsWith("//") || /[\\\u0000-\u001f]/.test(text)) return null;
  try {
    const base = "https://newsletter.invalid";
    const url = new URL(text, base);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return null;
    if (!/^[a-z][a-z0-9+.-]*:/i.test(text)) return url.pathname + url.search + url.hash;
    return url.href;
  } catch {
    return null;
  }
}
