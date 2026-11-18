/**
 * Génère `lib/generated/plano-key-props.json` : pour chaque composant, ses
 * props clés (requises d'abord, trois au plus) lues dans le registre MCP.
 * Fichier léger destiné au bundle client (le registre complet pèse ~400 Ko).
 * `tests/plano-archetypes.test.ts` rougit si ce fichier n'est plus à jour.
 *
 *   npx tsx scripts/generate-plano-key-props.ts
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import registry from "../lib/generated/mcp-registry.json";
import { keyPropsFrom } from "../lib/plano/archetypes";

const out: Record<string, string[]> = {};
for (const c of registry.components as { slug: string; props?: string }[]) {
  const keys = keyPropsFrom(c.props);
  if (keys.length) out[c.slug] = keys;
}
const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(resolve(__dirname, "../lib/generated/plano-key-props.json"), JSON.stringify(sorted, null, 2) + "\n");
console.log(`plano-key-props.json : ${Object.keys(sorted).length} composants`);
