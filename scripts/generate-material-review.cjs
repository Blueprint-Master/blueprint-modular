// Render the shipped software engines, not a visual mockup. Videos stay outside npm.
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript'),sharp=require('sharp'),os=require('node:os'),{spawn}=require('node:child_process'),{once}=require('node:events');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/previews/material-review');fs.mkdirSync(out,{recursive:true});
function source(name){const file=path.join(root,'packages/core/src/objects',name+'.ts'),m=new Module(file,module);m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);return m.exports;}
const weather=source('weather-renderer'),planet=source('planet-canvas-renderer');
global.Image=class{set src(url){sharp(path.join(root,'public',url)).ensureAlpha().raw().toBuffer({resolveWithObject:true}).then(({data,info})=>{this.width=info.width;this.height=info.height;this.data=new Uint8ClampedArray(data);this.onload?.();}).catch(()=>this.onerror?.());}};
global.document={createElement(){let source;return {width:0,height:0,getContext(){return {drawImage(img){source=img;},getImageData(){return {data:source.data};}};}};}};
async function engines(style,size){
 const file=path.join(root,'public/objects/weather-v1',`cloud-${style}.webp`),raw=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const cloud=weather.createWeatherField(size,{data:new Uint8ClampedArray(raw.data),width:raw.info.width,height:raw.info.height});
 let pixels;const canvas={width:size,height:size,getContext(){return {createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(image){pixels=image.data;}};}};
 const sun=planet.createCanvasPlanetRenderer(canvas,{surface:`/objects/universe-v2/compact/${style==='illustration'?'illustrations/':''}sun.webp`,atmosphere:[1,.35,.03],star:true,activity:3});await sun.ready;
 return [(t)=>{sun.draw({rotation:.05-t/42,tilt:-.25,pitch:.08,illustrated:style==='illustration',time:t});return pixels;},(t)=>cloud.draw('weather-storm',style,t,true)];
}
async function main(){
 const metrics=[];
 for(const size of [224,320]){
  const photo=await engines('photorealistic',size),paint=await engines('illustration',size),scenes=[...photo,...paint];
  const tiles=[],times=[0,1.12,1.35,2,4,8,12,16];
  for(let row=0;row<4;row++)for(let j=0;j<times.length;j++)for(let bg=0;bg<2;bg++){
   const pixels=Buffer.from(scenes[row](times[j]));
   const input=await sharp(pixels,{raw:{width:size,height:size,channels:4}}).flatten({background:bg?'#f6f2eb':'#101a28'}).png().toBuffer();tiles.push({input,left:j*size,top:(row*2+bg)*size});
  }
  await sharp({create:{width:size*times.length,height:size*8,channels:4,background:'#101a28'}}).composite(tiles).webp({quality:90,effort:6}).toFile(path.join(out,`instants-${size}.webp`));
  for(let i=0;i<4;i++){const samples=[];for(let j=0;j<36;j++){const start=performance.now();scenes[i](j/6);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);metrics.push({size,object:i%2?'storm':'sun',style:i<2?'photorealistic':'illustration',medianMs:samples[18],p95Ms:samples[34]});}
  if(size!==224||!process.argv.includes('--video'))continue;
  const width=size*2,height=size*2,video=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${height}`,'-framerate','12','-i','pipe:0','-an','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'sun-storm.mp4')],{stdio:['pipe','inherit','inherit']});const ended=once(video,'close');
  for(let frame=0;frame<288;frame++){const data=Buffer.alloc(width*height*4);for(let i=0;i<4;i++){const pixels=scenes[i](frame/12),bg=i<2?[16,26,40]:[246,242,235];for(let y=0;y<size;y++)for(let x=0;x<size;x++){const p=(y*size+x)*4,q=((Math.floor(i/2)*size+y)*width+(i%2)*size+x)*4,a=pixels[p+3]/255;for(let c=0;c<3;c++)data[q+c]=pixels[p+c]*a+bg[c]*(1-a);data[q+3]=255;}}if(!video.stdin.write(data))await once(video.stdin,'drain');}video.stdin.end();if((await ended)[0]!==0)throw Error('ffmpeg failed');
 }
 fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify({date:'2026-09-09',environment:{node:process.version,platform:os.platform(),cpu:os.cpus()[0].model},scope:'Software RGBA only, 36 samples; excludes browser composition and GPU. No phone or battery measurements.',metrics},null,2)+'\n');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
