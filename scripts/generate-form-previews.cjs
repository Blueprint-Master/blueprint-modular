/* Render the actual runtime engine, not a separate visual mockup. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const ts=require('typescript'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),cache={};
function load(file){file=path.resolve(file);if(cache[file])return cache[file].exports;const record={exports:{}};cache[file]=record;const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(p=>p.startsWith('.')?load(path.resolve(path.dirname(file),p+'.ts')):require(p),record,record.exports);return record.exports;}
const {createFormField}=load(path.join(root,'packages/core/src/objects/forms-renderer.ts'));
const {FORM_IDS,FORM_PERIOD,FORM_NAMES}=load(path.join(root,'packages/core/src/objects/forms.ts'));
const styles=['photorealistic','illustration'],assets=path.join(root,'public/objects/forms-v1'),proof=path.join(root,'docs/previews/forms');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
async function main(){
 fs.mkdirSync(path.join(assets,'previews'),{recursive:true});fs.mkdirSync(proof,{recursive:true});
 const entries=[],metrics=[];
 for(const size of [160,224,320]){
  const cells=[],times=[0,1,2,3,6,9,12];
  for(let row=0;row<8;row++){
   const id=FORM_IDS[row%4],style=styles[Math.floor(row/4)],field=createFormField(size),timings=[];
   for(let j=0;j<36;j++){const start=performance.now();field.draw(id,style,j/3);timings.push(performance.now()-start);}
   timings.sort((a,b)=>a-b);metrics.push({size,id,style,medianMs:timings[18],p95Ms:timings[34]});
   for(let column=0;column<times.length;column++){
    const rgba=Buffer.from(field.draw(id,style,times[column]));
    if(size===320&&column===0){const name=`previews/${id}-${style}.webp`,buffer=await sharp(rgba,{raw:{width:size,height:size,channels:4}}).webp({quality:90}).toBuffer();fs.writeFileSync(path.join(assets,name),buffer);entries.push({path:name,bytes:buffer.length,sha256:hash(buffer),width:size,height:size,source:'packages/core/src/objects/forms-renderer.ts',author:'Blueprint Modular / BEAM Consulting SARL',license:'Apache-2.0'});}
    for(let bg=0;bg<2;bg++){const buffer=await sharp(rgba,{raw:{width:size,height:size,channels:4}}).flatten({background:bg?'#f4f2ee':'#080e18'}).png().toBuffer();cells.push({input:buffer,left:column*size,top:(row*2+bg)*size});}
   }
  }
  await sharp({create:{width:size*7,height:size*16,channels:3,background:'#080e18'}}).composite(cells).webp({quality:85}).toFile(path.join(proof,`instants-${size}.webp`));
 }
 fs.writeFileSync(path.join(assets,'manifest.json'),JSON.stringify({schemaVersion:1,date:'2026-09-10',version:'1.0.0',license:'Apache-2.0',rendererSha256:hash(fs.readFileSync(path.join(root,'packages/core/src/objects/forms-renderer.ts'))),assets:entries},null,2)+'\n');
 fs.writeFileSync(path.join(proof,'measurements.json'),JSON.stringify({date:'2026-09-10',environment:{node:process.version,platform:process.platform,cpu:os.cpus()[0].model},scope:'36 actual software render samples per object/style/resolution; excludes browser composition and transfer. No physical phone or battery test.',metrics},null,2)+'\n');
 fs.writeFileSync(path.join(assets,'ATTRIBUTION.txt'),'Formes & ondes — Original procedural sculptures.\nCopyright 2026 BEAM Consulting SARL. Apache-2.0; see repository LICENSE and NOTICE.\nSource: packages/core/src/objects/forms-renderer.ts. No third-party raster material.\nStudio-lit synthetic and illustrated variants, not photographs or physical simulations.\n');
 for(const id of FORM_IDS)for(const style of styles)fs.writeFileSync(path.join(root,'examples/objects',`${id}-${style}.modular.json`),JSON.stringify({schemaVersion:1,kind:'modular-object',id,version:'1.0.0',style,animation:{playing:true,speed:1}},null,2)+'\n');
 if(process.argv.includes('--video')){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'modular-forms-')),size=224,fields=Array.from({length:8},()=>createFormField(size));
  for(let frame=0;frame<=FORM_PERIOD*12;frame++){
   const cells=[];for(let row=0;row<2;row++)for(let col=0;col<4;col++){const i=row*4+col,rgba=Buffer.from(fields[i].draw(FORM_IDS[col],styles[row],frame/12));const buffer=await sharp(rgba,{raw:{width:size,height:size,channels:4}}).png().toBuffer();cells.push({input:buffer,left:col*size,top:row*size});}
   await sharp({create:{width:size*4,height:size*2,channels:3,background:'#0b1220'}}).composite(cells).png().toFile(path.join(dir,`${String(frame).padStart(4,'0')}.png`));
  }
  const out=spawnSync('ffmpeg',['-y','-framerate','12','-i',path.join(dir,'%04d.png'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',path.join(proof,'forms.mp4')],{encoding:'utf8'});if(out.status!==0)throw Error(out.stderr);fs.rmSync(dir,{recursive:true});
 }
 console.log(JSON.stringify({objects:FORM_NAMES,posters:entries,metrics},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
