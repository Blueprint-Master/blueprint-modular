/** Original procedural water studies; artistic motion, not a fluid simulation. */
export const WATER_VERSION = "1.0.0" as const;
export const WATER_ASSET_PATH = "/objects/water-v1";
export const WATER_NAMES = Object.freeze({
  "water-wave": {fr:"Vague déferlante",en:"Breaking wave"},
  "water-ripple": {fr:"Onde d’impact",en:"Impact ripple"},
  "water-waterfall": {fr:"Cascade vive",en:"Living waterfall"},
  "water-whirlpool": {fr:"Tourbillon",en:"Whirlpool"},
});
export type WaterId = keyof typeof WATER_NAMES;
export type WaterStyle = "photorealistic" | "illustration";
export const WATER_IDS = Object.freeze(Object.keys(WATER_NAMES) as WaterId[]);
export const WATER_PERIOD = 12;
export function isWaterId(id:string):id is WaterId{return Object.prototype.hasOwnProperty.call(WATER_NAMES,id);}
export function waterPosterPath(id:WaterId,style:WaterStyle){return `previews/${id}-${style}.webp`;}
export function waterSurfacePath(style:WaterStyle){return `water-${style}.webp`;}
export function waterAssetPaths(id:WaterId,style:WaterStyle){return [waterPosterPath(id,style),waterSurfacePath(style)];}
export function waterBudget(width:number,dpr=1,constrained=false){
  return {size:Math.round(Math.max(48,Math.min(constrained?224:320,width*Math.min(dpr,1.5)))),fps:constrained?12:18};
}
