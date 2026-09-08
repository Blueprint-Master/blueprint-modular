/** Limits are ceilings, not performance claims. Actual frame cost can lower FPS. */
export function planetBudget(width:number,dpr=1,constrained=false,software=false){
 const cap=software?(constrained?224:288):(constrained?320:512);
 return {size:Math.round(Math.max(48,Math.min(cap,width*Math.min(dpr,constrained?1:1.5)))),fps:software?12:constrained?18:24};
}

/** A single timer, no idle RAF polling. Slow draws get breathing room too. */
export function createPlanetClock(fps:number,draw:(delta:number)=>void){
 let timer:ReturnType<typeof setTimeout>|undefined,last=0,running=false;
 const interval=1000/fps;
 const tick=()=>{
  timer=undefined;if(!running)return;
  const now=performance.now(),delta=Math.min((now-last)/1000,.25);last=now;
  draw(delta);
  if(running)timer=setTimeout(tick,Math.max(interval-(performance.now()-now),interval*.5));
 };
 return {start(){if(running)return;running=true;last=performance.now();timer=setTimeout(tick,interval);},
  stop(){running=false;if(timer!==undefined)clearTimeout(timer);timer=undefined;}};
}
