import type {PlanetFrame} from "./planet-renderer";
/** Software projection for devices without WebGL. Still a sphere, with UV
 * rotation and depth-tested rings. Host caps it at 288px/12fps (224px constrained). */
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
    if(rr>1){
     geometry[i]=Math.atan2(py,px);geometry[i+1]=Math.sqrt(rr)-1;
     geometry[i+2]=Math.exp(-geometry[i+1]*(config.star?11:34))*.36;continue;
    }
    const z=Math.sqrt(1-rr),n=orient(px,py,z),diffuse=px*light[0]+py*light[1]+z*light[2];
    geometry[i]=1-Math.atan2(n[2],n[0])/(2*Math.PI);geometry[i+1]=Math.acos(Math.max(-1,Math.min(1,n[1])))/Math.PI;
    geometry[i+2]=z;geometry[i+3]=diffuse;geometry[i+4]=Math.pow(1-z,3.2)*(.35+.65*Math.max(0,diffuse))*.65;
   }
  }
  const time=frame.time??0,flow=.014*Math.sin(time*.05),cloudFlow=.003*Math.sin(time*.12);
  // Precompute event state once per frame, not once per pixel. No particles/maps.
  const prominences=config.star&&config.activity===3?[0,1,2].map(site=>{
   const phase=((time/14+.18+site*.33)%1+1)%1,life=Math.sin(Math.PI*phase);
   return {centre:-.35+site*2.05+.06*Math.sin(time*.05+site),width:.10+.09*phase,height:.04+.20*life,strength:life*life};
  }):[];
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const px=((x+.5)/size*2-1)*scale,py=(1-(y+.5)/size*2)*scale,rr=px*px+py*py;
   let color=[0,0,0],alpha=0,sphereT=100;
   if(rr<=1){
    const gi=(y*size+x)*5,u=geometry[gi],v=geometry[gi+1],z=geometry[gi+2];sphereT=4-z;
    let tex=sample(surface!,u+frame.rotation+(config.activity===2?flow*Math.sin(v*55):0),v);
    if(config.activity===3){const shimmer=.88+.12*Math.sin(time*.65+(u+frame.rotation)*31.4159265+v*16)*Math.sin(v*38-time*.4);tex=tex.map(c=>c*shimmer);}
    const diffuse=Math.max(0,geometry[gi+3]);
    let lighting=.12+.95*Math.pow(diffuse,.8);
    if(frame.illustrated){const lum=tex[0]*.299+tex[1]*.587+tex[2]*.114;const paper=(Math.sin(Math.floor(u*1600)*127.1+Math.floor(v*1600)*311.7)*43758.5453)%1;
     tex=tex.map((c,i)=>((lum+(c-lum)*1.22)*.88+[1,.91,.75][i%3]*.12)*(.94+.12*Math.abs(paper)));
     lighting=.35+.65*smooth(-.12,.8,geometry[gi+3]);lighting=lighting*.78+Math.floor(lighting*7)/7*.22;}
    color=tex.slice(0,3).map(c=>c*(config.star?1.15:lighting));
    if(clouds){
     const cloudU=u+frame.rotation*1.045+.015+(config.activity===1?time*.0008+cloudFlow*Math.sin(v*20):0);
     let density=sample(clouds,cloudU,v)[0];
     if(config.activity===1)density*=.72+.4*Math.sin(cloudU*18.8495559+v*18+time*.38)*Math.sin(cloudU*43.9822972-v*11-time*.23);
     const cloud=smooth(.12,.85,density)*.86;color=color.map((c,i)=>c*(1-cloud)+[.92,.96,1][i]*lighting*cloud);
    }
    const rim=geometry[gi+4];color=color.map((c,i)=>c+config.atmosphere[i]*rim);alpha=1;
   }else if(config.star||config.atmosphere.some(c=>c>0)){
    const gi=(y*size+x)*5,distance=geometry[gi+1];
    alpha=geometry[gi+2];color=[...config.atmosphere];
    if(prominences.length){
     const theta=geometry[gi];let plasma=0;
     for(const event of prominences){
      let delta=theta-event.centre;if(delta>Math.PI)delta-=2*Math.PI;else if(delta< -Math.PI)delta+=2*Math.PI;
      const q=delta/event.width;
      if(Math.abs(q)>=1)continue;
      const arch=event.height*Math.max(0,1-q*q),d=Math.abs(distance-arch);
      const plume=.18*(1-Math.abs(q))*Math.max(0,1-distance/(event.height+.03));
      plasma+=(Math.max(0,1-d/.017)*.78+.32/(1+1600*d*d)+plume)*event.strength*(1-smooth(.98,1,Math.abs(q)));
     }
     plasma=Math.min(.95,plasma);const heat=Math.min(1,plasma*1.5),hot=[1,.18+.54*heat,.025+.195*heat],nextAlpha=plasma+alpha*(1-plasma);
     color=color.map((c,i)=>(hot[i]*plasma+c*alpha*(1-plasma))/Math.max(.001,nextAlpha));alpha=nextAlpha;
    }
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
