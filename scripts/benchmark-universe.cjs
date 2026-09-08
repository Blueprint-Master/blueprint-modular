// CPU render cost only: Node/V8 + decoded textures, not browser paint, GPU or battery.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),sharp=require('sharp'),Module=require('node:module'),os=require('node:os');
const root=path.resolve(__dirname,'..');
class TextureImage{set src(url){sharp(path.join(root,'public',url)).ensureAlpha().raw().toBuffer({resolveWithObject:true}).then(({data,info})=>{this.width=info.width;this.height=info.height;this.data=new Uint8ClampedArray(data);this.onload?.();}).catch(()=>this.onerror?.());}}
global.Image=TextureImage;global.document={createElement(){let img;return {width:0,height:0,getContext(){return {drawImage(x){img=x;},getImageData(){return {data:img.data};}};}};}};
function load(file){const m=new Module(file,module);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);return m.exports;}
(async()=>{const variants=[['current',path.join(root,'packages/core/src/objects/planet-canvas-renderer.ts')]];if(process.argv[2])variants.push(['before',path.resolve(process.argv[2])]);const results=[];
for(const [name,file]of variants)for(const size of [224,288,384])for(const [id,activity]of [['earth',1],['jupiter',2],['saturn',2],['europa',0]]){
 const canvas={width:size,height:size,getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}};}};
 const base='/objects/universe-v2',renderer=load(file).createCanvasPlanetRenderer(canvas,{surface:`${base}/compact/${id}.webp`,clouds:id==='earth'?`${base}/compact/earth-clouds.webp`:undefined,rings:id==='saturn'?`${base}/saturn-rings.png`:undefined,atmosphere:id==='earth'?[.15,.5,1]:[0,0,0],star:false,activity});await renderer.ready;
 const times=[];for(let i=0;i<25;i++){const t=performance.now();renderer.draw({rotation:.05-i*.001,tilt:-.25,pitch:id==='saturn'?.45:.08,illustrated:false,time:i/12});if(i>=5)times.push(performance.now()-t);}
 times.sort((a,b)=>a-b);results.push({renderer:name,id,size,medianMs:+times[10].toFixed(2),p95Ms:+times[18].toFixed(2)});renderer.dispose();
}
console.log(JSON.stringify({environment:{node:process.version,cpu:os.cpus()[0].model,platform:process.platform,method:'5 warm-up + 20 frames per scene; same compact maps; no browser/GPU/battery measurement'},results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
