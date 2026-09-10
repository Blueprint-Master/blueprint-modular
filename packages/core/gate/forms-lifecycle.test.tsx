import React,{act} from "react";
import {createRoot,type Root} from "react-dom/client";
import {beforeEach,afterEach,it,expect,vi} from "vitest";
import {FormObject} from "../src/objects/FormObject";
const mocked=vi.hoisted(()=>({create:vi.fn(),draw:vi.fn()}));
vi.mock("../src/objects/forms-renderer",()=>({createFormField:mocked.create}));
let root:Root,element:HTMLDivElement,intersection:(e:{isIntersecting:boolean}[])=>void,mediaChange:()=>void,reduced=false,coarse=false;
beforeEach(()=>{
 vi.useFakeTimers({toFake:["setTimeout","clearTimeout","performance"]});vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);mocked.create.mockReset();mocked.draw.mockReset();
 mocked.create.mockImplementation((size:number)=>({draw:mocked.draw.mockImplementation(()=>new Uint8ClampedArray(size*size*4))}));
 vi.stubGlobal("IntersectionObserver",class{constructor(cb:typeof intersection){intersection=cb;}observe(){}disconnect(){}});
 vi.stubGlobal("matchMedia",(q:string)=>({get matches(){return q.includes("reduced-motion")?reduced:q.includes("pointer: coarse")&&coarse;},addEventListener(_e:string,cb:()=>void){if(q.includes("reduced-motion"))mediaChange=cb;},removeEventListener(){}}));
 vi.stubGlobal("fetch",vi.fn().mockResolvedValue({ok:true,blob:async()=>new Blob()}));
 vi.stubGlobal("createImageBitmap",vi.fn().mockResolvedValue({width:4,height:4,close:vi.fn()}));
 vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockImplementation(()=>({drawImage(){},getImageData(){return {data:new Uint8ClampedArray(64)};},createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(){}} as unknown as CanvasRenderingContext2D));
 reduced=false;coarse=false;element=document.createElement("div");document.body.append(element);root=createRoot(element);
});
afterEach(async()=>{await act(async()=>root.unmount());element.remove();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});
async function show(){await act(async()=>{intersection([{isIntersecting:true}]);});await act(async()=>{await vi.dynamicImportSettled();});}
it("has one bounded mobile loop, then zero when initially reduced motion is requested",async()=>{
 coarse=true;reduced=true;await act(async()=>root.render(<FormObject id="form-loop" label="Loop" size={420}/>));await show();
 expect(mocked.create.mock.calls[0][0]).toBe(224);expect(vi.getTimerCount()).toBe(0);
 reduced=false;await act(async()=>mediaChange());expect(vi.getTimerCount()).toBe(1);
 await act(async()=>vi.advanceTimersByTime(1000));expect(mocked.draw.mock.calls.length).toBeLessThanOrEqual(15);
});
it("never fetches textures or schedules timers for fixed thumbnails",async()=>{
 await act(async()=>root.render(<FormObject id="form-loop" label="Snow" thumbnail/>));expect(fetch).not.toHaveBeenCalled();expect(mocked.create).not.toHaveBeenCalled();expect(element.querySelector("canvas")).toBeNull();expect(vi.getTimerCount()).toBe(0);
});
it("loads only in view, freezes its exact time on pause and stops for reduced motion",async()=>{
 await act(async()=>root.render(<FormObject id="form-silk" label="Rain"/>));expect(fetch).not.toHaveBeenCalled();await show();
 expect(fetch).not.toHaveBeenCalled();expect(mocked.create).toHaveBeenCalledTimes(1);expect(vi.getTimerCount()).toBe(1);
 await act(async()=>vi.advanceTimersByTime(1000));const t=mocked.draw.mock.calls.at(-1)![2];expect(t).toBeGreaterThan(0);
 await act(async()=>root.render(<FormObject id="form-silk" label="Rain" playing={false}/>));expect(vi.getTimerCount()).toBe(0);expect(mocked.draw.mock.calls.at(-1)![2]).toBe(t);
 await act(async()=>vi.advanceTimersByTime(2000));expect(mocked.draw.mock.calls.at(-1)![2]).toBe(t);
 await act(async()=>root.render(<FormObject id="form-silk" label="Rain"/>));reduced=true;await act(async()=>mediaChange());expect(vi.getTimerCount()).toBe(0);
});
it("stops offscreen and on hidden tabs without a catch-up time jump",async()=>{
 await act(async()=>root.render(<FormObject id="form-ripple" label="Cloud"/>));await show();await act(async()=>vi.advanceTimersByTime(500));
 await act(async()=>intersection([{isIntersecting:false}]));expect(vi.getTimerCount()).toBe(0);const count=mocked.draw.mock.calls.length;await act(async()=>vi.advanceTimersByTime(10000));expect(mocked.draw).toHaveBeenCalledTimes(count);
 await show();expect(vi.getTimerCount()).toBe(1);vi.spyOn(document,"hidden","get").mockReturnValue(true);await act(async()=>document.dispatchEvent(new Event("visibilitychange")));expect(vi.getTimerCount()).toBe(0);
});
it("retains a readable fixed fallback on renderer error, with no loop",async()=>{
 mocked.create.mockImplementation(()=>{throw new Error("Renderer unavailable");});await act(async()=>root.render(<FormObject id="form-shell" label="Storm"/>));await show();
 expect(element.textContent).toContain("animation indisponible");expect(vi.getTimerCount()).toBe(0);expect(element.querySelector("img")?.getAttribute("alt")).toBe("Storm");
});
