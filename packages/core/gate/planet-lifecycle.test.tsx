import React from 'react';
import {createRoot,Root} from 'react-dom/client';
import {act} from 'react';
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {PlanetObject} from '../src/objects/PlanetObject';
import {planetBudget,createPlanetClock} from '../src/objects/planet-budget';
const mocked=vi.hoisted(()=>({draw:vi.fn(),dispose:vi.fn(),create:vi.fn()}));
vi.mock('../src/objects/planet-renderer',()=>({createPlanetRenderer:mocked.create}));
let root:Root,element:HTMLDivElement,intersection:(entries:{isIntersecting:boolean}[])=>void,mediaChange:()=>void,reduced=false;
beforeEach(()=>{
 vi.useFakeTimers();vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT',true);
 mocked.draw.mockClear();mocked.dispose.mockClear();mocked.create.mockReset();mocked.create.mockImplementation(()=>({ready:Promise.resolve(),draw:mocked.draw,dispose:mocked.dispose}));
 vi.stubGlobal('IntersectionObserver',class {constructor(callback:typeof intersection){intersection=callback;}observe(){}disconnect(){}});
 vi.stubGlobal('matchMedia',(query:string)=>({get matches(){return query.includes('reduced-motion')&&reduced;},addEventListener(_event:string,callback:()=>void){if(query.includes('reduced-motion'))mediaChange=callback;},removeEventListener(){}}));
 reduced=false;element=document.createElement('div');document.body.append(element);root=createRoot(element);
});
afterEach(async()=>{await act(async()=>root.unmount());element.remove();vi.useRealTimers();vi.unstubAllGlobals();});
async function show(){await act(async()=>intersection([{isIntersecting:true}]));}
describe('living objects stay idle outside the selected view',()=>{
 it('cancels pending renderer acquisition when the component unmounts',async()=>{
  await act(async()=>root.render(<PlanetObject id="sun" label="Sun"/>));
  act(()=>intersection([{isIntersecting:true}]));
  await act(async()=>root.unmount());
  expect(mocked.create).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(0);
 });
 it('does not initialise a renderer until visible; disposes and stops offscreen',async()=>{
  await act(async()=>root.render(<PlanetObject id="earth" label="Earth"/>));expect(mocked.create).not.toHaveBeenCalled();
  await show();expect(mocked.create).toHaveBeenCalledTimes(1);expect(mocked.create.mock.calls[0][1].surface).toContain('compact/earth.webp');
  await act(async()=>vi.advanceTimersByTime(1000));expect(mocked.draw.mock.calls.length).toBeGreaterThan(10);
  await act(async()=>intersection([{isIntersecting:false}]));const count=mocked.draw.mock.calls.length;
  await act(async()=>vi.advanceTimersByTime(2000));expect(mocked.draw).toHaveBeenCalledTimes(count);expect(mocked.dispose).toHaveBeenCalledTimes(1);
 });
 it.each(['earth','sun'] as const)('pause and reduced motion freeze %s, with no timer left',async id=>{
  await act(async()=>root.render(<PlanetObject id={id} label="Earth"/>));await show();
  await act(async()=>vi.advanceTimersByTime(1000));
  await act(async()=>root.render(<PlanetObject id={id} label="Earth" playing={false}/>));
  const paused=mocked.draw.mock.calls.at(-1)![0];expect(paused.time).toBeGreaterThan(0);
  expect(vi.getTimerCount()).toBe(0);await act(async()=>vi.advanceTimersByTime(5000));
  await act(async()=>root.render(<PlanetObject id={id} label="Earth"/>));
  expect(mocked.draw.mock.calls.at(-1)![0]).toEqual(paused);
  reduced=true;await act(async()=>mediaChange());expect(vi.getTimerCount()).toBe(0);
 });
 it('catalogue posters never allocate a renderer or animation clock',async()=>{
  await act(async()=>root.render(<PlanetObject id="europa" label="Europe" thumbnail/>));
  expect(mocked.create).not.toHaveBeenCalled();expect(element.querySelector('canvas')).toBeNull();expect(vi.getTimerCount()).toBe(0);
 });
 it('caps actual backing pixels even with high DPR and large requested size',()=>{
  expect(planetBudget(1000,3,false,false)).toEqual({size:512,fps:24});
  expect(planetBudget(1000,3,true,false)).toEqual({size:320,fps:18});
  expect(planetBudget(1000,3,true,true)).toEqual({size:224,fps:12});
  expect(planetBudget(160,3,true,false).size).toBe(160);
 });
 it('uses one bounded timer, and restarting cannot create parallel loops',()=>{
  const draw=vi.fn(),clock=createPlanetClock(12,draw);clock.start();clock.start();expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(1000);expect(draw.mock.calls.length).toBeLessThanOrEqual(13);expect(draw.mock.calls.length).toBeGreaterThanOrEqual(11);
  clock.stop();expect(vi.getTimerCount()).toBe(0);const count=draw.mock.calls.length;vi.advanceTimersByTime(1000);expect(draw).toHaveBeenCalledTimes(count);
 });
});

it('freezes cloud clocks at zero without rewinding, and updates layers without reallocating',async()=>{
 await act(async()=>root.render(<PlanetObject id="earth" label="Terre" earth={{cloudSpeed:2,cloudEvolution:1}}/>));await show();
 await act(async()=>vi.advanceTimersByTime(1000));const before=mocked.draw.mock.calls.at(-1)![0];
 expect(before.cloudTime).toBeCloseTo(before.time*2);expect(before.evolutionTime).toBeCloseTo(before.time);
 await act(async()=>root.render(<PlanetObject id="earth" label="Terre" earth={{lighting:'night',cloudSpeed:0,cloudEvolution:0}}/>));
 await act(async()=>vi.advanceTimersByTime(1000));const after=mocked.draw.mock.calls.at(-1)![0];
 expect(after.cloudTime).toBe(before.cloudTime);expect(after.evolutionTime).toBe(before.evolutionTime);expect(after.rotation).not.toBe(before.rotation);expect(after.earth.lighting).toBe('night');expect(mocked.create).toHaveBeenCalledTimes(1);
});
