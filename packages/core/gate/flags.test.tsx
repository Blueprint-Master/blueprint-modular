import React from 'react';
import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {FLAG_DESIGNS,DEFAULT_FLAG_SETTINGS,parseFlagSettings,parseModularObjectAttachment,FlagObject,DISCOVERABLE_OBJECTS} from '../src/objects';
import {flagSurface} from '../src/objects/flag-cloth';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
describe('Flag references and cloth',()=>{
 it('round trips all reviewed motifs in both styles without executable data',()=>{for(const d of FLAG_DESIGNS)for(const style of ['photorealistic','illustration']){const r={schemaVersion:1,kind:'modular-object',id:'flag-banner',version:'1.0.0',style,animation:{playing:false,speed:1},flag:{...DEFAULT_FLAG_SETTINGS,design:d.id}};expect(parseModularObjectAttachment({...r,code:'bad()'})).toEqual(r);}});
 it('rejects arbitrary paths, invalid wind and incomplete layers',()=>{for(const patch of [{design:'../../secret'},{wind:NaN},{wind:2},{layers:{}},{background:'url(evil)'}])expect(parseFlagSettings({...DEFAULT_FLAG_SETTINGS,...patch})).toBeUndefined();});
 it('keeps all 50 states and candidates separate from approved discovery',()=>{expect(FLAG_DESIGNS.filter(d=>d.group==='us-state')).toHaveLength(50);expect(DISCOVERABLE_OBJECTS.some(d=>d.id==='flag-banner')).toBe(false);});
 it('keeps the hoist anchored, deforms locally and loops exactly',()=>{for(const t of [0,1,3,9]){const p=flagSurface(0,.4,t,1);expect(p.x).toBeCloseTo(0,12);expect(p.y).toBe(.4);expect(p.z).toBeCloseTo(0,12);}const a=flagSurface(.8,.3,0,.7),b=flagSurface(.8,.3,3,.7),c=flagSurface(.8,.3,12,.7);expect(Math.abs(a.z-b.z)).toBeGreaterThan(.03);for(const k of ['x','y','z'] as const)expect(c[k]).toBeCloseTo(a[k],10);expect(flagSurface(.8,.3,9,1,true).z).toBeCloseTo(0,12);});
 it('renders a lazy transparent poster without a canvas in thumbnails',()=>{const html=renderToStaticMarkup(<FlagObject thumbnail flag={{...DEFAULT_FLAG_SETTINGS,design:'np'}}/>);expect(html).toContain('/np.svg');expect(html).not.toContain('<canvas');expect(html).toContain('background:transparent');});
 it('ships exactly fingerprinted derivatives with per-asset provenance',()=>{const root='../../public/objects/flags-v1/';const m=JSON.parse(readFileSync(root+'manifest.json','utf8'));expect(m.assets).toHaveLength(FLAG_DESIGNS.length);for(const a of m.assets){const bytes=readFileSync(root+a.id+'.svg');expect(createHash('sha256').update(bytes).digest('hex')).toBe(a.runtimeSha256);expect(a.sourceSha256).toMatch(/^[a-f0-9]{64}$/);expect(a.license).toBeTruthy();expect(Math.max(a.width,a.height)).toBeLessThanOrEqual(768);}});
});
