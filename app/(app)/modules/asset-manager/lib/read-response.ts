export async function readResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) throw new Error(data?.error ?? `HTTP ${response.status}`);
  return data;
}

export async function readHistory<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const url = new URL(path, window.location.origin);
  const result: T[] = [];
  let cursor: string | null;
  do {
    const response = await fetch(url, { signal, credentials: "include" });
    result.push(...await readResponse(response));
    cursor = response.headers.get("X-Next-Cursor");
    if (cursor) url.searchParams.set("cursor", cursor);
  } while (cursor);
  return result;
}
