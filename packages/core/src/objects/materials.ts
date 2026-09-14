/** Original procedural material studies; artistic motion, not a physical simulation. */
export const MATERIAL_VERSION = "1.0.0" as const;
export const MATERIAL_ASSET_PATH = "/objects/materials-v1";
export const MATERIAL_NAMES = Object.freeze({
  "material-crystal": {fr:"Cristal en croissance",en:"Growing crystal"},
  "material-geode": {fr:"Géode irisée",en:"Iridescent geode"},
  "material-liquid-metal": {fr:"Métal liquide",en:"Liquid metal"},
  "material-dichroic-glass": {fr:"Verre dichroïque",en:"Dichroic glass"},
  "material-obsidian": {fr:"Obsidienne vivante",en:"Living obsidian"},
});
export type MaterialId = keyof typeof MATERIAL_NAMES;
export type MaterialStyle = "photorealistic" | "illustration";
export const MATERIAL_IDS = Object.freeze(Object.keys(MATERIAL_NAMES) as MaterialId[]);
export const MATERIAL_PERIOD = 12;
export function isMaterialId(id:string):id is MaterialId{return Object.prototype.hasOwnProperty.call(MATERIAL_NAMES,id);}
export function materialPosterPath(id:MaterialId,style:MaterialStyle){return `previews/${id}-${style}.svg`;}
export function materialBudget(width:number,dpr=1,constrained=false){
 return {size:Math.round(Math.max(48,Math.min(constrained?224:320,width*Math.min(dpr,1.5)))),fps:constrained?12:18};
}
