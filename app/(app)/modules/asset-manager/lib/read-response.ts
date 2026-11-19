export async function readResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) throw new Error(data?.error ?? `HTTP ${response.status}`);
  return data;
}
