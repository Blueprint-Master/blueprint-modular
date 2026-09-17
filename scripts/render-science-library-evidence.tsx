import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {cpus,platform,arch} from "node:os";
import {gzipSync} from "node:zlib";
import sharp from "sharp";
import {ScienceObject} from "../packages/core/src/objects/ScienceObject";
import {MoleculeLayer} from "../packages/core/src/objects/MoleculeLayer";
import {MOLECULE_PRESETS,moleculePresetSettings} from "../packages/core/src/objects/molecule-presets";
import {moleculeMotionPose} from "../packages/core/src/objects/useMoleculeMotion";
import type {ScienceStyle} from "../packages/core/src/objects/science";
const folder=new URL("../docs/previews/science/",import.meta.url),frames=new URL("../.science-motion-frames/",import.meta.url);
mkdirSync(frames,{recursive:true});
const svg=(node:React.ReactNode)=>{const html=renderToStaticMarkup(node);return html.slice(html.indexOf("<svg"),html.lastIndexOf("</svg>")+6);};
const raster=(s:string,width=360)=>sharp(Buffer.from(s)).resize(width,width).png().toBuffer();
const contact:Array<{input:Buffer;left:number;top:number}>=[];
for(const [row,element] of ["O","Fe","Lr"].entries())for(const [col,style] of (["midnight","paper","transparent"] as ScienceStyle[]).entries()){
 const text=svg(<ScienceObject id="science-atom" label={element} element={element} style={style} thumbnail/>);
 writeFileSync(new URL(`atom-${element}-${style}.svg`,folder),text);
 contact.push({input:await raster(text),left:col*360,top:row*360});
}
await sharp({create:{width:1080,height:1080,channels:4,background:"#e9eef1"}}).composite(contact).png().toFile(new URL("atom-orbitals-review.png",folder).pathname);
const examples=["water","ethanol","dimethyl-ether","benzene","caffeine","sucrose"] as const;
const cards:Array<{input:Buffer;left:number;top:number}>=[];
for(const [i,id] of examples.entries())cards.push({input:await raster(svg(<ScienceObject id="science-molecule" label={id} molecule={moleculePresetSettings(id)} style={i%2?"paper":"midnight"} thumbnail/>)),left:i%3*360,top:Math.floor(i/3)*360});
await sharp({create:{width:1080,height:720,channels:4,background:"#e9eef1"}}).composite(cards).png().toFile(new URL("molecular-library-review.png",folder).pathname);
const transparent:Array<{input:Buffer;left:number;top:number}>=[];
for(const [row,id] of ["science-atom","science-molecule"].entries())for(const [col,dark] of [false,true].entries())for(const [i,size] of [180,520].entries()){
 const markup=readFileSync(new URL(`${id}-transparent.svg`,folder),"utf8");
 const wrapped=`<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" color="${dark?"#edf5ff":"#172c40"}">${markup}</svg>`;
 transparent.push({input:await sharp(Buffer.from(wrapped)).resize(size,size).flatten({background:dark?"#0a1422":"#ffffff"}).png().toBuffer(),left:col*700+(i?180:0),top:row*520});
}
await sharp({create:{width:1400,height:1040,channels:4,background:"#a9b7c4"}}).composite(transparent).png().toFile(new URL("library-transparent-review.png",folder).pathname);
// Actual same projection function as the hook, sampled at 6 fps over one exact 20s cycle.
for(let frame=0;frame<120;frame++){
 const pose=moleculeMotionPose(frame/6),panels:Array<{input:Buffer;left:number;top:number}>=[];
 for(const [i,id] of (["water","ethanol","sucrose"] as const).entries()){
  const p=moleculePresetSettings(id),text=svg(<svg viewBox="0 0 360 400" xmlns="http://www.w3.org/2000/svg" style={{color:i===1?"#142c41":"#eef5ff"}}><rect width="360" height="400" fill={i===1?"#f6f3ed":"#0a1321"}/><text x="20" y="30" fill="currentColor" fontSize="16">{MOLECULE_PRESETS[id].name.fr}</text><g transform="translate(180 205) scale(.94)"><MoleculeLayer graph={MOLECULE_PRESETS[id].graph} yaw={p.yaw+pose.yaw} pitch={p.pitch+pose.pitch}/></g><text x="20" y="380" fill="currentColor" fontSize="11">{(frame/6).toFixed(1)} s · orientation, distances conservées</text></svg>);
  panels.push({input:await sharp(Buffer.from(text)).png().toBuffer(),left:i*360,top:0});
 }
 await sharp({create:{width:1080,height:400,channels:4,background:"#0a1321"}}).composite(panels).png().toFile(new URL(`${String(frame).padStart(3,"0")}.png`,frames).pathname);
}
const timings=[];
for(const id of ["water","ethanol","caffeine","sucrose"] as const){
 const samples=[];for(let i=0;i<12;i++){const start=performance.now();await raster(svg(<ScienceObject id="science-molecule" label={id} molecule={moleculePresetSettings(id)} style="midnight"/>),224);samples.push(performance.now()-start);}
 samples.sort((a,b)=>a-b);timings.push({id,atoms:MOLECULE_PRESETS[id].graph.atoms.length,medianServerReactAndRasterMs:Number(samples[6].toFixed(2)),p95Ms:Number(samples[11].toFixed(2))});
}
const bytes=["packages/core/src/objects/molecule-library.generated.ts","docs/previews/science/layers.html"].map(file=>{const data=readFileSync(new URL("../"+file,import.meta.url));return {file,rawBytes:data.length,gzipBytes:gzipSync(data).length};});
writeFileSync(new URL("library-budget.json",folder),JSON.stringify({environment:{cpu:cpus()[0]?.model,platform:platform(),arch:arch(),node:process.version,renderer:"React server + sharp/libvips; not browser/GPU/mobile",pixelSize:224},catalogueCount:Object.keys(MOLECULE_PRESETS).length,bytes,timings,loops:"one rAF per selected visible motion-enabled molecule; zero in thumbnail/pause/offscreen/hidden/reduced motion (mocked lifecycle test)",notMeasured:["actual network transfer","mounted-browser frame time","physical phone","battery"]},null,2)+"\n");
