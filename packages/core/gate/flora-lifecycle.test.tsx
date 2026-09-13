import React,{act} from "react";
import {createRoot,type Root} from "react-dom/client";
import {beforeEach,afterEach,it,expect,vi} from "vitest";
import {FloraObject} from "../src/objects/FloraObject";
const mocked=vi.hoisted(()=>({draw:vi.fn()}));
vi.mock("../src/objects/flora-renderer",()=>({drawFlora:mocked.draw}));
let root:Root,element:HTMLDivElement,intersection:(e:{isIntersecting:boolean}[])=>void,mediaChange:()=>void,reduced=false,coarse=false;
beforeEach(()=>{
 vi.useFakeTimers({toFake:["setTimeout","clearTimeout","performance"]});vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);mocked.draw.mockReset();
 vi.stubGlobal("IntersectionObserver",class{constructor(cb:typeof intersection){intersection=cb;}observe(){}disconnect(){}});
 vi.stubGlobal("matchMedia",(q:string)=>({get matches(){return q.includes("reduced-motion")?reduced:q.includes("pointer: coarse")&&coarse;},addEventListener(_e:string,cb:()=>void){if(q.includes("reduced-motion"))mediaChange=cb;},removeEventListener(){}}));
 vi.spyOn(HTMLCanvasElement.prototype,"getContext").mockImplementation(()=>({}) as CanvasRenderingContext2D);
 reduced=false;coarse=false;element=document.createElement("div");document.body.append(element);root=createRoot(element);
});
afterEach(async()=>{await act(async()=>root.unmount());element.remove();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});
async function show(){await act(async()=>{intersection([{isIntersecting:true}]);});await act(async()=>{await vi.dynamicImportSettled();});}
it("borne la boucle mobile et respecte reduced motion",async()=>{coarse=true;reduced=true;await act(async()=>root.render(<FloraObject id="flora-fern" label="Fougère" size={420}/>));await show();expect(mocked.draw.mock.calls[0][4]).toBe(224);expect(vi.getTimerCount()).toBe(0);reduced=false;await act(async()=>mediaChange());expect(vi.getTimerCount()).toBe(1);await act(async()=>vi.advanceTimersByTime(1000));expect(mocked.draw.mock.calls.length).toBeLessThanOrEqual(15);});
it("ne monte aucun canvas ni timer pour les vignettes fixes",async()=>{await act(async()=>root.render(<FloraObject id="flora-blossom" label="Pivoine" thumbnail/>));expect(mocked.draw).not.toHaveBeenCalled();expect(element.querySelector("canvas")).toBeNull();expect(vi.getTimerCount()).toBe(0);});
it("charge en vue, fige le temps sur pause et s’arrête hors écran",async()=>{await act(async()=>root.render(<FloraObject id="flora-meadow" label="Prairie"/>));await show();expect(vi.getTimerCount()).toBe(1);await act(async()=>vi.advanceTimersByTime(800));const t=mocked.draw.mock.calls.at(-1)![3];expect(t).toBeGreaterThan(0);await act(async()=>root.render(<FloraObject id="flora-meadow" label="Prairie" playing={false}/>));expect(vi.getTimerCount()).toBe(0);expect(mocked.draw.mock.calls.at(-1)![3]).toBe(t);await act(async()=>intersection([{isIntersecting:false}]));expect(vi.getTimerCount()).toBe(0);});
it("garde le poster lisible si le moteur échoue",async()=>{mocked.draw.mockImplementation(()=>{throw Error("renderer")});await act(async()=>root.render(<FloraObject id="flora-branch" label="Ginkgo"/>));await show();expect(element.textContent).toContain("animation indisponible");expect(vi.getTimerCount()).toBe(0);expect(element.querySelector("img")?.alt).toBe("Ginkgo");});
