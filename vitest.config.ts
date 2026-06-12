import { defineConfig } from "vitest/config";
import { resolve } from "path";

/**
 * Config Vitest racine — couvre les tests d'autorisation (RBAC) du module
 * asset-manager. Les tests de `packages/core/gate` ont leur propre exécution
 * (`npm run gate:test` dans packages/core).
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
