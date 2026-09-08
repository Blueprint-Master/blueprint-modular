// Mechanical asset optimisation. NASA inputs must match the pinned manifest.
// node scripts/build-compact-universe.cjs /absolute/moon-sources
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),base=path.join(root,'public/objects/universe-v2');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
 const outputs=[];
 async function encode(input,output,width){const data=fs.readFileSync(input);await fs.promises.mkdir(path.dirname(output),{recursive:true});await sharp(data).resize({width,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(output);outputs.push({path:path.relative(base,output),bytes:fs.statSync(output).size,sha256:hash(fs.readFileSync(output))});}
 for(const dir of ['','illustrations/'])for(const file of fs.readdirSync(path.join(base,dir)).filter(n=>n.endsWith('.jpg'))){await encode(path.join(base,dir,file),path.join(base,'compact',dir,file.replace('.jpg','.webp')),1024);}
 const sources=JSON.parse(fs.readFileSync(path.join(base,'moon-manifest.json'),'utf8'));
 if(process.argv[2])for(const moon of sources.maps){const file=path.join(process.argv[2],moon.sourceFile||moon.id+'.jpg'),data=fs.readFileSync(file);if(hash(data)!==moon.sourceSha256)throw Error('Source changed: '+moon.id);const pixels=await sharp(data).resize(128,64).removeAlpha().raw().toBuffer();let black=0;for(let i=0;i<pixels.length;i+=3)if(pixels[i]<4&&pixels[i+1]<4&&pixels[i+2]<4)black++;if(black/(pixels.length/3)>.1)throw Error('Incomplete black map rejected: '+moon.id);await encode(file,path.join(base,'compact',moon.id+'.webp'),1024);}
 for(const file of fs.readdirSync(path.join(base,'previews')).filter(n=>n.endsWith('.png')))await encode(path.join(base,'previews',file),path.join(base,'previews',file.replace('.png','.webp')),256);
 outputs.length=0;
 function inventory(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())inventory(file);else if(file.endsWith('.webp')){const data=fs.readFileSync(file);outputs.push({path:path.relative(base,file),bytes:data.length,sha256:hash(data)});}}}
 inventory(path.join(base,'compact'));inventory(path.join(base,'previews'));
 fs.writeFileSync(path.join(base,'compact-manifest.json'),JSON.stringify({encoding:'WebP quality 84, width <=1024; posters <=256. No image flip or geographic edit.',outputs},null,2)+'\n');
 console.log(JSON.stringify({files:outputs.length,bytes:outputs.reduce((n,x)=>n+x.bytes,0),maxBytes:Math.max(...outputs.map(x=>x.bytes))}));
})().catch(e=>{console.error(e);process.exitCode=1;});
