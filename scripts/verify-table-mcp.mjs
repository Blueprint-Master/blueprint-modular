import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const endpoint = new URL("/api/mcp", process.argv[2]);
assert.equal(endpoint.origin, `http://127.0.0.1:${endpoint.port}`, "La recette attend une préproduction locale.");
const client = new Client({ name: "table-filter-contract", version: "1.0" });
try {
  await client.connect(new StreamableHTTPClientTransport(endpoint));
  const result = await client.callTool({ name: "get_component", arguments: { name: "bpm.table" } });
  assert.ok(!result.isError, "Échec de get_component");
  const detail = JSON.parse(result.content.find(item => item.type === "text").text);
  assert.equal(detail.name, "bpm.table");
  const contracts = {
    "columns.filterable": /columns\*:[^\n]*\bfilterable: true\b/,
    filters: /^\s*filters\?: Record<string, string\[\]>/m,
    onFiltersChange: /^\s*onFiltersChange\?: \(filters: Record<string, string\[\]>\) => void/m,
  };
  const missing = Object.entries(contracts).filter(([, signature]) => !signature.test(detail.props));
  console.log(JSON.stringify({ tool: "get_component", component: detail.name, checked: Object.keys(contracts), missing: missing.map(([name]) => name) }));
  assert.equal(missing.length, 0, "Signature de filtrage incomplète");
} finally {
  await client.close();
}
