// Review proof from the shipped renderer and materials, never a separate mockup.
const fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),Module=require('node:module'),sharp=require('sharp'),{spawn}=require('node:child_process'),{once}=require('node:events');
const root=path.resolve(__dirname,'..'),assetDir=path.join(root,'public/objects/weather-v1'),out=path.join(root,'docs/previews/weather-sun');
const source=path.join(root,'packages/core/src/objects/weather-renderer.ts'),record=new Module(source,module);
record._compile(ts.transpileModule(fs.readFileSync(source,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,source);
const styles=['photorealistic','illustration'],times=[0,1,2,3,6,12,24];
async function texture(style){const raw=await sharp(path.join(assetDir,`sun-${style}.webp`)).ensureAlpha().raw().toBuffer({resolveWithObject:true});return {data:new Uint8ClampedArray(raw.data),width:raw.info.width,height:raw.info.height};}
async function flattened(pixels,size,background){return sharp(Buffer.from(pixels),{raw:{width:size,height:size,channels:4}}).flatten({background}).webp({quality:88,effort:5}).toBuffer();}
async function main(){
 fs.mkdirSync(out,{recursive:true});const loaded=Object.fromEntries(await Promise.all(styles.map(async style=>[style,await texture(style)])));
 for(const size of [160,224,320]){
  const tiles=[];for(let s=0;s<styles.length;s++)for(let b=0;b<2;b++)for(let i=0;i<times.length;i++){
   const style=styles[s],field=record.exports.createWeatherField(size,loaded[style]);
   tiles.push({input:await flattened(field.draw('weather-sun',style,times[i]),size,b?'#f6f2eb':'#101a28'),left:i*size,top:(s*2+b)*size});
  }
  await sharp({create:{width:size*times.length,height:size*4,channels:4,background:'#101a28'}}).composite(tiles).webp({quality:88,effort:6}).toFile(path.join(out,`instants-${size}.webp`));
 }
 const size=224,width=size*2,fields=styles.map(style=>record.exports.createWeatherField(size,loaded[style]));
 const video=spawn('ffmpeg',['-y','-loglevel','error','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${size}`,'-framerate','12','-i','pipe:0','-an','-c:v','libx264','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',path.join(out,'weather-sun.mp4')],{stdio:['pipe','inherit','inherit']});
 const ended=once(video,'close');for(let frame=0;frame<288;frame++){const row=Buffer.alloc(width*size*4);for(let i=0;i<2;i++){const pixels=fields[i].draw('weather-sun',styles[i],frame/12);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const from=(y*size+x)*4,to=(y*width+i*size+x)*4,a=pixels[from+3]/255,bg=i?[246,242,235]:[16,26,40];for(let c=0;c<3;c++)row[to+c]=pixels[from+c]*a+bg[c]*(1-a);row[to+3]=255;}}if(!video.stdin.write(row))await once(video.stdin,'drain');}
 video.stdin.end();const [code]=await ended;if(code!==0)throw Error('Video encode failed');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
