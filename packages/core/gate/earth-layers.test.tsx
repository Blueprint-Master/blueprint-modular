import React from 'react';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {createCanvasPlanetRenderer} from '../src/objects/planet-canvas-renderer';
import {DEFAULT_EARTH_LAYERS,parseEarthLayers, type EarthLayers} from '../src/objects/earth-layers';
import {parseModularObjectAttachment} from '../src/objects/universe';
import {EarthControls} from '../src/objects/EarthControls';
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
const ref={schemaVersion:1,kind:'modular-object',id:'earth',version:'2.0.0',style:'photorealistic',animation:{playing:true,speed:1}};
it('preserves old references, completes partial compositions and rejects malformed or misplaced layers',()=>{
 expect(parseModularObjectAttachment(ref)).toEqual(ref);
 expect(parseModularObjectAttachment({...ref,earth:{lighting:'night',cloudSpeed:0}})).toEqual({...ref,earth:{...DEFAULT_EARTH_LAYERS,lighting:'night',cloudSpeed:0}});
 for(const earth of [null,[],{lighting:'auto'},{clouds:'false'},{cloudSpeed:NaN},{cloudEvolution:4},{cloudCoverage:-1},{cloudOpacity:Infinity},{url:'evil'}])expect(parseModularObjectAttachment({...ref,earth})).toBeUndefined();
 expect(parseModularObjectAttachment({...ref,id:'mars',earth:{}})).toBeUndefined();
 expect(parseEarthLayers({cloudSpeed:0,cloudEvolution:0})).toMatchObject({cloudSpeed:0,cloudEvolution:0});
});
it('edits independent controls, disables hidden-layer settings and restores presets',()=>{
 const onChange=vi.fn();const ui=render(<EarthControls value={DEFAULT_EARTH_LAYERS} onChange={onChange}/>);
 fireEvent.click(ui.getByRole('button',{name:'Nuit',exact:true}));expect(onChange.mock.calls.at(-1)?.[0]).toEqual({...DEFAULT_EARTH_LAYERS,lighting:'night'});
 fireEvent.change(ui.getByRole('slider',{name:'Évolution des formes'}),{target:{value:'0'}});expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({cloudEvolution:0,cloudSpeed:1});
 ui.rerender(<EarthControls value={{...DEFAULT_EARTH_LAYERS,lighting:'night',clouds:false}} onChange={onChange}/>);
 expect(ui.queryByRole('slider',{name:'Position du Soleil'})).toBeNull();expect(ui.getByRole('slider',{name:'Couverture nuageuse'})).toHaveProperty('disabled',true);
 fireEvent.click(ui.getByRole('button',{name:'Ciel dégagé'}));expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({lighting:'day',clouds:false});
});
async function scene(){
 const width=128,height=64,size=65;
 const map=(kind:string)=>{const data=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;data[i]=kind==='night'?180:kind==='clouds'?(x<width/2?190:60):20;data[i+1]=kind==='night'?70:kind==='clouds'?0:40;data[i+2]=kind==='night'?0:kind==='clouds'?0:100;data[i+3]=255;}return data;};
 class ImageStub {width=width;height=height;data=new Uint8ClampedArray();onload?:()=>void;set src(url:string){this.data=map(url);queueMicrotask(()=>this.onload?.());}}
 vi.stubGlobal('Image',ImageStub);vi.stubGlobal('document',{createElement(){let data:Uint8ClampedArray;return {getContext(){return {drawImage(image:ImageStub){data=image.data;},getImageData(){return {data};}};}};}});
 let pixels=new Uint8ClampedArray();
 const canvas={width:size,height:size,getContext(){return {createImageData(w:number,h:number){return {data:new Uint8ClampedArray(w*h*4)};},putImageData(image:{data:Uint8ClampedArray}){pixels=image.data;}};}} as unknown as HTMLCanvasElement;
 const renderer=createCanvasPlanetRenderer(canvas,{surface:'surface',clouds:'clouds',night:'night',atmosphere:[.15,.5,1],star:false,activity:1});await renderer.ready;
 const draw=(earth:Partial<EarthLayers>,time=0)=>{renderer.draw({rotation:-.25,tilt:0,pitch:0,illustrated:false,time,earth:{...DEFAULT_EARTH_LAYERS,clouds:false,atmosphere:false,...earth}});return pixels.slice();};
 return {draw,dispose:renderer.dispose};
}
describe('actual software pixels obey Earth composition',()=>{
 it('keeps forced day and night independent of the Sun, and changes coordinated illumination',async()=>{const s=await scene();
  for(const lighting of ['day','night'] as const)expect(s.draw({lighting,sunAzimuth:0})).toEqual(s.draw({lighting,sunAzimuth:180}));
  expect(s.draw({lighting:'coordinated',sunAzimuth:0})).not.toEqual(s.draw({lighting:'coordinated',sunAzimuth:180}));s.dispose();
 });
 it('shows lights on the whole night face and never on forced day',async()=>{const s=await scene();const night=s.draw({lighting:'night'}),dark=s.draw({lighting:'night',lights:false});
  for(const x of [14,32,50])expect(night[(32*65+x)*4]-dark[(32*65+x)*4]).toBeGreaterThan(100);
  expect(s.draw({lighting:'day',lights:true})).toEqual(s.draw({lighting:'day',lights:false}));s.dispose();
 });
 it('coordinates night lights with the dark hemisphere',async()=>{const s=await scene();const on=s.draw({lighting:'coordinated',sunAzimuth:90}),off=s.draw({lighting:'coordinated',sunAzimuth:90,lights:false});
  expect(on[(32*65+14)*4]-off[(32*65+14)*4]).toBeGreaterThan(100);expect(on[(32*65+50)*4]-off[(32*65+50)*4]).toBeLessThan(10);s.dispose();
 });
 it('distinguishes zero coverage, cloud drift and shape evolution without surface rotation',async()=>{const s=await scene();
  expect(s.draw({clouds:true,cloudCoverage:0})).toEqual(s.draw({clouds:false}));
  expect(s.draw({clouds:true,cloudOpacity:0})).toEqual(s.draw({clouds:false}));
  expect(s.draw({clouds:true,cloudSpeed:0,cloudEvolution:0},0)).toEqual(s.draw({clouds:true,cloudSpeed:0,cloudEvolution:0},20));
  for(const option of [{cloudSpeed:1,cloudEvolution:0},{cloudSpeed:0,cloudEvolution:1}])expect(s.draw({clouds:true,...option},0)).not.toEqual(s.draw({clouds:true,...option},20));
  const total=(p:Uint8ClampedArray)=>p.reduce((sum,n,i)=>sum+(i%4===0?n:0),0);expect(total(s.draw({clouds:true,cloudCoverage:.9}))).toBeGreaterThan(total(s.draw({clouds:true,cloudCoverage:.1})));s.dispose();
 });
 it('independently enables the atmospheric alpha halo and auroras',async()=>{const s=await scene();const off=s.draw({atmosphere:false}),on=s.draw({atmosphere:true});expect(on[3+((32*65+5)*4)]).toBeGreaterThan(off[3+((32*65+5)*4)]);
  expect(s.draw({lighting:'night',auroras:true})).not.toEqual(s.draw({lighting:'night',auroras:false}));s.dispose();
 });
});
