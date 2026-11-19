// Run after the core build. Only the tarball is visible under the consumer's package name.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, copyFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const out = resolve(process.argv[2]);
mkdirSync(out, { recursive: true });
const installed = join(out, "node_modules/@blueprint-modular/core");
mkdirSync(installed, { recursive: true });
const pack = JSON.parse(execFileSync("npm", ["pack","--json","--pack-destination",out],
  {cwd:join(root,"packages/core"),encoding:"utf8"}))[0];
execFileSync("tar", ["-xzf",join(out,pack.filename),"--strip-components=1","-C",installed]);

const registry = JSON.parse(readFileSync(join(root,"lib/generated/mcp-registry.json"),"utf8"));
const curated = registry.components.filter(c => c.status === "curated").map(c => c.name.slice(4));
const options = {
  bundle:true, absWorkingDir:out, nodePaths:[join(root,"node_modules")],
  alias:{react:join(root,"node_modules/react"),"react-dom":join(root,"node_modules/react-dom")},
  define:{"process.env.NODE_ENV":'"production"'}, minify:true,
  plugins:[{name:"no-next",setup(b){ b.onResolve({filter:/^next(\/|$)/},args => {
    throw new Error("Framework import in published core: "+args.path);
  }); }}],
};
await build({...options, platform:"node", outfile:join(out,"catalogue.cjs"),
  loader:{".css":"empty"}, stdin:{resolveDir:out,contents:`
    import {bpm} from '@blueprint-modular/core';
    import {renderToStaticMarkup} from 'react-dom/server';
    import {FIXTURES} from ${JSON.stringify(join(root,"packages/core/gate/fixtures.ts"))};
    for (const key of ${JSON.stringify(curated)}) {
      if (!(key in FIXTURES)) throw new Error("Missing fixture "+key);
      try {renderToStaticMarkup(bpm[key](FIXTURES[key]));}
      catch(e) {throw new Error(key+": "+e.message);}
    }
  `},
});
execFileSync(process.execPath,[join(out,"catalogue.cjs")],{stdio:"inherit"});
console.log(curated.length+" curated components rendered from the package (SSR).");
const interactive=await build({...options, platform:"browser",write:false,stdin:{resolveDir:out,contents:`
  import {createRoot} from 'react-dom/client';
  import {plotlyChart} from '@blueprint-modular/core/artifact/plotly';
  createRoot(document.querySelector('main')).render(plotlyChart({data:[{type:'bar',x:['A','B'],y:[30,50]}]}));
` }});
writeFileSync(join(out,"plot.html"),'<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><main></main><script>'+interactive.outputFiles[0].text.replace(/<\/script/gi,"<\\/script")+'</script>');
const spec = join(root,"lib/artifact/example.json");
const cli = join(installed,"dist/artifact/bpm-artifact.cjs");
writeFileSync(join(out,"static.html"),execFileSync(process.execPath,[cli,spec]));
copyFileSync(spec,join(out,"spec.json"));
copyFileSync(join(installed,"dist/standalone/bpm.min.js"),join(out,"bpm.min.js"));
