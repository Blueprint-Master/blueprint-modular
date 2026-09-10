import {FORM_PERIOD,type FormId,type FormStyle} from "./forms";
type V = readonly [number,number,number];
const TAU=Math.PI*2;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
function unit(v:V):V {const d=Math.hypot(...v)||1;return [v[0]/d,v[1]/d,v[2]/d];}
function cross(a:V,b:V):V{return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function sub(a:V,b:V):V{return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
/** A fixed camera: all visible motion comes from local surface deformation. */
function camera(p:V):V {const y=p[1]*.68-p[2]*.73,z=p[1]*.73+p[2]*.68;return [p[0]*.96-y*.28,p[0]*.28+y*.96,z];}
export function formPoint(id:FormId,u:number,v:number,time:number):V {
  const t=((Number.isFinite(time)?time:0)%FORM_PERIOD)*TAU/FORM_PERIOD,a=u*TAU;
  if(id==="form-silk"){
    const across=(v-.5)*(.7+.35*Math.sin(u*Math.PI)),bend=u*TAU*.8-2.4;
    return [(u-.5)*1.55+.12*Math.sin(v*TAU+t),.26*Math.sin(bend)+across*Math.cos(bend*.8+.35*Math.sin(t)),.24*Math.cos(bend-t)+across*Math.sin(bend*.8+.35*Math.sin(t))+.045*Math.sin(v*TAU*3+t)*Math.sin(u*Math.PI)];
  }
  if(id==="form-loop"){
    const b=v*TAU,r=.52+.07*Math.sin(a*3)*Math.cos(t)+.045*Math.cos(a*2)*Math.sin(t),w=.145*(1+.28*Math.sin(a*2-t));
    return [(r+w*Math.cos(b))*Math.cos(a),(r+w*Math.cos(b))*Math.sin(a),w*Math.sin(b)+.12*Math.sin(a*2-t)];
  }
  const r=.008+v*.79;
  if(id==="form-shell"){
    const fold=.085*Math.cos(a*5+t)*v*v,edge=r+fold;
    return [edge*Math.cos(a),edge*Math.sin(a),.25*(1-v)+.18*Math.sin(a*5+t)*v*v+.12*Math.cos(a*2-t)*v];
  }
  // Smoothly enveloped concentric wave: crests grow, travel and flatten at the edge.
  return [r*Math.cos(a),r*Math.sin(a),.15*Math.sin(v*TAU*2-t)*Math.sin(v*Math.PI)+.025*Math.cos(a*3+t)*v];
}
interface Vertex {x:number;y:number;z:number;n:V}
/** Reusable bounded software renderer. No textures, random state, network or DOM.
 * Shared frame/depth buffers; smooth interpolated normals; true surface occlusion.
 * Photo style is a studio-lit synthetic material, not a documentary photograph. */
export function createFormField(size:number){
  if(!Number.isInteger(size)||size<16||size>512)throw Error("Invalid form resolution");
  const pixels=new Uint8ClampedArray(size*size*4),depth=new Float32Array(size*size);
  const rows=size<=224?32:44,cols=size<=224?64:88;
  const vertices:Vertex[]=Array.from({length:(rows+1)*(cols+1)},()=>({x:0,y:0,z:0,n:[0,0,1]}));
  const keyLight=unit([-.45,-.6,1]),half=unit([keyLight[0],keyLight[1],keyLight[2]+1]);
  function triangle(a:Vertex,b:Vertex,c:Vertex,id:FormId,style:FormStyle){
    const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);if(Math.abs(area)<.00001)return;
    const left=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),right=Math.min(size-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const top=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),bottom=Math.min(size-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){
      const px=x+.5,py=y+.5,w1=((b.x-px)*(c.y-py)-(b.y-py)*(c.x-px))/area;
      const w2=((c.x-px)*(a.y-py)-(c.y-py)*(a.x-px))/area,w3=1-w1-w2;
      if(w1<-.00001||w2<-.00001||w3<-.00001)continue;
      const z=a.z*w1+b.z*w2+c.z*w3,index=y*size+x;if(z<=depth[index])continue;depth[index]=z;
      let nx=a.n[0]*w1+b.n[0]*w2+c.n[0]*w3,ny=a.n[1]*w1+b.n[1]*w2+c.n[1]*w3,nz=a.n[2]*w1+b.n[2]*w2+c.n[2]*w3;
      const length=Math.hypot(nx,ny,nz)||1,face=nz<0?-1:1;nx=nx/length*face;ny=ny/length*face;nz=nz/length*face;
      let diffuse=clamp(nx*keyLight[0]+ny*keyLight[1]+nz*keyLight[2]);
      let spec=Math.pow(clamp(nx*half[0]+ny*half[1]+nz*half[2]),style==="illustration"?12:54);
      const pearl=Math.pow(1-nz,2),rim=clamp(nx*.7+ny*.2+nz*.2);
      if(style==="illustration"){diffuse=Math.floor(diffuse*7)/7;spec*=.25;}
      const palette:V=id==="form-silk"?[.74,.23,.32]:id==="form-shell"?[.76,.64,.47]:id==="form-loop"?[.06,.53,.49]:[.14,.33,.75];
      const base=.17+.76*diffuse,ink=style==="illustration"?(.97+.03*Math.sin(x*1.3+y*.8)):1;
      const k=index*4;
      pixels[k]=255*clamp((palette[0]*base+.80*spec+.10*pearl+.06*rim)*ink);
      pixels[k+1]=255*clamp((palette[1]*base+.88*spec+.15*pearl+.14*rim)*ink);
      pixels[k+2]=255*clamp((palette[2]*base+.94*spec+.25*pearl+.16*rim)*ink);pixels[k+3]=255;
    }
  }
  return {draw(id:FormId,style:FormStyle,time:number){
    pixels.fill(0);depth.fill(-Infinity);
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
      const u=i/cols,v=j/rows,p=formPoint(id,u,v,time),n=camera(unit(cross(sub(formPoint(id,u+.0001,v,time),p),sub(formPoint(id,u,v+.0001,time),p)))),q=camera(p);
      const vertex=vertices[j*(cols+1)+i];vertex.x=(.5+q[0]*.49)*size;vertex.y=(.5-q[1]*.49)*size;vertex.z=q[2];vertex.n=n;
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const k=j*(cols+1)+i,a=vertices[k],b=vertices[k+1],c=vertices[k+cols+1],d=vertices[k+cols+2];
      triangle(a,b,c,id,style);triangle(b,d,c,id,style);
    }
    return pixels;
  }};
}
