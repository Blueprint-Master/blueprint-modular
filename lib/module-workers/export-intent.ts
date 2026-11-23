/** Keep the receipt key across reloads of this tab, without storing report or recipient details. */
export async function exportIntent(scope: string | undefined, command: Record<string, unknown>) {
  if (!scope || !/^[a-f0-9]{64}$/.test(scope)) throw new Error("scope");
  const bytes = new TextEncoder().encode(JSON.stringify([scope, command]));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const key = "bpm:export-intent:" + Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
  let requestId: string;
  try {
    const stored = sessionStorage.getItem(key);
    if (stored !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)) {
      throw new Error("invalid receipt");
    }
    requestId = stored ?? crypto.randomUUID();
    if (stored === null) sessionStorage.setItem(key, requestId);
  } catch {
    throw new Error("intent-storage");
  }

  return {
    requestId,
    acknowledge(id: unknown) {
      const valid = command.action === "send" ? id === requestId : typeof id === "string" && /^[a-f0-9]{32}$/.test(id);
      if (!valid) throw new Error("receipt");
      try {
        if (sessionStorage.getItem(key) === requestId) sessionStorage.removeItem(key);
      } catch {
        throw new Error("intent-storage");
      }
    },
  };
}
