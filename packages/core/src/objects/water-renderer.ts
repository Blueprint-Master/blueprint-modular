import {WATER_PERIOD,type WaterId,type WaterStyle} from "./water";
const TAU=Math.PI*2;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
const pulse=(phase:number,at:number,width:number)=>Math.exp(-Math.pow(Math.sin((phase-at)*Math.PI)/width,2));
type Shade={alpha:number;depth:number;foam:number;glint:number;ink:number};
export interface WaterTexture{data:Uint8ClampedArray;width:number;height:number}
const grain=(x:number,y:number,t:number)=>.5+
 .22*Math.sin(x*17+y*11+t)+.15*Math.sin(x*39-y*23-t*.7)+.08*Math.sin(x*83+y*47+t*.3);

/** Samples the evolving material at normalized coordinates. Exported for deformation tests. */
export function waterSample(id:WaterId,x:number,y:number,time:number):Shade{
 const phase=((Number.isFinite(time)?time:0)%WATER_PERIOD+WATER_PERIOD)%WATER_PERIOD/WATER_PERIOD,t=phase*TAU;
 if(id==="water-wave"){
  const grow=.28+.72*pulse(phase,.42,.72),center=-.24+.13*Math.sin(t),dx=x-center,n=grain(x,y,t*.22);
  const face=.30+.06*Math.sin(x*4.2-t*.55)-.48*grow*Math.exp(-dx*dx/.16);
  const curlX=center+.29*grow,curlY=face-.025-.13*grow,r=Math.hypot((x-curlX)/1.03,(y-curlY)/.78);
  const body=smooth(face-.045,face+.025,y)*(1-smooth(.77,.94,Math.abs(x)))*(1-smooth(.66,.94,y));
  const lip=smooth(.40,.31,r)*smooth(.13,.23,r)*smooth(-.06,.20,curlX-x)*grow;
  const spray=pulse(phase,.48,.48)*clamp(.55+.45*Math.sin(x*71+y*53))*smooth(.48,.09,Math.hypot((x-curlX-.05)/.65,(y-curlY+.20)/.85));
  const alpha=clamp(body+lip+spray*.42),foam=clamp((1-smooth(.012,.072,Math.abs(y-face)))*(.32+.68*grow)+lip*1.15+spray*.75);
  return {alpha,depth:clamp(.17+.45*(y-face)+.25*n+.18*lip),foam,glint:clamp(.22*n+.58*foam),ink:face+n*.08};
 }
 if(id==="water-ripple"){
  const r=Math.hypot(x,y/.70),edge=1-smooth(.78,.94,r),impact=pulse(phase,.20,.62),travel=(phase+.16)%1,n=grain(x,y,t*.18);
  const rings=Math.sin((r-travel*.68)*24)*Math.exp(-Math.pow((r-(.12+travel*.68))/.23,2));
  const crownR=.08+.10*impact,cr=Math.hypot(x,y/.75),crown=(1-smooth(.018,.052,Math.abs(cr-crownR)))*impact;
  const alpha=clamp(edge+crown),foam=clamp(Math.max(0,rings)*edge*.45+crown*.8);
  return {alpha,depth:clamp(.35+.20*rings-.22*crown+.15*n),foam,glint:clamp(.16*n+.48*Math.max(0,rings)+.30*crown),ink:rings+n*.2};
 }
 if(id==="water-waterfall"){
  const basin=Math.hypot(x/1.02,(y-.67)/.27),pool=1-smooth(.72,.98,basin),n=grain(x,y,t*.35);
  const wobble=.052*Math.sin(y*8+t)+.034*Math.sin(y*19-t*.6),width=.36+.055*Math.sin(y*5-t*.7)+.022*Math.sin(y*21+t);
  const stream=(1-smooth(width-.035,width+.045,Math.abs(x-wobble)))*smooth(-.84,-.69,y)*smooth(.67,.52,y);
  const braid=clamp(.44+.32*Math.sin((x-wobble)*32+y*11-t*1.5)+.24*n),impact=Math.exp(-Math.pow((y-.53)/.13,2))*Math.exp(-Math.pow(x/.43,2));
  const mist=impact*clamp(.25+.45*n);
  const alpha=clamp(pool+stream+mist*.34),foam=clamp(impact*.88+pool*Math.max(0,Math.sin(basin*25-t))*.28);
  return {alpha,depth:clamp(.18+.47*braid+.20*pool-.12*mist),foam,glint:clamp(stream*(.10+.45*braid)+foam*.36),ink:braid+n*.14};
 }
 const r=Math.hypot(x,y/.72),a=Math.atan2(y/.72,x),edge=1-smooth(.79,.96,r),breath=.12+.045*Math.sin(t),n=grain(x,y,t*.16);
 const hole=smooth(breath+.085,breath-.018,r),spiral=Math.sin(a*3-r*18+t*.92),arm=Math.pow(clamp(.5+.5*spiral),6)*smooth(.10,.25,r)*edge;
 const alpha=clamp(edge-hole*.98),foam=clamp(arm*.35*(1-smooth(.70,.91,r))+.22*smooth(.27,.12,r));
 return {alpha,depth:clamp(.46-.52*Math.exp(-r*4)+.12*spiral+.15*n),foam,glint:clamp(.10+.30*arm+.16*n),ink:spiral+n*.3};
}

/** Bounded, reusable RGBA field. Transparent outside the phenomenon; no DOM, network or random state. */
export function createWaterField(size:number,texture?:WaterTexture){
 if(!Number.isInteger(size)||size<16||size>512)throw Error("Invalid water resolution");
 const pixels=new Uint8ClampedArray(size*size*4);
 return {draw(id:WaterId,style:WaterStyle,time:number){
  pixels.fill(0);
  for(let py=0;py<size;py++)for(let px=0;px<size;px++){
   const x=(px+.5)/size*2-1,y=(py+.5)/size*2-1,s=waterSample(id,x,y,time);if(s.alpha<.012)continue;
   const edge=Math.min(1,s.alpha*5),paper=style==="illustration"?.92+.08*grain(x,y,0):1;
   const tone=style==="illustration"?Math.floor(s.depth*8)/8:s.depth;
   const deep=id==="water-whirlpool"?[.015,.075,.16]:id==="water-waterfall"?[.018,.18,.31]:[.015,.14,.28];
   const light=style==="illustration"?[.12,.66,.79]:[.10,.70,.88];
   let rr=(deep[0]+(light[0]-deep[0])*tone)*paper,gg=(deep[1]+(light[1]-deep[1])*tone)*paper,bb=(deep[2]+(light[2]-deep[2])*tone)*paper;
   const shine=(style==="illustration"?.30:.72)*s.glint,foam=Math.pow(s.foam,style==="illustration"?.9:1.18);
   rr+=shine*.18+foam*.68;gg+=shine*.31+foam*.76;bb+=shine*.43+foam*.80;
   if(style==="illustration"){const contour=(1-edge)*.30+.025*(.5+.5*Math.sin(s.ink*15));rr-=contour;gg-=contour;bb-=contour*.62;}
   if(texture){const loop=((Number.isFinite(time)?time:0)%WATER_PERIOD)*TAU/WATER_PERIOD,drift=(id==="water-waterfall"?.032:.010)*Math.sin(loop),warp=.025*Math.sin(y*8+loop);const tx=((Math.floor((x*.5+.5+warp)*texture.width)%texture.width)+texture.width)%texture.width,ty=((Math.floor((y*.5+.5+drift)*texture.height)%texture.height)+texture.height)%texture.height,q=(ty*texture.width+tx)*4,mix=style==="illustration"?.68:.72;
    rr=rr*(1-mix)+texture.data[q]/255*mix;gg=gg*(1-mix)+texture.data[q+1]/255*mix;bb=bb*(1-mix)+texture.data[q+2]/255*mix;rr+=foam*.35;gg+=foam*.38;bb+=foam*.36;}
   const k=(py*size+px)*4;pixels[k]=255*clamp(rr);pixels[k+1]=255*clamp(gg);pixels[k+2]=255*clamp(bb);pixels[k+3]=255*clamp(s.alpha*(style==="illustration"?.96:.90));
  }
  return pixels;
 }};
}
