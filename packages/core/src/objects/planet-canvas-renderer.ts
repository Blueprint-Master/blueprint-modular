import type {PlanetFrame} from "./planet-renderer";
/** Software projection for devices without WebGL. Still a sphere, with UV
 * rotation and depth-tested rings. Bounded to 384px and 20fps by the host. */
export function createCanvasPlanetRenderer(canvas:HTMLCanvasElement,config:{surface:string;clouds?:string;rings?:string;atmosphere:readonly number[];star:boolean;activity?:number}){
 canvas.width=Math.min(canvas.width,384);canvas.height=canvas.width;
 const ctx=canvas.getContext("2d");if(!ctx)throw new Error("Canvas unavailable");
 let disposed=false;
 type Texture={width:number;height:number;data:Uint8ClampedArray};
 const load=(url?:string)=>new Promise<Texture|null>((resolve,reject)=>{
  if(!url){resolve(null);return;}const img=new Image();img.crossOrigin="anonymous";
  img.onload=()=>{if(disposed){resolve(null);return;}try{const c=document.createElement("canvas");c.width=img.width;c.height=img.height;const x=c.getContext("2d")!;x.drawImage(img,0,0);resolve({width:c.width,height:c.height,data:x.getImageData(0,0,c.width,c.height).data});}catch{reject(new Error("Texture unavailable"));}};
  img.onerror=()=>reject(new Error("Texture unavailable"));img.src=url;
 });
 let maps:(Texture|null)[]=[];
 const ready=Promise.all([load(config.surface),load(config.clouds),load(config.rings)]).then(result=>{maps=result;});
 const sample=(texture:Texture,u:number,v:number)=>{
  const x=Math.min(texture.width-1,Math.floor(((u%1+1)%1)*texture.width)),y=Math.min(texture.height-1,Math.max(0,Math.floor(v*texture.height))),i=(y*texture.width+x)*4;
  return [texture.data[i]/255,texture.data[i+1]/255,texture.data[i+2]/255,texture.data[i+3]/255];
 };
 const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const normalize=(x:number,y:number,z:number)=>{const n=Math.hypot(x,y,z);return [x/n,y/n,z/n];};
 const light=normalize(-.65,.5,1.2),size=canvas.width;
 const pixels=ctx.createImageData(size,size);
 // Cache projection and illumination: rotation changes UV offset, never geometry.
 const geometry=new Float32Array(size*size*5);
 let geometryTilt=NaN,geometryPitch=NaN;

 return {ready,dispose(){disposed=true;maps=[];},maxFps:20,draw(frame:PlanetFrame){
  if(disposed||!maps[0])return;
  const [surface,clouds,rings]=maps,scale=rings?2.55:1.3;
  const cz=Math.cos(frame.tilt),sz=Math.sin(frame.tilt),cx=Math.cos(frame.pitch),sx=Math.sin(frame.pitch);
  const orient=(x:number,y:number,z:number)=>{const xx=cz*x-sz*y,yy=sz*x+cz*y;return [xx,cx*yy-sx*z,sx*yy+cx*z];};
  const localLight=orient(...light as [number,number,number]),ray=orient(0,0,-1);
  if(geometryTilt!==frame.tilt||geometryPitch!==frame.pitch){
   geometryTilt=frame.tilt;geometryPitch=frame.pitch;
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const px=((x+.5)/size*2-1)*scale,py=(1-(y+.5)/size*2)*scale,rr=px*px+py*py,i=(y*size+x)*5;
    if(rr>1)continue;
    const z=Math.sqrt(1-rr),n=orient(px,py,z),diffuse=px*light[0]+py*light[1]+z*light[2];
    geometry[i]=1-Math.atan2(n[2],n[0])/(2*Math.PI);geometry[i+1]=Math.acos(Math.max(-1,Math.min(1,n[1])))/Math.PI;
    geometry[i+2]=z;geometry[i+3]=diffuse;geometry[i+4]=Math.pow(1-z,3.2)*(.35+.65*Math.max(0,diffuse))*.65;
   }
  }
  const time=frame.time??0,flow=.014*Math.sin(time*.05),cloudFlow=.003*Math.sin(time*.12);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const px=((x+.5)/size*2-1)*scale,py=(1-(y+.5)/size*2)*scale,rr=px*px+py*py;
   let color=[0,0,0],alpha=0,sphereT=100;
   if(rr<=1){
    const gi=(y*size+x)*5,u=geometry[gi],v=geometry[gi+1],z=geometry[gi+2];sphereT=4-z;
    let tex=sample(surface!,u+frame.rotation+(config.activity===2?flow*Math.sin(v*55):0),v);
    if(config.activity===3){const shimmer=.98+.02*Math.sin(time*.3+(u+frame.rotation)*31.4159265+v*16);tex=tex.map(c=>c*shimmer);}
    const diffuse=Math.max(0,geometry[gi+3]);
    let lighting=.12+.95*Math.pow(diffuse,.8);
    if(frame.illustrated){const lum=tex[0]*.299+tex[1]*.587+tex[2]*.114;const paper=(Math.sin(Math.floor(u*1600)*127.1+Math.floor(v*1600)*311.7)*43758.5453)%1;
     tex=tex.map((c,i)=>((lum+(c-lum)*1.22)*.88+[1,.91,.75][i%3]*.12)*(.94+.12*Math.abs(paper)));
     lighting=.35+.65*smooth(-.12,.8,geometry[gi+3]);lighting=lighting*.78+Math.floor(lighting*7)/7*.22;}
    color=tex.slice(0,3).map(c=>c*(config.star?1.15:lighting));
    if(clouds){const cloud=smooth(.12,.85,sample(clouds,u+frame.rotation*1.045+.015+(config.activity===1?time*.0008+cloudFlow*Math.sin(v*20):0),v)[0])*.86;color=color.map((c,i)=>c*(1-cloud)+[.92,.96,1][i]*lighting*cloud);}
    const rim=geometry[gi+4];color=color.map((c,i)=>c+config.atmosphere[i]*rim);alpha=1;
   }else if(config.star||config.atmosphere.some(c=>c>0)){
    alpha=Math.exp(-(Math.sqrt(rr)-1)*(config.star?11:34))*.36;color=[...config.atmosphere];
   }
   if(rings&&Math.abs(ray[1])>.001){const origin=orient(px,py,4),t=-origin[1]/ray[1],hit=origin.map((p,i)=>p+ray[i]*t),r=Math.hypot(hit[0],hit[2]);
    if(t>0&&r>1.22&&r<2.24&&t<sphereT){const ring=sample(rings,(r-1.22)/1.02,.5),projection=hit.reduce((sum,p,i)=>sum+p*localLight[i],0);
     const distance=Math.hypot(...hit.map((p,i)=>p-localLight[i]*projection)),shadow=projection<0?1-smooth(.96,1.06,distance):0,ra=ring[3]*.94;
     const rc=ring.slice(0,3).map((c,i)=>frame.illustrated?c*(.87-.65*shadow)*.82+[.95,.83,.61][i]*.18:c*(.87-.65*shadow));
     const nextAlpha=ra+alpha*(1-ra);color=color.map((c,i)=>(rc[i]*ra+c*alpha*(1-ra))/Math.max(.001,nextAlpha));alpha=nextAlpha;
    }
   }
   const offset=(y*size+x)*4;for(let i=0;i<3;i++)pixels.data[offset+i]=Math.max(0,Math.min(255,Math.round(color[i]*255)));pixels.data[offset+3]=Math.round(alpha*255);
  }
  ctx!.putImageData(pixels,0,0);
 }};
}
