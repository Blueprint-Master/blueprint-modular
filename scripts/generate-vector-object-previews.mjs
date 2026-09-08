// Run after the core build. Exports the unchanged version 1 SVG objects as PNGs.
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {ModularObject,MODULAR_OBJECTS}=require('../packages/core/dist/objects/index.js');
await mkdir('public/objects/vector-v1',{recursive:true});
for(const object of MODULAR_OBJECTS.filter(o=>o.family!=='space')){
 const html=renderToStaticMarkup(React.createElement(ModularObject,{id:object.id,version:'1.0.0',size:384}));
 const svg=html.match(/<svg[\s\S]*<\/svg>/)?.[0];if(!svg)throw Error(`Missing SVG: ${object.id}`);
 await sharp(Buffer.from(svg)).resize(384,384,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile(`public/objects/vector-v1/${object.id}.png`);
}
