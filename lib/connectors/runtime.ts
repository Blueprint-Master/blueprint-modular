import { applyResponseMapping, getConnectorById, type VaultResolver } from "@blueprint-modular/core/connectors";

type Inputs = Record<string, string | number>;
type ServerBindings = {
  vault: VaultResolver;
  /** Trusted deployment settings for the REST connector, never a request parameter. */
  restOrigin?: string;
  /** Application's OAuth client returns a fresh access token for the bound Google account. */
  sheetsAccessToken?: (appId: string) => Promise<string>;
  transport?: typeof fetch;
};

function trustedUrl(raw: string, origin: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.origin !== origin || url.username || url.password || url.hash) {
    throw new Error("Invalid connector destination");
  }
  return url;
}

function segment(value: string | number | undefined) {
  if (typeof value !== "string" || !value.trim() || value === "." || value === "..") {
    throw new Error("Invalid connector input");
  }
  return encodeURIComponent(value);
}

function pageLimit(input: Inputs) {
  const limit = input.limit ?? 10;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be an integer between 1 and 100");
  }
  return limit;
}

async function responseText(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let bytes = 0;
  let result = "";
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) return result + decoder.decode();
      bytes += chunk.value.byteLength;
      if (bytes > 4 * 1024 * 1024) {
        await reader.cancel();
        throw new Error("Connector response exceeded size limit");
      }
      result += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

/** Invoke one curated operation from an authorized server-side application context. */
export async function runConnector(
  bindings: ServerBindings, appId: string, connectorId: string, operationId: string, input: Inputs,
) {
  if (typeof window !== "undefined") throw new Error("Connector credentials require a server context");
  const descriptor = getConnectorById(connectorId);
  const operation = descriptor?.operations.find((candidate) => candidate.id === operationId);
  if (!appId.trim() || !descriptor || !operation) throw new Error("Unknown application or connector operation");
  if (Object.keys(input).some((key) => !Object.hasOwn(operation.inputSchema, key))) {
    throw new Error("Unexpected connector input");
  }
  const credential = async (key: string) => {
    const value = await bindings.vault.get(appId, connectorId, key);
    if (!value) throw new Error("Missing connector credential");
    return value;
  };
  const headers = new Headers({ Accept: "application/json" });
  let url: URL;
  let body: string | undefined;
  switch (connectorId) {
    case "rest-generic": {
      if (!bindings.restOrigin) throw new Error("REST destination is not configured");
      const base = trustedUrl(await credential("baseUrl"), bindings.restOrigin);
      const resource = segment(input.resource);
      base.pathname = base.pathname.replace(/\/$/, "") + "/" + resource;
      base.search = "";
      base.searchParams.set("limit", String(pageLimit(input)));
      headers.set("X-API-Key", await credential("apiKey"));
      url = base;
      break;
    }
    case "google-sheets": {
      if (!bindings.sheetsAccessToken) throw new Error("Google OAuth account is not configured");
      const sheet = await credential("spreadsheetId");
      if (input.spreadsheetId !== undefined && input.spreadsheetId !== sheet) throw new Error("Spreadsheet does not match bound account");
      url = new URL(`https://sheets.googleapis.com/v4/spreadsheets/${segment(sheet)}/values/${segment(input.range)}`);
      const token = await bindings.sheetsAccessToken(appId);
      if (!token) throw new Error("Missing Google access token");
      headers.set("Authorization", "Bearer " + token);
      break;
    }
    case "stripe":
      url = new URL("https://api.stripe.com/v1/charges");
      url.searchParams.set("limit", String(pageLimit(input)));
      headers.set("Authorization", "Bearer " + await credential("secretKey"));
      break;
    case "outgoing-webhook":
      if (typeof input.text !== "string" || !input.text.trim()) throw new Error("Message text required");
      url = trustedUrl(await credential("webhookUrl"), "https://hooks.slack.com");
      headers.set("Content-Type", "application/json");
      body = JSON.stringify({ text: input.text });
      break;
    default:
      throw new Error("Unsupported connector");
  }
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 15000);
  try {
    const request = bindings.transport ?? fetch;
    const response = await request(url, { method: operation.httpMethod, headers, body, redirect: "error", signal: abort.signal });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error("Upstream HTTP " + response.status);
    }
    const raw = await responseText(response);
    if (connectorId === "outgoing-webhook") {
      if (raw.trim() !== "ok") throw new Error("Unexpected acknowledgement");
      return applyResponseMapping({ ok: true, status: response.status }, operation);
    }
    const payload = JSON.parse(raw);
    // Sheets omits the values field for an empty range.
    if (connectorId === "google-sheets" && payload && typeof payload.range === "string" && payload.values === undefined) {
      return [];
    }
    return applyResponseMapping(payload, operation);
  } catch (error) {
    // Transport and provider errors can contain secret URLs, credentials or customer data.
    if (error instanceof Error && /^Upstream HTTP [0-9]{3}$/.test(error.message)) throw error;
    throw new Error("Connector request failed or returned an invalid response");
  } finally {
    clearTimeout(timer);
  }
}
