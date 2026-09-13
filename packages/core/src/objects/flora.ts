/** Original procedural botanical studies; artistic motion, not a growth simulation. */
export const FLORA_VERSION = "1.0.0" as const;
export const FLORA_ASSET_PATH = "/objects/flora-v1";
export const FLORA_NAMES = Object.freeze({
  "flora-fern": {fr:"Fougère qui s’éveille",en:"Awakening fern"},
  "flora-blossom": {fr:"Pivoine vivante",en:"Living peony"},
  "flora-meadow": {fr:"Prairie sous le vent",en:"Windblown meadow"},
  "flora-branch": {fr:"Branche de ginkgo",en:"Ginkgo branch"},
});
export type FloraId = keyof typeof FLORA_NAMES;
export type FloraStyle = "photorealistic" | "illustration";
export const FLORA_IDS = Object.freeze(Object.keys(FLORA_NAMES) as FloraId[]);
export const FLORA_PERIOD = 12;
export function isFloraId(id:string):id is FloraId{return Object.prototype.hasOwnProperty.call(FLORA_NAMES,id);}
export function floraPosterPath(id:FloraId,style:FloraStyle){return `previews/${id}-${style}.svg`;}
export function floraBudget(width:number,dpr=1,constrained=false){
 return {size:Math.round(Math.max(48,Math.min(constrained?224:320,width*Math.min(dpr,1.5)))),fps:constrained?12:18};
}
