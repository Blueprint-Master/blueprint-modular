// Raster QA of original SVG renderers, not browser/GPU performance.
import sharp from 'sharp';
import {readFileSync,writeFileSync} from 'node:fs';
import {cpus,platform,arch} from 'node:os';
import {gzipSync} from 'node:zlib';
import {performance} from 'node:perf_hooks';
const root='docs/previews/science/';
const names=['water','carbon-dioxide','methane','ammonia'];
const buffers=[];
for(const name of names)for(const style of ['paper','midnight']){
 const svg=readFileSync(root+`molecule-${name}-${style}.svg`);
 buffers.push(await sharp(svg).resize(360,360).png().toBuffer());
}
await sharp({create:{width:720,height:1440,channels:4,background:'#d5dfe2'}}).composite(buffers.map((input,i)=>({input,left:i%2*360,top:Math.floor(i/2)*360}))).png().toFile(root+'molecules-review.png');
const layers=[];
for(const name of ['science-atom','science-molecule'])for(const color of ['#192c40','#f3f7ff'])for(const size of [180,520]){
 const svg=readFileSync(root+name+'-transparent.svg','utf8');
 const composed='<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" color="'+color+'">'+svg+'</svg>';
 layers.push({input:await sharp(Buffer.from(composed)).resize(size,size).flatten({background:color==='#192c40'?'#ffffff':'#0a1422'}).png().toBuffer(),left:(layers.length%4)*520,top:Math.floor(layers.length/4)*520});
}
await sharp({create:{width:2080,height:1040,channels:4,background:'#a9b7c4'}}).composite(layers).png().toFile(root+'transparent-review.png');
const sizes={},timings={};
for(const name of names){const svg=readFileSync(root+`molecule-${name}-paper.svg`);sizes[name]={bytes:svg.length,gzipBytes:gzipSync(svg).length,viewBox:'520 × 520'};const samples=[];for(let i=0;i<12;i++){const start=performance.now();await sharp(svg).resize(224,224).png().toBuffer();if(i>1)samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);timings[name]={medianMs:samples[5],minMs:samples[0],maxMs:samples[9]};}
const html=readFileSync(root+'layers.html');
writeFileSync(root+'layer-measurements.json',JSON.stringify({date:'2026-09-16',environment:{cpu:cpus()[0].model,platform:platform(),arch:arch(),node:process.version,renderer:'Sharp/libvips software SVG to PNG; not DOM/GPU'},posters:sizes,demo:{bytes:html.length,gzipBytes:gzipSync(html).length,includes:'React + all scientific objects + controls; offline QA only'},softwareRaster224:timings,activeLoops:0,automaticMotion:false,notMeasured:['network transfer','browser layout/paint','GPU','physical mobile','battery']},null,2)+'\n');
