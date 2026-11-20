import { build, transform } from "esbuild";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const core = resolve(root, "packages/core");
const packaged = process.argv.includes("--package");
const output = (file, folder) => packaged
  ? resolve(core, "dist", folder, file)
  : resolve(root, "public/artifacts", file);

const shared = {
  bundle: true, minify: true, tsconfig: resolve(root, "tsconfig.json"),
  define: { "process.env.NODE_ENV": '"production"' },
  // Resolve React from the same installation for the hooks and server renderer.
  alias: { react: resolve(root, "node_modules/react"), "react-dom": resolve(root, "node_modules/react-dom") },
  plugins: [{
    name: "offline-artifact-styles",
    setup(builder) {
      builder.onLoad({ filter: /standalone\.css$/ }, async ({path}) => {
        const tokens = await readFile(resolve(core, "src/variables.css"), "utf8");
        // The artifact uses no icon font. Retain the design tokens, omit that import.
        const localTokens = tokens.replace(/^@import [^;]+;/gm, "")
          .replaceAll(":root", ":where(.bpm-artifact)")
          .replaceAll('[data-theme="dark"] {', '[data-theme="dark"] .bpm-artifact {');
        const {code} = await transform(localTokens + await readFile(path, "utf8"), { loader: "css", minify: true });
        return { contents: code, loader: "text" };
      });
    },
  }],
};

await Promise.all([
  build({ ...shared, entryPoints: [resolve(core, "bin/standalone.tsx")],
    outfile: output("bpm-artifact.cjs", "artifact"), platform: "node",
    format: "cjs", target: "node18", banner: { js: "#!/usr/bin/env node" } }),
  build({ ...shared, entryPoints: [resolve(core, "bin/browser.tsx")],
    outfile: output("bpm.min.js", "standalone"), platform: "browser",
    format: "iife", target: "es2020", globalName: "BlueprintModular" }),
]);
