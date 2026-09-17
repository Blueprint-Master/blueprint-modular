// Reproducible, offline demo of the real mounted React components; no CDN/runtime fetch.
import {build} from 'esbuild';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
// Root and core have separate installations. Bundle a single React instance so
// hooks in the controls use the same dispatcher as the demo's ReactDOM root.
const {outputFiles,metafile}=await build({entryPoints:['scripts/science-layer-demo.tsx'],bundle:true,write:false,minify:true,metafile:true,platform:'browser',alias:{react:resolve('node_modules/react'),'react-dom':resolve('node_modules/react-dom')},define:{'process.env.NODE_ENV':'"production"'}});
const reactCopies=Object.keys(metafile.inputs).filter(path=>/react\/cjs\/react\.production/.test(path));
if(reactCopies.length!==1)throw new Error(`Expected one React runtime, found ${reactCopies.length}`);
const license=readFileSync('node_modules/react/LICENSE','utf8');
const script=outputFiles[0].text.replace(/<\/script/gi,'<\\/script');
writeFileSync('docs/previews/science/layers.html',`<!doctype html><html lang="fr"><!-- React and ReactDOM: ${license} --><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Calques scientifiques composables</title><style>*{box-sizing:border-box}body{margin:0;background:#f2f0ec;color:#193043;font:15px system-ui}main{max-width:1120px;margin:40px auto;padding:24px}h1{font-size:32px;letter-spacing:-1px}nav{display:flex;gap:24px;margin:24px 0;flex-wrap:wrap}.layout{display:grid;grid-template-columns:minmax(0,560px) minmax(280px,1fr);gap:32px}.light,.dark{padding:20px;border-radius:20px;margin-bottom:16px}.light{background:white;color:#193043}.dark{background:#0a1422;color:#f3f6fa}select,input,button{font:inherit}select option{background:#fff;color:#172b3a}input[type=range]{max-width:100%}pre{overflow:auto;font-size:12px}aside{min-width:0}button,select{padding:8px}button:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #098db0;outline-offset:3px}@media(max-width:760px){main{margin:0;padding:16px}.layout{grid-template-columns:1fr}h1{font-size:27px}.light,.dark{padding:8px}}</style><div id="root"></div><script>${script}</script></html>`);
