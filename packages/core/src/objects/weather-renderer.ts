import type {WeatherId,WeatherStyle} from "./weather";

const TAU=Math.PI*2;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const smooth=(n:number)=>{const x=clamp(n);return x*x*(3-2*x);};
const hash=(x:number,y:number)=>{let h=Math.imul(x,374761393)+Math.imul(y,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967295;};
function noise(x:number,y:number){const ix=Math.floor(x),iy=Math.floor(y),a=smooth(x-ix),b=smooth(y-iy);return (hash(ix,iy)*(1-a)+hash(ix+1,iy)*a)*(1-b)+(hash(ix,iy+1)*(1-a)+hash(ix+1,iy+1)*a)*b;}
function fbm(x:number,y:number){return noise(x,y)*.57+noise(x*2.03,y*2.03)*.26+noise(x*4.1,y*4.1)*.12+noise(x*8.3,y*8.3)*.05;}

/** Locally deforming cloud material with condensing/evaporating edges.
 * Noise is cached once; every frame recomputes advection and optical density.
 * No video, particle allocation or GPU context. RGBA is reusable
 * in the browser and the deterministic poster/animation proof generator. */
export interface WeatherTexture {data:Uint8ClampedArray;width:number;height:number}
export function createWeatherField(size:number,texture?:WeatherTexture) {
  const n=Math.max(48,Math.min(512,Math.round(size))),count=n*n;
  const grain=new Float32Array(count),detail=new Float32Array(count),sunRadius=new Float32Array(count),sunAngle=new Float32Array(count);
  const rgba=new Uint8ClampedArray(count*4);
  // Cache a branching discharge as a distance field. MAX coverage, never repeated
  // alpha stamps: overlapping segments must not turn a thin channel into neon tubing.
  let discharge:Float32Array|undefined;
  const lightning=()=>{
    if(discharge)return discharge;
    const field=new Float32Array(count*2),trunk:number[][]=[];discharge=field;
    const trace=(ax:number,ay:number,bx:number,by:number,seed:number,power:number,depth:number)=>{
      if(depth){const jitter=(hash(seed,depth)-.5)*Math.hypot(bx-ax,by-ay)*.65;const mx=(ax+bx)/2+jitter,my=(ay+by)/2;trace(ax,ay,mx,my,seed*2,power,depth-1);trace(mx,my,bx,by,seed*2+1,power,depth-1);return;}
      if(power===1)trunk.push([ax,ay]);
      const vx=(bx-ax)*n,vy=(by-ay)*n,length=vx*vx+vy*vy,radius=Math.max(2,n*.012);
      for(let y=Math.max(1,Math.floor(ay*n-radius));y<Math.min(n-1,Math.ceil(by*n+radius));y++)for(let x=Math.max(1,Math.floor(Math.min(ax,bx)*n-radius));x<Math.min(n-1,Math.ceil(Math.max(ax,bx)*n+radius));x++){
        const u=clamp(((x-ax*n)*vx+(y-ay*n)*vy)/Math.max(.001,length)),dx=x-ax*n-u*vx,dy=y-ay*n-u*vy,d=Math.hypot(dx,dy),k=(y*n+x)*2;
        const width=Math.max(.32,n*.0017)*power;
        field[k]=Math.max(field[k],clamp(width+.55-d)*power);
        field[k+1]=Math.max(field[k+1],Math.exp(-d*d/(n*n*.000018))*power*.22);
      }
    };
    trace(.55,.42,.45,.80,71,1,6);
    trace(trunk[17][0],trunk[17][1],.64,.67,83,.55,5);trace(trunk[34][0],trunk[34][1],.36,.74,97,.42,5);
    trace(trunk[12][0],trunk[12][1],.62,.63,43,.22,4);trace(trunk[49][0],trunk[49][1],.50,.83,29,.24,4);
    return field;
  };
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x;grain[k]=fbm(x/n*17+9,y/n*17+4)-.5;detail[k]=fbm(x/n*53+7,y/n*53+11)-.5;sunRadius[k]=Math.hypot(x/n-.66,y/n-.32);sunAngle[k]=Math.atan2(y/n-.32,x/n-.66);}
  const composite=(k:number,r:number,g:number,b:number,a:number)=>{
    const p=k*4,back=rgba[p+3]/255,out=a+back*(1-a);if(out<=0)return;
    rgba[p]=(r*a+rgba[p]*back*(1-a))/out;rgba[p+1]=(g*a+rgba[p+1]*back*(1-a))/out;rgba[p+2]=(b*a+rgba[p+2]*back*(1-a))/out;rgba[p+3]=255*out;
  };
  return {size:n,draw(id:WeatherId,style:WeatherStyle,time=0,detailed=true){
    const t=Number.isFinite(time)?((time%24)+24)%24:0,phase=t/24*TAU,paint=style==="illustration";
    const fair=id==="weather-fair",storm=id==="weather-storm",rain=id==="weather-rain",snow=id==="weather-snow";
    const age=(t-1+24)%24,energy=storm&&detailed&&age<1.8?smooth(age/.10)*Math.pow(1-age/1.8,2):0;
    rgba.fill(0);
    // Atmospheric sun: refractive streamers grow and dissolve, no astrophysical
    // explosions in a terrestrial weather object. Eclipsed by clouds for fair sky.
    if(fair){
      const radius=.14;
      for(let y=0;y<n;y++)for(let x=0;x<n;x++){
        const k=y*n+x,r=sunRadius[k],a=sunAngle[k];if(r>radius*1.75)continue;
        const streamer=Math.pow(Math.max(0,Math.sin(a*7+Math.sin(a*3-phase)*1.3+phase)),12);
        const spread=radius*(1.28+.45*streamer*(.5+.5*Math.sin(phase*3+a)));
        const corona=Math.exp(-Math.max(0,r-radius)*29)*(r<spread?smooth((spread-r)*22):0)*.45;
        const disc=smooth((radius-r)*n*.8),edge=clamp(r/radius);
        const glint=grain[k]*16+(paint?detail[k]*40:0);
        composite(k,255,disc?247-edge*65+glint:188,disc?204-edge*145+glint:61,Math.max(disc,corona));
      }
    }
    if(texture){
      const cy=(rain||snow||storm)?.35:fair?.52:.47,scaleY=id==="weather-overcast"?.75:storm?1.05:.9;
      const {data,width:w,height:h}=texture;
      // Two local updrafts open and close the silhouette. Condensation changes
      // alpha locally, including the cloud interior; this is not UV scrolling.
      const updraft=Math.sin(phase*3),eddy=Math.cos(phase*2);
      for(let y=1;y<n-1;y++)for(let x=1;x<n-1;x++){
        const k=y*n+x,u=x/n-.5,v=y/n-cy;
        const left=Math.exp(-((u+.2)*(u+.2)*35+(v+.02)*(v+.02)*12));
        const right=Math.exp(-((u-.22)*(u-.22)*40+(v+.02)*(v+.02)*15));
        const tx=(u/.87+.5+.035*left*updraft-.024*right*eddy)*w;
        const ty=(v/scaleY+.5+.048*left*updraft+.036*right*eddy)*h;
        const ix=Math.floor(tx),iy=Math.floor(ty);if(ix<0||iy<0||ix>=w-1||iy>=h-1)continue;
        const a=tx-ix,b=ty-iy,p=(iy*w+ix)*4,channels=[0,0,0,0];
        for(let c=0;c<4;c++)channels[c]=(data[p+c]*(1-a)+data[p+4+c]*a)*(1-b)+(data[p+w*4+c]*(1-a)+data[p+w*4+4+c]*a)*b;
        const local=smooth((grain[k]*2+.42*Math.sin(phase*3+u*9+v*6)+.65)*1.4);
        const density=(fair?.38:.72)+(fair?.62:.28)*local;
        const shade=storm?.58:rain?.78:1;
        const illumination=energy*Math.exp(-((u-.035)*(u-.035)*95+(v-.085)*(v-.085)*65))*(.32+.38*local);
        composite(k,channels[0]*shade+illumination*140,channels[1]*shade+illumination*133,channels[2]*(shade+.03)+illumination*145,channels[3]/255*density);
      }
    }
    // Analytic drops/snow: fixed count, deterministic birth/fall/fade.
    if(rain||storm||snow){
      const flakes=snow?27:storm?38:32;
      for(let i=0;i<flakes;i++){
        const lifetime=snow?8:2,age=((t/lifetime+hash(i,7))%1),birth=smooth(age*12),fade=smooth((1-age)*8);
        const x0=.23+hash(i,11)*.54,y0=.51+age*.32;
        const px=(x0+(snow?Math.sin(phase*3+i+age*4)*.033:-age*.045))*n,py=y0*n;
        const length=snow?1.5:5+hash(i,4)*5,alpha=birth*fade*(snow?.92:.58);
        for(let y=Math.floor(py-length);y<=py+2;y++)for(let x=Math.floor(px-3);x<=px+3;x++){
          if(x<1||x>=n-1||y<1||y>=n-1)continue;
          const dx=x-px+(snow?0:(y-py)*-.12),dy=y-py;
          const weight=snow?Math.exp(-(dx*dx+dy*dy)/(1.2+hash(i,8)*2)):Math.exp(-dx*dx*1.6)*smooth((dy+length)/length);
          if(snow)composite(y*n+x,83,111,153,clamp(Math.exp(-(dx*dx+dy*dy)/5)*alpha*.55));
          composite(y*n+x,snow?240:85,snow?248:150,snow?255:209,clamp(weight*alpha));
        }
      }
    }
    // One branching discharge / 24s in detail only, never a full-screen flash.
    // A growing channel then a smooth afterglow (no strobe/repeated flashes).
    if(energy>0){
      const field=lightning();
      for(let y=Math.floor(n*.42);y<n*.85;y++)for(let x=Math.floor(n*.28);x<n*.72;x++){
        const k=y*n+x,reveal=smooth((age*6-(y/n-.42))*30),occlusion=smooth((y/n-.43)/.12);
        const strength=energy*reveal*occlusion;
        composite(k,paint?177:192,paint?181:197,paint?200:215,field[k*2+1]*strength);
        composite(k,250,248,255,field[k*2]*strength);
      }
    }
    return rgba;
  }};
}
