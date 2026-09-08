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
async function scene(clouds=false,activity=0,uniformClouds=false,renderSize=size) {
  const size=renderSize;
  const maps={surface:texture(),clouds:texture(true),black:new Uint8ClampedArray(width*height*4)};
  if(uniformClouds)for(let i=0;i<maps.clouds.length;i+=4)maps.clouds[i]=200;
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
  const renderer=createCanvasPlanetRenderer(canvas,{surface:clouds?"black":"surface",clouds:clouds?"clouds":undefined,atmosphere:[0,0,0],star:true,activity});
  await renderer.ready;
  return {renderer,snapshot(){return new Uint8ClampedArray(pixels);},pixel(x:number,y:number,channel=0){return pixels[(y*size+x)*4+channel];}};
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

describe("independent atmospheric motion",()=>{
  it.each([1,2,3])("animates activity %s with a fixed surface rotation",async activity=>{
    const {renderer,snapshot}=await scene(activity===1,activity);
    const frame={rotation:0,tilt:0,pitch:0,illustrated:false};
    renderer.draw({...frame,time:0});const before=snapshot();renderer.draw({...frame,time:35});const after=snapshot();
    expect(after).not.toEqual(before);renderer.draw({...frame,time:35});expect(snapshot()).toEqual(after);renderer.dispose();
  });
  it("does not deform an airless moon as time passes",async()=>{
    const {renderer,snapshot}=await scene(false,0);const frame={rotation:0,tilt:0,pitch:0,illustrated:false};
    renderer.draw({...frame,time:0});const before=snapshot();renderer.draw({...frame,time:35});expect(snapshot()).toEqual(before);renderer.dispose();
  });
});

// A changing RGB pixel alone could just be a rotating static texture. These
// cases isolate the corona silhouette and a uniform cloud map respectively.
describe("visible solar eruptions and cloud evolution",()=>{
 it.each([false,true])("raises local plasma above the solar limb, illustrated=%s",async illustrated=>{
  const size=224; // Actual constrained-device backing resolution.
  const {renderer,snapshot}=await scene(false,3,false,size);
  const frame={rotation:0,tilt:0,pitch:0,illustrated};
  renderer.draw({...frame,time:0});const before=snapshot();
  renderer.draw({...frame,time:4});const after=snapshot();
  let bright=0,changed=0,outside=0;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const radius=Math.hypot(((x+.5)/size*2-1)*1.3,(1-(y+.5)/size*2)*1.3);
   if(radius<=1.05)continue;outside++;
   const alpha=(y*size+x)*4+3;
   if(after[alpha]>90)bright++;
   if(Math.abs(after[alpha]-before[alpha])>35)changed++;
  }
  expect(bright).toBeGreaterThan(8);expect(bright).toBeLessThan(outside*.12);
  expect(changed).toBeGreaterThan(15);
  renderer.draw({...frame,time:4});expect(snapshot()).toEqual(after);renderer.dispose();
 });
 it("forms and dissipates cloud banks even when translation cannot change a uniform map",async()=>{
  const {renderer,snapshot}=await scene(true,1,true);
  const frame={rotation:0,tilt:0,pitch:0,illustrated:false};
  renderer.draw({...frame,time:0});const before=snapshot();renderer.draw({...frame,time:4});const after=snapshot();
  let forming=0,dissipating=0;
  for(let i=0;i<after.length;i+=4){if(after[i]-before[i]>25)forming++;if(before[i]-after[i]>25)dissipating++;}
  expect(forming).toBeGreaterThan(50);expect(dissipating).toBeGreaterThan(50);renderer.dispose();
 });
});
