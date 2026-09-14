import {MATERIAL_PERIOD,type MaterialId,type MaterialStyle} from "./materials";
const TAU=Math.PI*2,clamp=(x:number)=>Math.max(0,Math.min(1,x));
const cycle=(time:number)=>(((Number.isFinite(time)?time:0)%MATERIAL_PERIOD)+MATERIAL_PERIOD)%MATERIAL_PERIOD/MATERIAL_PERIOD;
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const pulse=(phase:number,at:number,width:number)=>Math.exp(-Math.pow(Math.sin((phase-at)*Math.PI)/width,2));
export interface MaterialMotion{phase:number;main:number;detail:number}
/** Pure loop values used by deformation and seam tests. */
export function materialMotion(id:MaterialId,time:number):MaterialMotion{
 const phase=cycle(time),t=phase*TAU;
 if(id==="material-crystal")return {phase,main:.5+.5*Math.sin(t-.85),detail:.5+.5*Math.sin(t*2+.7)};
 if(id==="material-geode")return {phase,main:.5+.5*Math.sin(t-1.35),detail:.5+.5*Math.sin(t*2-.4)};
 if(id==="material-liquid-metal")return {phase,main:.5+.5*Math.sin(t-.15),detail:.5+.5*Math.sin(t*2+1.4)};
 if(id==="material-dichroic-glass")return {phase,main:.5+.5*Math.sin(t+.45),detail:.5+.5*Math.sin(t*2-.8)};
 return {phase,main:pulse(phase,.46,.72),detail:.5+.5*Math.sin(t+.25)};
}
function polygon(ctx:CanvasRenderingContext2D,points:readonly (readonly [number,number])[]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function backgroundShadow(ctx:CanvasRenderingContext2D,style:MaterialStyle,rx=112,ry=22){
 ctx.save();ctx.globalAlpha=style==="illustration"?.17:.28;ctx.filter="blur(8px)";ctx.fillStyle=style==="illustration"?"#26314d":"#06101c";ctx.beginPath();ctx.ellipse(160,277,rx,ry,0,0,TAU);ctx.fill();ctx.restore();
}
function crystalShard(ctx:CanvasRenderingContext2D,x:number,base:number,w:number,h:number,lean:number,style:MaterialStyle,hue:number,glint:number){
 const topX=x+lean,topY=base-h,left=x-w*.52,right=x+w*.52;
 const g=ctx.createLinearGradient(left,base,right,topY);g.addColorStop(0,style==="illustration"?`hsl(${hue} 43% 43%)`:`hsl(${hue} 54% 28%)`);g.addColorStop(.52,style==="illustration"?`hsl(${hue+24} 70% 76%)`:`hsl(${hue+22} 82% 68%)`);g.addColorStop(1,style==="illustration"?`hsl(${hue+48} 55% 52%)`:`hsl(${hue+58} 88% 42%)`);
 polygon(ctx,[[left,base],[topX-w*.2,topY+12],[topX,topY],[topX+w*.25,topY+13],[right,base]]);ctx.fillStyle=g;ctx.fill();
 ctx.save();ctx.globalAlpha=.46;polygon(ctx,[[left,base],[topX,topY],[x,base]]);ctx.fillStyle="#07152c";ctx.fill();polygon(ctx,[[topX,topY],[right,base],[x,base]]);ctx.fillStyle="#ecfbff";ctx.globalAlpha=.17+.38*glint;ctx.fill();ctx.restore();
 if(style==="illustration"){ctx.strokeStyle="#202745";ctx.lineWidth=2;ctx.stroke();}
}
function crystal(ctx:CanvasRenderingContext2D,style:MaterialStyle,m:MaterialMotion){
 backgroundShadow(ctx,style);const shards=[[-70,38,116,-7],[-42,47,178,8],[-4,52,226,-4],[36,43,164,11],[68,34,105,-4]] as const;
 for(let i=0;i<shards.length;i++){const [dx,w,max,lean]=shards[i],local=ease(clamp(m.main*1.65-i*.11)),h=48+max*local;crystalShard(ctx,160+dx,274,w,h,lean,style,188+i*12,clamp(m.detail+i*.13));}
 const gx=88+m.detail*142,shine=ctx.createLinearGradient(gx-20,80,gx+20,260);shine.addColorStop(0,"rgba(255,255,255,0)");shine.addColorStop(.5,"rgba(255,255,255,.55)");shine.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=shine;ctx.globalAlpha=.45;polygon(ctx,[[70,272],[142,66],[250,274]]);ctx.fill();ctx.globalAlpha=1;
}
function irregularRing(ctx:CanvasRenderingContext2D,r:number,teeth:number,wave:number,style:MaterialStyle,color:string,width:number){
 ctx.beginPath();for(let i=0;i<=teeth;i++){const a=i/teeth*TAU,rr=r+Math.sin(i*2.37+wave)*5+Math.sin(i*.91-wave)*3,x=160+Math.cos(a)*rr,y=164+Math.sin(a)*rr*.86;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin="round";ctx.stroke();if(style==="illustration"){ctx.globalAlpha=.34;ctx.strokeStyle="#34254c";ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;}
}
function geode(ctx:CanvasRenderingContext2D,style:MaterialStyle,m:MaterialMotion){
 backgroundShadow(ctx,style,105,19);const shell=ctx.createRadialGradient(137,122,15,160,164,120);shell.addColorStop(0,"#070516");shell.addColorStop(.42,style==="illustration"?"#bd87cb":"#713ea0");shell.addColorStop(.7,style==="illustration"?"#5c6fb4":"#28336d");shell.addColorStop(1,"#191b28");ctx.fillStyle=shell;ctx.beginPath();ctx.ellipse(160,164,113,103,-.1,0,TAU);ctx.fill();
 const bloom=.45+.55*ease(m.main);irregularRing(ctx,90,42,m.phase*TAU,style,style==="illustration"?"#d5a5dd":"#a663d2",18);irregularRing(ctx,70,38,-m.phase*TAU*.7,style,style==="illustration"?"#66b3cb":"#49dbe8",13*bloom);irregularRing(ctx,51,34,m.phase*TAU*.45,style,"#eee7ff",7*bloom);
 const core=ctx.createRadialGradient(154,151,2,160,164,44);core.addColorStop(0,style==="illustration"?"#fff4bd":"#ffffff");core.addColorStop(.18,`hsla(${190+m.detail*100} 90% 72% / .92)`);core.addColorStop(1,"rgba(10,5,27,.95)");ctx.fillStyle=core;ctx.beginPath();ctx.ellipse(160,164,43,38,0,0,TAU);ctx.fill();
 for(let i=0;i<15;i++){const a=i/15*TAU+.13*Math.sin(m.phase*TAU),len=(10+9*Math.sin(i*4.7)**2)*bloom;ctx.save();ctx.translate(160+Math.cos(a)*49,164+Math.sin(a)*42);ctx.rotate(a+Math.PI/2);polygon(ctx,[[-4,0],[0,-len],[5,0]]);ctx.fillStyle=i%3?"rgba(222,250,255,.78)":"rgba(255,201,245,.82)";ctx.fill();ctx.restore();}
}
function metal(ctx:CanvasRenderingContext2D,style:MaterialStyle,m:MaterialMotion){
 backgroundShadow(ctx,style,108,18);const t=m.phase*TAU,merge=ease(.5+.5*Math.sin(t-.2)),satX=226-75*merge,satY=102+92*merge;
 ctx.save();ctx.filter=style==="illustration"?"none":"blur(1px)";const g=ctx.createRadialGradient(126-m.detail*10,111,10,162,174,115);g.addColorStop(0,"#ffffff");g.addColorStop(.13,style==="illustration"?"#c8d5e8":"#e8f4ff");g.addColorStop(.32,"#6f7f98");g.addColorStop(.58,"#111b2a");g.addColorStop(.77,"#c9d8e5");g.addColorStop(1,"#202a38");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(62,205);ctx.bezierCurveTo(50,144,88,87,148,78);ctx.bezierCurveTo(211,70,260,124,248,190);ctx.bezierCurveTo(238,246,180,266,119,248);ctx.bezierCurveTo(89,240,69,227,62,205);ctx.fill();
 const dg=ctx.createRadialGradient(satX-7,satY-8,2,satX,satY,28);dg.addColorStop(0,"#fff");dg.addColorStop(.24,"#aabbd0");dg.addColorStop(.65,"#1a2432");dg.addColorStop(1,"#8fa1b3");ctx.fillStyle=dg;ctx.beginPath();ctx.arc(satX,satY,11+10*(1-merge),0,TAU);ctx.fill();if(merge>.42){ctx.strokeStyle="#8899ad";ctx.lineWidth=9+14*merge;ctx.beginPath();ctx.moveTo(satX,satY+4);ctx.quadraticCurveTo(190,146,185,190);ctx.stroke();}ctx.restore();
 if(style==="illustration"){ctx.strokeStyle="#20293a";ctx.lineWidth=2.4;ctx.stroke();}
}
function glass(ctx:CanvasRenderingContext2D,style:MaterialStyle,m:MaterialMotion){
 backgroundShadow(ctx,style,106,17);const bend=(m.main-.5)*42,twist=(m.detail-.5)*22,g=ctx.createLinearGradient(60,68,260,253);g.addColorStop(0,"rgba(80,235,255,.35)");g.addColorStop(.28,"rgba(255,102,202,.66)");g.addColorStop(.55,"rgba(253,225,92,.35)");g.addColorStop(.78,"rgba(91,117,255,.62)");g.addColorStop(1,"rgba(100,255,222,.28)");ctx.fillStyle=g;
 ctx.beginPath();ctx.moveTo(62,96);ctx.bezierCurveTo(116,43,184+bend,61,248,105+twist);ctx.bezierCurveTo(203,137,183-bend,159,244,224);ctx.bezierCurveTo(181,269,102-bend,243,68,198);ctx.bezierCurveTo(126,171,132+bend,133,62,96);ctx.fill();
 ctx.save();ctx.globalCompositeOperation="screen";ctx.globalAlpha=.7;const band=ctx.createLinearGradient(50+m.detail*80,90,180+m.detail*80,240);band.addColorStop(0,"rgba(255,255,255,0)");band.addColorStop(.5,"rgba(255,255,255,.72)");band.addColorStop(1,"rgba(255,255,255,0)");ctx.fillStyle=band;ctx.fill();ctx.restore();ctx.strokeStyle=style==="illustration"?"#3f315c":"rgba(222,253,255,.72)";ctx.lineWidth=style==="illustration"?2.5:1.2;ctx.stroke();
}
function obsidian(ctx:CanvasRenderingContext2D,style:MaterialStyle,m:MaterialMotion){
 backgroundShadow(ctx,style,105,18);const pts:[[number,number],...Array<[number,number]>]=[[160,53],[233,91],[260,174],[221,252],[126,270],[62,213],[72,112]];const g=ctx.createLinearGradient(72,55,241,254);g.addColorStop(0,style==="illustration"?"#334052":"#27384a");g.addColorStop(.34,"#05080e");g.addColorStop(.7,style==="illustration"?"#291f3c":"#160e25");g.addColorStop(1,"#020306");polygon(ctx,pts);ctx.fillStyle=g;ctx.fill();
 const faces=[[[160,53],[151,166],[72,112]],[[160,53],[233,91],[151,166]],[[233,91],[260,174],[151,166]],[[151,166],[260,174],[221,252]],[[151,166],[221,252],[126,270]],[[72,112],[151,166],[62,213]],[[62,213],[151,166],[126,270]]] as const;faces.forEach((p,i)=>{polygon(ctx,p);ctx.fillStyle=i%3===0?"rgba(113,148,173,.12)":i%3===1?"rgba(108,62,139,.12)":"rgba(0,0,0,.18)";ctx.fill();});
 const grow=ease(clamp((m.main-.16)*1.25)),segments=[[[151,166],[128,137]],[[151,166],[172,139]],[[151,166],[181,191]],[[128,137],[112,119]],[[128,137],[103,149]],[[172,139],[194,116]],[[181,191],[205,208]],[[181,191],[169,218]]] as const;ctx.save();ctx.shadowColor="#ff664d";ctx.shadowBlur=style==="illustration"?2:10;ctx.strokeStyle=style==="illustration"?"#ef725b":"#ff7b53";ctx.lineCap="round";segments.forEach((s,i)=>{const local=clamp(grow*1.7-i*.09);if(!local)return;ctx.beginPath();ctx.moveTo(s[0][0],s[0][1]);ctx.lineTo(s[0][0]+(s[1][0]-s[0][0])*local,s[0][1]+(s[1][1]-s[0][1])*local);ctx.lineWidth=i<3?3.4:1.8;ctx.stroke();});ctx.restore();
 if(style==="illustration"){polygon(ctx,pts);ctx.strokeStyle="#202535";ctx.lineWidth=2.6;ctx.stroke();}
}
/** Draws one transparent material scene with one local transformation and one restrained light detail. */
export function drawMaterial(ctx:CanvasRenderingContext2D,id:MaterialId,style:MaterialStyle,time:number,size:number){
 if(!Number.isFinite(size)||size<16||size>512)throw Error("Invalid material resolution");ctx.clearRect(0,0,size,size);ctx.save();ctx.scale(size/320,size/320);const m=materialMotion(id,time);
 if(id==="material-crystal")crystal(ctx,style,m);else if(id==="material-geode")geode(ctx,style,m);else if(id==="material-liquid-metal")metal(ctx,style,m);else if(id==="material-dichroic-glass")glass(ctx,style,m);else obsidian(ctx,style,m);ctx.restore();
}
