import {ELECTRON_CONFIGURATIONS} from "./electron-configurations.generated";
export interface AtomicSubshell { id:string; n:number; l:number; electrons:number; }
/** Reference neutral configurations, not an Aufbau approximation or ionic model. */
export function electronConfiguration(symbol:string):AtomicSubshell[]{
  const raw=ELECTRON_CONFIGURATIONS[symbol]??"";
  const core=raw.match(/\[([A-Z][a-z]?)\]/)?.[1];
  return [...(core?electronConfiguration(core):[]),...Array.from(raw.matchAll(/([1-7])([spdf])(\d+)/g),m=>({id:m[1]+m[2],n:Number(m[1]),l:"spdf".indexOf(m[2]),electrons:Number(m[3])}))].sort((a,b)=>a.n-b.n||a.l-b.l);
}
export function selectedSubshell(symbol:string,id?:string){
  const shells=electronConfiguration(symbol);
  return shells.find(s=>s.id===id)??[...shells].reverse().find(s=>s.electrons<2*(2*s.l+1))??shells[shells.length-1];
}
/** Generalized Laguerre recurrence; hydrogenic radial wavefunction, Z=1, a0=1.
 * Overall normalization is omitted because the drawing uses relative |ψ|².
 * NIST DLMF §18.39(ii), §14.30. A one-electron basis, NOT the selected atom's total density. */
export function hydrogenicRadial(n:number,l:number,r:number){
  const x=2*r/n,k=n-l-1,alpha=2*l+1;let p=1,q=1+alpha-x;
  for(let i=2;i<=k;i++){const next=((2*i-1+alpha-x)*q-(i-1+alpha)*p)/i;p=q;q=next;}
  return Math.exp(-x/2)*x**l*(k===0?1:q);
}
export function orbitalAmplitude(n:number,l:number,x:number,z:number){
  const r=Math.hypot(x,z),c=r?z/r:0;
  const angular=[1,c,(3*c*c-1)/2,(5*c*c*c-3*c)/2][l];
  return hydrogenicRadial(n,l,r)*angular;
}
function connectedContours(segments:Array<[string,string]>){
  const links=new Map<string,Set<string>>();
  for(const [a,b] of segments){if(!links.has(a))links.set(a,new Set());if(!links.has(b))links.set(b,new Set());links.get(a)!.add(b);links.get(b)!.add(a);}
  const paths:string[]=[];
  for(const [start,neighbors] of links)while(neighbors.size){
    const points=[start];let current=start;
    for(let guard=0;guard<=segments.length;guard++){
      const next=links.get(current)?.values().next().value as string|undefined;if(!next)break;
      links.get(current)!.delete(next);links.get(next)!.delete(current);points.push(next);current=next;if(current===start)break;
    }
    paths.push(`M${points.join("L")}${current===start?"Z":""}`);
  }
  return paths.join("");
}
/** Deterministic marching squares in an xz cross-section, m=0. Relative contours
 * are NOT probability enclosures, physical atom boundaries or electron paths. */
export function orbitalContours(n:number,l:number){
  const cells=64,extent=2.6*n*n,step=extent*2/cells,values:number[][]=[];let max=0;
  for(let j=0;j<=cells;j++){const row=[];for(let i=0;i<=cells;i++){const a=orbitalAmplitude(n,l,(i-cells/2)*step,(j-cells/2)*step);row.push(a);max=Math.max(max,a*a);}values.push(row);}
  const contours=[];
  for(const sign of [1,-1])for(const level of [.018,.055,.13,.27,.48,.74]){
    const cutoff=Math.sqrt(max*level),segments:Array<[string,string]>=[];
    for(let j=0;j<cells;j++)for(let i=0;i<cells;i++){
      const corners=[[i,j],[i+1,j],[i+1,j+1],[i,j+1]],cross:number[][]=[];
      for(let e=0;e<4;e++){
        const a=corners[e],b=corners[(e+1)%4],va=sign*values[a[1]][a[0]]-cutoff,vb=sign*values[b[1]][b[0]]-cutoff;
        if((va>=0)===(vb>=0))continue;
        const t=va/(va-vb);cross.push([(a[0]+t*(b[0]-a[0])-cells/2)*4.8,-(a[1]+t*(b[1]-a[1])-cells/2)*4.8]);
      }
      for(let c=0;c+1<cross.length;c+=2)segments.push([cross[c].map(v=>v.toFixed(2)).join(" "),cross[c+1].map(v=>v.toFixed(2)).join(" ")]);
    }
    if(segments.length)contours.push({sign,level,path:connectedContours(segments)});
  }
  return contours;
}
