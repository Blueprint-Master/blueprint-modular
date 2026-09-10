/** Original mathematical sculptures; artistic motion, not a physical simulation. */
export const FORMS_VERSION = "1.0.0" as const;
export const FORMS_ASSET_PATH = "/objects/forms-v1";
export const FORM_NAMES = Object.freeze({
  "form-silk": {fr:"Soie ondulante",en:"Undulating silk"},
  "form-shell": {fr:"Corolle nacrée",en:"Pearlescent corolla"},
  "form-loop": {fr:"Anneau souple",en:"Soft loop"},
  "form-ripple": {fr:"Onde concentrique",en:"Concentric wave"},
});
export type FormId = keyof typeof FORM_NAMES;
export type FormStyle = "photorealistic" | "illustration";
export const FORM_IDS = Object.freeze(Object.keys(FORM_NAMES) as FormId[]);
export const FORM_PERIOD = 12;
export function isFormId(id:string):id is FormId {return Object.prototype.hasOwnProperty.call(FORM_NAMES,id);}
export function formPosterPath(id:FormId,style:FormStyle){return `previews/${id}-${style}.webp`;}
export function formBudget(width:number,dpr=1,constrained=false){
  return {size:Math.round(Math.max(48,Math.min(constrained?224:320,width*Math.min(dpr,1.5)))),fps:constrained?12:18};
}
