import {FLAG_DESIGNS} from './flags.generated';
export {FLAG_DESIGNS};
export type FlagDesignId=typeof FLAG_DESIGNS[number]['id'];
export type FlagStyle='photorealistic'|'illustration';
export interface FlagSettings{design:FlagDesignId;mode:'flat'|'waving';background:'transparent'|'midnight'|'paper';wind:number;layers:{artwork:boolean;fabric:boolean;lighting:boolean;pole:boolean}}
export const DEFAULT_FLAG_SETTINGS:FlagSettings={design:'fr',mode:'waving',background:'transparent',wind:.55,layers:{artwork:true,fabric:true,lighting:true,pole:false}};
const byId=new Map<string,typeof FLAG_DESIGNS[number]>(FLAG_DESIGNS.map(x=>[x.id,x]));
export function flagDesign(id:string){return byId.get(id);}
export function parseFlagSettings(raw:unknown):FlagSettings|undefined{
 if(raw===undefined)return {...DEFAULT_FLAG_SETTINGS,layers:{...DEFAULT_FLAG_SETTINGS.layers}};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return;
 const o=raw as Record<string,unknown>,l=o.layers as Record<string,unknown>|undefined;
 if(typeof o.design!=='string'||!flagDesign(o.design)||(o.mode!=='flat'&&o.mode!=='waving')||!['transparent','midnight','paper'].includes(String(o.background))||typeof o.wind!=='number'||!Number.isFinite(o.wind)||o.wind<0||o.wind>1||!l||['artwork','fabric','lighting','pole'].some(k=>typeof l[k]!=='boolean'))return;
 return {design:o.design as FlagDesignId,mode:o.mode,background:o.background as FlagSettings['background'],wind:o.wind,layers:{artwork:l.artwork as boolean,fabric:l.fabric as boolean,lighting:l.lighting as boolean,pole:l.pole as boolean}};
}
export function flagAssetPaths(id:FlagDesignId){return [`${id}.svg`,'manifest.json','ATTRIBUTION.txt','SOURCE-LICENSE.txt'];}
