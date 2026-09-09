// Deterministic pixel proofs from the actual renderer, not browser/GPU validation.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),sharp=require('sharp');
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {createCanvasPlanetRenderer}=require('../packages/core/src/objects/planet-canvas-renderer.ts');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/previews/earth-layers');fs.mkdirSync(out,{recursive:true});
class TextureImage{set src(url){sharp(path.join(root,'public',url)).ensureAlpha().raw().toBuffer({resolveWithObject:true}).then(({data,info})=>{this.width=info.width;this.height=info.height;this.data=new Uint8ClampedArray(data);this.onload?.();}).catch(()=>this.onerror?.());}}
global.Image=TextureImage;global.document={createElement(){let image;return {getContext(){return {drawImage(img){image=img;},getImageData(){return {data:image.data};}};}};}};
(async()=>{const cells=[],measurements=[];for(const style of ['photorealistic','illustration'])for(const [name,earth] of [['day',{lighting:'day',clouds:false}],['night',{lighting:'night',cloudCoverage:.25}],['coordinated',{lighting:'coordinated',sunAzimuth:75}],['cloudy',{lighting:'day',cloudCoverage:.8}],['auroras',{lighting:'night',clouds:false,auroras:true}]]){
 let pixels;const size=288,canvas={width:size,height:size,getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(p){pixels=p.data;}};}};
 const base='/objects/universe-v2',renderer=createCanvasPlanetRenderer(canvas,{surface:`${base}/compact/${style==='illustration'?'illustrations/':''}earth.webp`,clouds:`${base}/compact/earth-clouds.webp`,night:`${base}/compact/earth-night.webp`,atmosphere:[.15,.5,1],star:false,activity:1});await renderer.ready;
 const timing=[];for(let i=0;i<8;i++){const t=performance.now();renderer.draw({rotation:.05,tilt:-.25,pitch:.08,illustrated:style==='illustration',earth,time:i/12});if(i>2)timing.push(performance.now()-t);}
 renderer.draw({rotation:.05,tilt:-.25,pitch:.08,illustrated:style==='illustration',earth,time:0});
 const file=`${name}-${style}.png`;await sharp(Buffer.from(pixels),{raw:{width:size,height:size,channels:4}}).png().toFile(path.join(out,file));
 const label=Buffer.from(`<svg width="288" height="320"><rect width="288" height="320" fill="#090f1b"/><text x="144" y="310" text-anchor="middle" fill="white" font-size="13" font-family="sans-serif">${name} · ${style}</text></svg>`);
 cells.push(await sharp(label).composite([{input:path.join(out,file),top:0,left:0}]).png().toBuffer());measurements.push({name,style,size,medianMs:timing.sort((a,b)=>a-b)[2]});renderer.dispose();
 }
 await sharp({create:{width:1440,height:640,channels:4,background:'#090f1b'}}).composite(cells.map((input,i)=>({input,left:(i%5)*288,top:Math.floor(i/5)*320}))).webp({quality:88}).toFile(path.join(out,'contact-sheet.webp'));
 fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({node:process.version,method:'Software renderer only; 8 frames, 3 warmup, 288px. Not browser or battery.',measurements},null,2)+'\n');
})().catch(error=>{console.error(error);process.exitCode=1;});
