export const UNIVERSE_VERSION = "2.0.0" as const;
export const PLANET_IDS = ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","sun","moon"] as const;
export type PlanetId = typeof PLANET_IDS[number];
export type PlanetStyle = "photorealistic" | "illustration";
export const UNIVERSE_ASSET_PATH = "/objects/universe-v2";
export const PLANET_ATMOSPHERES: Record<PlanetId, readonly [number,number,number]> = {
  mercury:[0,0,0],venus:[.8,.5,.2],earth:[.15,.5,1],mars:[.55,.2,.08],jupiter:[.4,.28,.15],
  saturn:[.45,.35,.18],uranus:[.25,.65,.7],neptune:[.15,.3,.85],sun:[1,.35,.03],moon:[0,0,0],
};
export function isPlanetId(id:string):id is PlanetId{return (PLANET_IDS as readonly string[]).includes(id);}
export const UNIVERSE_PROVENANCE = Object.freeze({
  author:"Solar System Scope / INOVE",source:"https://www.solarsystemscope.com/textures/",
  license:"CC-BY-4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0/",
  changes:"Textures mapped onto an illuminated rotating sphere; illustration surfaces are AI-generated original paintings (see illustration-manifest.json); clouds and rings remain credited to Solar System Scope. Artistic visualization, not an ephemeris.",
});

/** Portable, data-only attachment. Exact identity survives chat and generation. */
export interface BuiltinObjectAttachment {
  schemaVersion:1; kind:"modular-object"; id:PlanetId; version:typeof UNIVERSE_VERSION;
  style:PlanetStyle; animation:{playing:boolean; speed:number};
}
export interface CommunityObjectAttachment {
  schemaVersion:1; kind:"modular-object"; id:string; version:"1.0.0";
  style:PlanetStyle; animation:{playing:boolean;speed:number}; sha256:string;
}
export const VECTOR_IDS = ["house","building","warehouse","factory","car","van","truck","pallet","parcel","container"] as const;
export interface VectorObjectAttachment {schemaVersion:1;kind:"modular-object";id:typeof VECTOR_IDS[number];version:"1.0.0";style:"vector";animation:{playing:false;speed:1}}
export type ModularObjectAttachment = BuiltinObjectAttachment | CommunityObjectAttachment | VectorObjectAttachment;
export function parseModularObjectAttachment(raw:unknown):ModularObjectAttachment|undefined {
  if(!raw||typeof raw!=="object")return;
  const o=raw as Record<string,unknown>,a=o.animation as Record<string,unknown>|undefined;
  if(o.schemaVersion===1&&o.kind==="modular-object"&&(VECTOR_IDS as readonly unknown[]).includes(o.id)&&o.version==="1.0.0"&&o.style==="vector"&&a?.playing===false&&a?.speed===1)return {schemaVersion:1,kind:"modular-object",id:o.id as VectorObjectAttachment['id'],version:"1.0.0",style:"vector",animation:{playing:false,speed:1}};
  if(o.schemaVersion!==1||o.kind!=="modular-object"||typeof o.id!=="string"||
    (o.style!=="photorealistic"&&o.style!=="illustration")||!a||typeof a.playing!=="boolean"||typeof a.speed!=="number"||!Number.isFinite(a.speed)||a.speed<.1||a.speed>3)return;
  if(isPlanetId(o.id)&&o.version===UNIVERSE_VERSION)return {schemaVersion:1,kind:"modular-object",id:o.id,version:UNIVERSE_VERSION,style:o.style,animation:{playing:a.playing,speed:a.speed}};
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(o.id)&&o.version==="1.0.0"&&typeof o.sha256==="string"&&/^[0-9a-f]{64}$/.test(o.sha256))return {schemaVersion:1,kind:"modular-object",id:o.id,version:"1.0.0",sha256:o.sha256,style:o.style,animation:{playing:a.playing,speed:a.speed}};
}
