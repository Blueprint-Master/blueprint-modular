// Actual renderer output, never a separate mockup. No third-party assets.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),sharp=require('sharp'),crypto=require('node:crypto'),os=require('node:os'),{spawn}=require('node:child_process'),{once}=require('node:events');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'public/objects/weather-v1');
const source=path.join(root,'packages/core/src/objects/weather-renderer.ts'),mod=new Module(source,module);
mod._compile(ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,source);
const ids=['weather-fair','weather-overcast','weather-rain','weather-storm','weather-snow'],styles=['photorealistic','illustration'];
async function main(){
 fs.mkdirSync(path.join(dir,'previews'),{recursive:true});fs.mkdirSync(path.join(root,'docs/previews/weather'),{recursive:true});
 for(const style of styles){const rejected=path.join(dir,`previews/weather-sun-${style}.webp`);if(fs.existsSync(rejected))fs.unlinkSync(rejected);}
 const assets=[],tiles=[],metrics=[],textures={};
 if(process.argv.includes('--import')){
  const offset=process.argv.indexOf('--import');
  for(let i=0;i<2;i++)await sharp(process.argv[offset+1+i]).resize(512).webp({quality:90,effort:6}).toFile(path.join(dir,`cloud-${styles[i]}.webp`));
 }
 for(const style of styles){const file=`cloud-${style}.webp`,data=fs.readFileSync(path.join(dir,file)),raw=await sharp(data).ensureAlpha().raw().toBuffer({resolveWithObject:true});textures[style]={data:new Uint8ClampedArray(raw.data),width:raw.info.width,height:raw.info.height};assets.push({file,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),width:512,height:512});}
 for(const id of ids)for(const style of styles){
  const renderer=mod.exports.createWeatherField(320,textures[style]),pixels=Buffer.from(renderer.draw(id,style,0));
  const file=`previews/${id}-${style}.webp`,data=await sharp(pixels,{raw:{width:320,height:320,channels:4}}).resize(256).webp({quality:86,effort:6}).toBuffer();
  fs.writeFileSync(path.join(dir,file),data);assets.push({file,bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),width:256,height:256});
  const tile=await sharp(pixels,{raw:{width:320,height:320,channels:4}}).flatten({background:style==='illustration'?'#f4f1ec':'#111b2a'}).png().toBuffer();
  tiles.push({input:tile,left:ids.indexOf(id)*320,top:styles.indexOf(style)*320});
  for(const resolution of [320,224]){const measured=resolution===320?renderer:mod.exports.createWeatherField(resolution,textures[style]);const times=[];for(let j=0;j<40;j++){const start=performance.now();measured.draw(id,style,j/3,resolution===320);if(j>=4)times.push(performance.now()-start);}times.sort((a,b)=>a-b);metrics.push({id,style,resolution,medianMs:times[18],p95Ms:times[34]});}
  if(process.argv.includes('--animated')){
   const frames=[];for(let j=0;j<96;j++)frames.push(Buffer.from(renderer.draw(id,style,j/4)));
   await sharp(Buffer.concat(frames),{raw:{width:320,height:320*96,channels:4,pageHeight:320}}).webp({quality:72,loop:0,delay:Array(96).fill(250),effort:4}).toFile(path.join(root,`docs/previews/weather/${id}-${style}.webp`));
  }
 }
 await sharp({create:{width:ids.length*320,height:640,channels:4,background:'#111b2a'}}).composite(tiles).png().toFile(path.join(root,'docs/previews/weather/contact-sheet.png'));
 if(process.argv.includes('--video'))for(const style of styles){
  const size=192,frames=288,fields=ids.map(()=>mod.exports.createWeatherField(size,textures[style])),width=size*ids.length;
  const video=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${size}`,'-framerate','12','-i','pipe:0','-an','-c:v','libx264','-crf','28','-pix_fmt','yuv420p','-movflags','+faststart',path.join(root,`docs/previews/weather/${style}.mp4`)],{stdio:['pipe','inherit','inherit']});
  const ended=once(video,'close');
  for(let j=0;j<frames;j++){const row=Buffer.alloc(width*size*4);for(let i=0;i<ids.length;i++){const pixels=fields[i].draw(ids[i],style,j/12);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const from=(y*size+x)*4,to=(y*width+i*size+x)*4,a=pixels[from+3]/255,bg=style==='illustration'?[246,242,235]:[16,26,40];for(let c=0;c<3;c++)row[to+c]=pixels[from+c]*a+bg[c]*(1-a);row[to+3]=255;}}if(!video.stdin.write(row))await once(video.stdin,'drain');}
  video.stdin.end();const [code]=await ended;if(code!==0)throw Error('Video encode failed');
 }
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({version:'1.0.0',author:'Blueprint / BEAM Consulting SARL',license:'Apache-2.0',source:'packages/core/src/objects/weather-renderer.ts',assets},null,2)+'\n');
 fs.writeFileSync(path.join(root,'docs/previews/weather/measurements.json'),JSON.stringify({date:'2026-09-09',environment:{node:process.version,platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model},method:'Software RGBA renderer only; 36 warm samples per object/style. Excludes browser compositing. Not a mobile-device or battery measurement.',metrics},null,2)+'\n');
 console.log(JSON.stringify({assets:assets.length,posterBytes:assets.reduce((a,b)=>a+b.bytes,0),metrics},null,2));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
