// Reproducible posters from the actual software renderer, with transparent backgrounds.
const fs=require('node:fs');const path=require('node:path');const ts=require('typescript');const sharp=require('sharp');const Module=require('node:module');
const root=path.resolve(__dirname,'..'),assets=path.join(root,'public/objects/universe-v2');
class TextureImage {set src(url){sharp(path.join(root,'public',url)).ensureAlpha().raw().toBuffer({resolveWithObject:true}).then(({data,info})=>{this.width=info.width;this.height=info.height;this.data=new Uint8ClampedArray(data);this.onload?.();}).catch(()=>this.onerror?.());}}
global.Image=TextureImage;
global.document={createElement(){let source;return {width:0,height:0,getContext(){return {drawImage(img){source=img;},getImageData(){return {data:source.data};}};}};}};
const source=path.join(root,'packages/core/src/objects/planet-canvas-renderer.ts'),mod=new Module(source,module);
mod._compile(ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,source);
const colors={mercury:[0,0,0],venus:[.8,.5,.2],earth:[.15,.5,1],mars:[.55,.2,.08],jupiter:[.4,.28,.15],saturn:[.45,.35,.18],uranus:[.25,.65,.7],neptune:[.15,.3,.85],sun:[1,.35,.03],moon:[0,0,0]};
(async()=>{fs.mkdirSync(path.join(assets,'previews'),{recursive:true});for(const [id,atmosphere] of Object.entries(colors))for(const style of ['photorealistic','illustration']){
 let pixels;const ctx={createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(image){pixels=image.data;}};
 const canvas={width:384,height:384,getContext(){return ctx;}};
 const base='/objects/universe-v2';const renderer=mod.exports.createCanvasPlanetRenderer(canvas,{surface:`${base}/${style==='illustration'?'illustrations/':''}${id}.jpg`,clouds:id==='earth'?`${base}/earth-clouds.jpg`:undefined,rings:id==='saturn'?`${base}/saturn-rings.png`:undefined,atmosphere,star:id==='sun'});
 await renderer.ready;renderer.draw({rotation:.05,tilt:id==='uranus'?1.45:-.25,pitch:id==='saturn'?.45:.08,illustrated:style==='illustration'});
 await sharp(Buffer.from(pixels),{raw:{width:384,height:384,channels:4}}).png().toFile(path.join(assets,'previews',`${id}-${style}.png`));renderer.dispose();console.log(`${id}: ${style}`);
}})().catch(error=>{console.error(error);process.exitCode=1;});
