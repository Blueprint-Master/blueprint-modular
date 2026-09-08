import {afterEach, describe, expect, it, vi} from "vitest";
import {createCanvasPlanetRenderer} from "../src/objects/planet-canvas-renderer";

// Asymmetric equirectangular map: red increases west → east, green north → south.
// Exercise the real pixel renderer; only image decoding and canvas storage are mocked.
const width=256, height=128, size=65;
function texture(cloud=false) {
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
    const i=(y*width+x)*4;
    data[i]=cloud?(x<width/2?255:0):Math.round(x/width*200);
    data[i+1]=cloud?0:Math.round(y/height*200);
    data[i+2]=cloud?0:40; data[i+3]=255;
  }
  return data;
}
afterEach(()=>vi.unstubAllGlobals());
async function scene(clouds=false) {
  const maps={surface:texture(),clouds:texture(true),black:new Uint8ClampedArray(width*height*4)};
  class ImageStub {
    width=width; height=height; data=new Uint8ClampedArray(); onload?:()=>void;
    set src(value:string) {this.data=maps[value as keyof typeof maps];queueMicrotask(()=>this.onload?.());}
  }
  vi.stubGlobal("Image",ImageStub);
  vi.stubGlobal("document",{createElement(){let data:Uint8ClampedArray;return {width,height,getContext(){return {
    drawImage(img:ImageStub){data=img.data;},getImageData(){return {data};},
  };}};}});
  let pixels=new Uint8ClampedArray();
  const canvas={width:size,height:size,getContext(){return {
    createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},
    putImageData(image:{data:Uint8ClampedArray}){pixels=image.data;},
  };}} as unknown as HTMLCanvasElement;
  const renderer=createCanvasPlanetRenderer(canvas,{surface:clouds?"black":"surface",clouds:clouds?"clouds":undefined,atmosphere:[0,0,0],star:true});
  await renderer.ready;
  return {renderer,pixel(x:number,y:number,channel=0){return pixels[(y*size+x)*4+channel];}};
}
describe("planet map orientation",()=>{
  it.each([false,true])("keeps east right and north up, illustrated=%s",async illustrated=>{
    const {renderer,pixel}=await scene();
    for(const rotation of [-.25,0,.125]) {
      renderer.draw({rotation,tilt:0,pitch:0,illustrated});
      expect(pixel(20,32)).toBeLessThan(pixel(44,32));
      expect(pixel(32,20,1)).toBeLessThan(pixel(32,44,1));
    }
    renderer.dispose();
  });
  it("keeps the western cloud bank on the left of the same meridian",async()=>{
    const {renderer,pixel}=await scene(true);
    renderer.draw({rotation:-.25,tilt:0,pitch:0,illustrated:false});
    expect(pixel(20,32)).toBeGreaterThan(100);
    expect(pixel(44,32)).toBe(0);
    renderer.dispose();
  });
});
