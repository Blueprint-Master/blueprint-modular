import type {FlagSettings,FlagStyle} from './flags';
/** Presentation wave, anchored hoist, exact twelve-second loop. Not a textile simulation. */
export function flagSurface(u:number,v:number,time:number,wind:number,flat=false){const a=flat?0:wind*(.08+.18*u)*u,f=u*8+v*1.6-time*Math.PI/6,z=a*(Math.sin(f)+.16*Math.sin(u*17+v*9-time*Math.PI/3));return {x:u-.38*a*(1-Math.cos(f)),y:v+.30*a*Math.sin(f+.8)+.025*u*u*(flat?0:1),z};}
const vertex=`attribute vec2 uv;varying vec2 tex;varying vec3 normal;uniform float time;uniform float wind;uniform float flatMode;uniform float ratio;
vec3 surface(vec2 p){float a=(1.-flatMode)*wind*(.08+.18*p.x)*p.x;float f=p.x*8.+p.y*1.6-time*.5235987756;float z=a*(sin(f)+.16*sin(p.x*17.+p.y*9.-time*1.0471975512));return vec3(p.x-.38*a*(1.-cos(f)),p.y+.30*a*sin(f+.8)+.025*p.x*p.x*(1.-flatMode),z);}
void main(){tex=uv;vec3 p=surface(uv);vec3 du=(surface(uv+vec2(.001,0.))-p)*vec3(ratio,1.,1.);vec3 dv=(surface(uv+vec2(0.,.001))-p)*vec3(ratio,1.,1.);normal=normalize(cross(du,dv));float w=min(1.64,1.32*ratio);float h=w/ratio;gl_Position=vec4(-.82+w*p.x,h*.5-h*p.y+.34*p.z,-.2*p.z,1.);}`;
const fragment=`precision mediump float;uniform sampler2D artwork;uniform float showArt;uniform float fabric;uniform float lighting;uniform float drawn;varying vec2 tex;varying vec3 normal;
void main(){
 vec4 base=texture2D(artwork,tex);if(base.a<.015)discard;
 vec3 color=mix(vec3(.82,.83,.80),base.rgb,showArt);
 vec3 n=normalize(normal),light=normalize(vec3(-.65,-.4,1.));
 float diffuse=max(0.,dot(n,light));
 float shade=.30+.77*diffuse;
 float sheen=pow(max(0.,dot(n,normalize(vec3(-.32,-.25,1.)))),18.)*.22;
 float thread=sin(tex.x*1100.)*sin(tex.y*780.)*.018;
 float edge=min(min(tex.x,1.-tex.x),min(tex.y,1.-tex.y));
 float hem=1.-smoothstep(.004,.012,edge);
 float stitch=(1.-smoothstep(.001,.002,abs(edge-.013)))*step(.45,fract((tex.x+tex.y)*160.));
 vec3 cloth=color*shade+vec3(sheen)*(vec3(.5)+.5*color);
 cloth*=1.+fabric*(thread-hem*.15);cloth+=fabric*stitch*.07;
 float band=floor(diffuse*4.)/4.;
 vec3 ink=color*(.60+.40*band);
 float outline=1.-smoothstep(.002,.007,edge);
 ink=mix(ink,vec3(.055,.075,.11),outline*.85);
 float hatch=step(.83,fract((tex.x+tex.y)*100.))*(1.-step(.65,diffuse));
 ink*=1.-fabric*hatch*.20;
 color=mix(color,mix(cloth,ink,drawn),lighting);
 gl_FragColor=vec4(color,base.a);
}`;
export interface FlagCloth{draw:(time:number,settings:FlagSettings,style:FlagStyle)=>void;dispose:()=>void}
export function createFlagCloth(canvas:HTMLCanvasElement,image:TexImageSource,ratio:number):FlagCloth{
 const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw Error('WebGL unavailable');
 const shaders:WebGLShader[]=[],program=gl.createProgram()!;
 const compile=(type:number,source:string)=>{const s=gl.createShader(type)!;shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader unavailable');return s;};
 try{gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');}catch(e){shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);throw e;}
 gl.useProgram(program);const vertices:number[]=[],indices:number[]=[];for(let y=0;y<=24;y++)for(let x=0;x<=64;x++)vertices.push(x/64,y/24);for(let y=0;y<24;y++)for(let x=0;x<64;x++){const i=y*65+x;indices.push(i,i+1,i+65,i+1,i+66,i+65);}
 const vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,'uv');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const uniforms=Object.fromEntries(['time','wind','flatMode','ratio','showArt','fabric','lighting','drawn'].map(k=>[k,gl.getUniformLocation(program,k)]));
 return {draw(time,s,style){gl.viewport(0,0,canvas.width,canvas.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);for(const [k,v] of Object.entries({time,wind:s.wind,flatMode:s.mode==='flat'?1:0,ratio,showArt:+s.layers.artwork,fabric:+s.layers.fabric,lighting:+s.layers.lighting,drawn:style==='illustration'?1:0}))gl.uniform1f(uniforms[k],v);gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);},dispose(){gl.deleteBuffer(vb);gl.deleteBuffer(ib);gl.deleteTexture(texture);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}};
}
