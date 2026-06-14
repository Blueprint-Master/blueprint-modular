import { defineConfig } from "vitest/config";
import { resolve } from "path";

/**
 * Config Vitest racine — couvre les tests d'autorisation (RBAC) du module
 * asset-manager et le rendu inerte du contenu utilisateur (XSS, #2b). Les
 * tests de `packages/core/gate` ont leur propre exécution
 * (`npm run gate:test` dans packages/core).
 */
export default defineConfig({
  resolve: {
    alias: {
      // Contrat connecteurs : résout vers la SOURCE core (pas le dist) en test,
      // pour ne pas dépendre d'un build préalable de @blueprint-modular/core.
      "@blueprint-modular/core/connectors": resolve(
        __dirname,
        "packages/core/src/connectors/index.ts"
      ),
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
