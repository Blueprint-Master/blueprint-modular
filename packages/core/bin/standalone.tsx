import React from "react";
import { zodToJsonSchema } from "zod-to-json-schema";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { artifactSpec } from "../../../lib/artifact/contract";
import { describeArtifact } from "../../../lib/artifact/context";
import example from "../../../lib/artifact/example.json";
import { Dashboard } from "./Dashboard";
import css from "./standalone.css";

function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--inspect" && args.length === 2) {
    const html = readFileSync(args[1], "utf8");
    const embedded = /<script type="application\/json" id="bpm-context">([^<]*)<\/script>/.exec(html);
    if (!embedded) throw new Error("Missing Modular artifact context.");
    const payload = JSON.parse(embedded[1]);
    if (payload.version !== 1) throw new Error("Unsupported Modular artifact version.");
    // Recompute observations from validated source data when opening the file.
    process.stdout.write(JSON.stringify(describeArtifact(artifactSpec.parse(payload.spec)), null, 2) + "\n");
    return;
  }
  if (args.length !== 1) throw new Error("Usage: node bpm-artifact.cjs spec.json > report.html | --example | --schema | --inspect report.html");
  if (args[0] === "--schema") {
    process.stdout.write(JSON.stringify(zodToJsonSchema(artifactSpec), null, 2) + "\n");
    return;
  }
  if (args[0] === "--example") {
    process.stdout.write(JSON.stringify(example, null, 2) + "\n");
    return;
  }
  const spec = artifactSpec.parse(JSON.parse(readFileSync(args[0], "utf8")));
  const modelData = JSON.stringify(describeArtifact(spec)).replace(/</g, "\\u003c");
  const html = renderToStaticMarkup(<html lang={spec.locale}><head>
    <meta charSet="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{spec.title}</title><style dangerouslySetInnerHTML={{__html: css}} />
  </head><body style={{margin:0}}><Dashboard {...spec}/><script type="application/json" id="bpm-context"
      dangerouslySetInnerHTML={{__html: modelData}} /></body></html>);
  process.stdout.write("<!doctype html>\n" + html + "\n");
}

try { main(); } catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
