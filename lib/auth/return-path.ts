/** Next has already decoded searchParams. Keep return navigation within the current app. */
export function returnPath(value: string | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return null;
  try {
    const url = new URL(value, "https://modular.invalid");
    return url.origin === "https://modular.invalid" ? url.pathname + url.search + url.hash : null;
  } catch { return null; }
}
