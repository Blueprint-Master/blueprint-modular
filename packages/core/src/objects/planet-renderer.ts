/** A real textured sphere and ray/plane rings. Rotation changes spherical UVs,
 * never the canvas or its lighting. Browser-only, owned and disposed by PlanetObject. */
export const PLANET_VERTEX = `attribute vec2 position; varying vec2 uv;
void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
export const PLANET_FRAGMENT = `
precision highp float;
varying vec2 uv;
uniform sampler2D surfaceMap, cloudsMap, ringMap;
uniform float rotation, tilt, pitch, ringed, atmosphere, star, earth, illustrated;
uniform vec3 atmosphereColor;
const float PI=3.14159265359;
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);}
mat3 rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0.,-s,c,0.,0.,0.,1.);}
// Camera sees +Z: longitude must increase left to right. Preserve the central meridian.
vec2 sphereUV(vec3 n,float turn){return vec2(fract(1.-atan(n.z,n.x)/(2.*PI)+turn),acos(clamp(n.y,-1.,1.))/PI);}
float grain(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
 float scale=mix(1.30,2.55,ringed);
 vec2 p=uv*scale;
 float rr=dot(p,p);
 mat3 orient=rx(pitch)*rz(tilt);
 vec3 origin=orient*vec3(p,4.);
 vec3 ray=orient*vec3(0.,0.,-1.);
 vec3 light=normalize(vec3(-.65,.5,1.2));
 vec3 color=vec3(0.); float alpha=0.; float sphereT=100.;
 if(rr<=1.){
   vec3 normal=vec3(p,sqrt(1.-rr));
   sphereT=4.-normal.z;
   vec3 n=orient*normal;
   vec2 st=sphereUV(n,rotation);
   vec3 tex=texture2D(surfaceMap,st).rgb;
   float diffuse=max(dot(normal,light),0.);
   float lighting=.12+.95*pow(diffuse,.8);
   if(illustrated>.5){
     float lum=dot(tex,vec3(.299,.587,.114));
     tex=mix(vec3(lum),tex,1.22);
     tex=mix(tex,vec3(1.,.91,.75),.12);
     lighting=.35+.65*smoothstep(-.12,.8,dot(normal,light));
     float paper=grain(floor(st*1600.));
     tex*=.94+.12*paper;
     lighting=mix(lighting,floor(lighting*7.)/7.,.22);
   }
   color=tex*mix(lighting,1.15,star);
   if(earth>.5){
     float clouds=texture2D(cloudsMap,sphereUV(n,rotation*1.045+.015)).r;
     clouds=smoothstep(.12,.85,clouds)*.86;
     color=mix(color,vec3(.92,.96,1.)*lighting,clouds);
     float ocean=step(tex.r*1.15,tex.b)*step(tex.g*.9,tex.b);
     color+=vec3(.5,.7,1.)*pow(max(dot(reflect(-light,normal),vec3(0.,0.,1.)),0.),38.)*.35*ocean;
   }
   float rim=pow(1.-normal.z,3.2)*(.35+.65*diffuse)*atmosphere;
   color+=atmosphereColor*rim*.65;
   alpha=1.;
 }else if(atmosphere>0.||star>.5){
   float distance=sqrt(rr)-1.;
   float glow=exp(-distance*mix(34.,11.,star))*.36;
   color=atmosphereColor;
   alpha=glow*max(atmosphere,star);
 }
 if(ringed>.5&&abs(ray.y)>.001){
   float t=-origin.y/ray.y;
   vec3 hit=origin+ray*t;
   float r=length(hit.xz);
   if(t>0.&&r>1.22&&r<2.24&&t<sphereT){
     vec4 rings=texture2D(ringMap,vec2((r-1.22)/1.02,.5));
     vec3 localLight=orient*light;
     float projection=dot(hit,localLight);
     float shadow=1.-smoothstep(.96,1.06,length(hit-localLight*projection));
     shadow*=step(projection,0.);
     vec3 rc=rings.rgb*(.87-.65*shadow);
     if(illustrated>.5)rc=mix(rc,vec3(.95,.83,.61),.18);
     float ra=rings.a*.94;
     color=(rc*ra+color*alpha*(1.-ra))/max(.001,ra+alpha*(1.-ra));
     alpha=ra+alpha*(1.-ra);
   }
 }
 gl_FragColor=vec4(color,alpha);
}`;

export interface PlanetFrame { rotation: number; tilt: number; pitch: number; illustrated: boolean }
export function createPlanetRenderer(canvas: HTMLCanvasElement, config: {
  surface: string; clouds?: string; rings?: string; atmosphere: readonly number[]; star: boolean;
}) {
  const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: "low-power", preserveDrawingBuffer: true });
  if (!gl) throw new Error("WebGL unavailable");
  const shaders: WebGLShader[] = [], textures: WebGLTexture[] = [];
  const program = gl.createProgram()!;
  const buffer = gl.createBuffer()!;
  let disposed = false;
  const dispose = () => { disposed=true; textures.forEach(t=>gl.deleteTexture(t)); shaders.forEach(s=>gl.deleteShader(s)); gl.deleteBuffer(buffer); gl.deleteProgram(program); };
  try {
    for (const [type,source] of [[gl.VERTEX_SHADER,PLANET_VERTEX],[gl.FRAGMENT_SHADER,PLANET_FRAGMENT]] as const) {
      const shader=gl.createShader(type)!; shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error("Planet shader compilation failed: "+gl.getShaderInfoLog(shader));
      gl.attachShader(program,shader);
    }
    gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("Planet shader linking failed");
    gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const u=(name:string)=>gl.getUniformLocation(program,name);
    gl.uniform1f(u("ringed"),config.rings?1:0);gl.uniform1f(u("earth"),config.clouds?1:0);gl.uniform1f(u("star"),config.star?1:0);
    gl.uniform1f(u("atmosphere"),config.atmosphere.some(x=>x>0)?1:0);gl.uniform3fv(u("atmosphereColor"),new Float32Array(config.atmosphere));
    const ready=Promise.all([config.surface,config.clouds,config.rings].map((url,index)=>new Promise<void>((resolve,reject)=>{
      const texture=gl.createTexture()!;textures.push(texture);gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.uniform1i(u(["surfaceMap","cloudsMap","ringMap"][index]),index);
      if(!url){resolve();return;}
      const img=new Image();img.crossOrigin="anonymous";
      img.onload=()=>{if(disposed){resolve();return;}try{gl.activeTexture(gl.TEXTURE0+index);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);resolve();}catch{reject(new Error("Texture unavailable"));}};
      img.onerror=()=>reject(new Error("Texture unavailable"));img.src=url;
    })));
    return {ready,dispose,draw(frame:PlanetFrame){
      if(disposed)return;gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);
      gl.uniform1f(u("rotation"),frame.rotation);gl.uniform1f(u("tilt"),frame.tilt);gl.uniform1f(u("pitch"),frame.pitch);gl.uniform1f(u("illustrated"),frame.illustrated?1:0);
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);
    }};
  }catch(error){dispose();throw error;}
}
