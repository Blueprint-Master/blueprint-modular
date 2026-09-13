import {FLORA_PERIOD,type FloraId,type FloraStyle} from "./flora";
const TAU=Math.PI*2,clamp=(x:number)=>Math.max(0,Math.min(1,x));
const cycle=(time:number)=>(((Number.isFinite(time)?time:0)%FLORA_PERIOD)+FLORA_PERIOD)%FLORA_PERIOD/FLORA_PERIOD;
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export interface FloraMotion{phase:number;main:number;detail:number}
/** Pure cycle values used by the renderer and deformation tests. */
export function floraMotion(id:FloraId,time:number):FloraMotion{
 const phase=cycle(time),t=phase*TAU;
 if(id==="flora-fern")return {phase,main:.5+.5*Math.sin(t-.75),detail:.5+.5*Math.sin(t*2+.4)};
 if(id==="flora-blossom")return {phase,main:.5+.5*Math.sin(t-1.15),detail:.5+.5*Math.sin(t*2-1.7)};
 if(id==="flora-meadow")return {phase,main:.5+.5*Math.sin(t-.25),detail:.5+.5*Math.sin(t*2+.9)};
 return {phase,main:.5+.5*Math.sin(t+.35),detail:.5+.5*Math.sin(t*2-1.1)};
}
function palette(style:FloraStyle){
 return style==="illustration"?{deep:"#123d32",mid:"#4d8f56",light:"#b8cf72",warm:"#f0b8a8",paper:"#f5e7c8",ink:"#17352e"}:{deep:"#062f25",mid:"#2b7a4b",light:"#b9df72",warm:"#f3aab2",paper:"#fff2d0",ink:"#031d17"};
}
function leaf(ctx:CanvasRenderingContext2D,length:number,width:number,style:FloraStyle,alpha=1){
 const p=palette(style);ctx.save();ctx.globalAlpha*=alpha;
 const g=ctx.createLinearGradient(-width,0,width,0);g.addColorStop(0,p.deep);g.addColorStop(.48,p.mid);g.addColorStop(1,p.light);
 ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(width*.95,-length*.18,width*.88,-length*.72,0,-length);ctx.bezierCurveTo(-width*.82,-length*.70,-width*.92,-length*.18,0,0);ctx.closePath();ctx.fillStyle=g;ctx.fill();
 ctx.beginPath();ctx.moveTo(0,-2);ctx.quadraticCurveTo(width*.08,-length*.48,0,-length*.91);ctx.strokeStyle=style==="illustration"?p.paper:"rgba(235,255,210,.48)";ctx.lineWidth=style==="illustration"?1.7:1;ctx.stroke();
 if(style==="illustration"){ctx.strokeStyle=p.ink;ctx.lineWidth=1.5;ctx.stroke();}ctx.restore();
}
function petal(ctx:CanvasRenderingContext2D,length:number,width:number,style:FloraStyle,shade:number){
 const p=palette(style),g=ctx.createRadialGradient(0,-length*.16,1,0,-length*.35,length);
 g.addColorStop(0,style==="illustration"?(shade>.5?"#ffd6c8":"#d98590"):"#fff0e9");g.addColorStop(.55,style==="illustration"?"#e49aa2":p.warm);g.addColorStop(1,style==="illustration"?"#a94e67":"#7e244d");
 ctx.beginPath();ctx.moveTo(0,2);ctx.bezierCurveTo(width,-length*.16,width*.86,-length*.76,0,-length);ctx.bezierCurveTo(-width*.86,-length*.76,-width,-length*.16,0,2);ctx.fillStyle=g;ctx.fill();
 if(style==="illustration"){ctx.strokeStyle="#6b2942";ctx.lineWidth=1.8;ctx.stroke();}
}
function stem(ctx:CanvasRenderingContext2D,x0:number,y0:number,x1:number,y1:number,bend:number,style:FloraStyle,width=6){
 const p=palette(style);ctx.beginPath();ctx.moveTo(x0,y0);ctx.bezierCurveTo(x0+bend,y0*.72,x1+bend*.55,y1+34,x1,y1);ctx.strokeStyle=style==="illustration"?p.deep:"#174d36";ctx.lineWidth=width;ctx.lineCap="round";ctx.stroke();
 if(style!=="illustration"){ctx.strokeStyle="rgba(190,232,132,.35)";ctx.lineWidth=Math.max(1,width*.18);ctx.stroke();}
}
function fern(ctx:CanvasRenderingContext2D,style:FloraStyle,m:FloraMotion){
 const sway=(m.main-.5)*25,open=.58+.38*ease(m.main);ctx.save();ctx.translate(160,294);
 stem(ctx,0,0,sway,-238,sway*.45,style,7);
 for(let i=0;i<12;i++){const u=(i+1)/13,y=-18-u*198,x=sway*u*u+Math.sin(u*Math.PI)*5,side=i%2?1:-1,local=ease((open-u*.18)*1.28),angle=side*(1.12-u*.45)+(m.detail-.5)*.12;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(local,local);leaf(ctx,27+u*17,7+u*5,style,.72+.28*u);ctx.restore();
  ctx.save();ctx.translate(x,y-5);ctx.rotate(-angle*.92);ctx.scale(local*.93,local*.93);leaf(ctx,24+u*15,6+u*4,style,.7+.3*u);ctx.restore();}
 ctx.save();ctx.translate(sway,-238);ctx.rotate(-.6+(1-open)*1.7);ctx.strokeStyle=palette(style).light;ctx.lineWidth=6;ctx.beginPath();ctx.arc(10,-4,16,1.1,TAU*.92);ctx.stroke();ctx.restore();ctx.restore();
}
function blossom(ctx:CanvasRenderingContext2D,style:FloraStyle,m:FloraMotion){
 const sway=(m.detail-.5)*13,opening=.63+.34*ease(m.main);stem(ctx,160,310,160+sway,188,sway*.4,style,8);
 ctx.save();ctx.translate(160+sway,172);if(style!=="illustration"){ctx.shadowColor="rgba(255,126,160,.38)";ctx.shadowBlur=18;}
 for(let layer=0;layer<3;layer++){const count=7+layer*2,len=72-layer*17,w=28-layer*5;
  for(let i=0;i<count;i++){ctx.save();ctx.rotate(i/count*TAU+(layer%2)*.22);ctx.scale(opening-layer*.05,opening);ctx.translate(0,layer*5);petal(ctx,len,w,style,(i+layer)%3/2);ctx.restore();}}
 ctx.shadowBlur=0;const p=palette(style);ctx.fillStyle=p.paper;
 for(let i=0;i<11;i++){const a=i/11*TAU+m.detail*.18,r=10+5*Math.sin(i*2.4);ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,style==="illustration"?2.2:1.7,0,TAU);ctx.fill();}
 ctx.restore();ctx.save();ctx.translate(147,252);ctx.rotate(-1.15+(m.main-.5)*.12);leaf(ctx,55,17,style);ctx.restore();
}
function meadow(ctx:CanvasRenderingContext2D,style:FloraStyle,m:FloraMotion){
 const p=palette(style);ctx.fillStyle=style==="illustration"?"rgba(84,128,69,.18)":"rgba(16,77,45,.18)";ctx.beginPath();ctx.ellipse(160,286,137,22,0,0,TAU);ctx.fill();
 for(let i=0;i<34;i++){const x=24+i*8.1,h=92+(i*37%74),local=.5+.5*Math.sin(m.phase*TAU-i*.27),gust=(m.main-.5)*26*(.25+.75*local),seed=i%7===0;
  ctx.beginPath();ctx.moveTo(x,286);ctx.quadraticCurveTo(x+gust*.35,286-h*.55,x+gust,286-h);ctx.strokeStyle=i%3===0?p.light:i%3===1?p.mid:p.deep;ctx.lineWidth=style==="illustration"?3:2.2;ctx.lineCap="round";ctx.stroke();
  if(seed){ctx.save();ctx.translate(x+gust,286-h);ctx.rotate(.35+gust*.012);for(let k=0;k<6;k++){ctx.rotate(.86);ctx.beginPath();ctx.ellipse(0,-7,2.4,7,0,0,TAU);ctx.fillStyle=style==="illustration"?"#e3bd67":"#cbd77a";ctx.fill();}ctx.restore();}}
 for(let i=0;i<4;i++){const a=(m.phase+i*.23)%1,x=42+i*71+Math.sin(a*TAU)*12,y=220-a*126;ctx.globalAlpha=Math.sin(a*Math.PI)*.45;ctx.fillStyle=p.paper;ctx.beginPath();ctx.arc(x,y,1.6+i*.25,0,TAU);ctx.fill();}ctx.globalAlpha=1;
}
function ginkgo(ctx:CanvasRenderingContext2D,style:FloraStyle,m:FloraMotion){
 const p=palette(style),gust=(m.main-.5)*.18;ctx.save();ctx.translate(12,298);ctx.rotate(-.72+gust);
 ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(58,-34,109,-90,238,-210);ctx.strokeStyle=style==="illustration"?"#6d4932":"#4c3226";ctx.lineWidth=15;ctx.lineCap="round";ctx.stroke();
 for(let i=0;i<11;i++){const u=(i+1)/12,x=238*u,y=-210*u+Math.sin(u*Math.PI)*22,side=i%2?1:-1,twist=.72+.28*Math.abs(Math.sin(m.phase*TAU+i*.61));
  ctx.save();ctx.translate(x,y);ctx.rotate(side*(.72-u*.22)-gust*1.8);ctx.scale(side*twist,1);const g=ctx.createRadialGradient(0,-4,2,0,-18,36);g.addColorStop(0,p.light);g.addColorStop(.58,i%3?"#76a94f":"#d0b24e");g.addColorStop(1,p.deep);ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-30,-8,-34,-38,-5,-48);ctx.bezierCurveTo(0,-35,2,-35,7,-48);ctx.bezierCurveTo(35,-38,31,-8,0,0);ctx.fill();if(style==="illustration"){ctx.strokeStyle=p.ink;ctx.lineWidth=1.6;ctx.stroke();}ctx.restore();}
 ctx.restore();
}
/** Draws one transparent botanical scene. One local deformation plus one restrained detail. */
export function drawFlora(ctx:CanvasRenderingContext2D,id:FloraId,style:FloraStyle,time:number,size:number){
 if(!Number.isFinite(size)||size<16||size>512)throw Error("Invalid flora resolution");ctx.clearRect(0,0,size,size);ctx.save();ctx.scale(size/320,size/320);
 if(style==="photorealistic"){ctx.shadowColor="rgba(1,20,13,.24)";ctx.shadowBlur=6;ctx.shadowOffsetY=4;}const m=floraMotion(id,time);
 if(id==="flora-fern")fern(ctx,style,m);else if(id==="flora-blossom")blossom(ctx,style,m);else if(id==="flora-meadow")meadow(ctx,style,m);else ginkgo(ctx,style,m);ctx.restore();
}
