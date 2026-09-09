import {isWeatherId,WEATHER_VERSION,type WeatherId} from "./weather";
export const UNIVERSE_VERSION = "2.0.0" as const;
export const PLANET_IDS = ["mercury","venus","earth","mars","jupiter","saturn","uranus","neptune","sun","moon"] as const;
export const MOON_IDS = ["io","europa","ganymede","callisto","titan","enceladus","titania","triton"] as const;
export type MoonId = typeof MOON_IDS[number];
export type PlanetId = typeof PLANET_IDS[number] | MoonId;
export const MOON_PARENTS:Record<MoonId,string> = {io:"jupiter",europa:"jupiter",ganymede:"jupiter",callisto:"jupiter",titan:"saturn",enceladus:"saturn",titania:"uranus",triton:"neptune"};
export function isMoonId(id:string):id is MoonId{return (MOON_IDS as readonly string[]).includes(id);}
/** One secondary movement per body; artistic rates, not a weather simulation. */
export const PLANET_PITCHES:Partial<Record<PlanetId,number>>={saturn:.45,titania:-.45,triton:-.35};
export const PLANET_ACTIVITY:Partial<Record<PlanetId,number>> = {earth:1,venus:2,jupiter:2,saturn:2,uranus:2,neptune:2,titan:2,sun:3};
export function planetSurfacePath(id:PlanetId,style:PlanetStyle){return `compact/${style==="illustration"&&!isMoonId(id)?"illustrations/":""}${id}.webp`;}
export function planetPosterPath(id:PlanetId,style:PlanetStyle){return `previews/${id}-${style}.webp`;}
export function planetAssetPaths(id:PlanetId,style:PlanetStyle){return [planetSurfacePath(id,style),planetPosterPath(id,style),...(id==="earth"?["compact/earth-clouds.webp"]:[]),...(id==="saturn"?["saturn-rings.png"]:[])];}
export type PlanetStyle = "photorealistic" | "illustration";
export const UNIVERSE_ASSET_PATH = "/objects/universe-v2";
export const PLANET_ATMOSPHERES: Record<PlanetId, readonly [number,number,number]> = {
  mercury:[0,0,0],venus:[.8,.5,.2],earth:[.15,.5,1],mars:[.55,.2,.08],jupiter:[.4,.28,.15],
  saturn:[.45,.35,.18],uranus:[.25,.65,.7],neptune:[.15,.3,.85],sun:[1,.35,.03],moon:[0,0,0],
  io:[0,0,0],europa:[0,0,0],ganymede:[0,0,0],callisto:[0,0,0],titan:[.65,.4,.1],enceladus:[0,0,0],titania:[0,0,0],triton:[0,0,0],
};
export function isPlanetId(id:string):id is PlanetId{return (PLANET_IDS as readonly string[]).includes(id)||isMoonId(id);}
export const UNIVERSE_PROVENANCE = Object.freeze({
  author:"Solar System Scope / INOVE",source:"https://www.solarsystemscope.com/textures/",
  license:"CC-BY-4.0",licenseUrl:"https://creativecommons.org/licenses/by/4.0/",
  changes:"Textures mapped onto an illuminated rotating sphere; illustration surfaces are AI-generated original paintings (see illustration-manifest.json); clouds and rings remain credited to Solar System Scope. Artistic visualization, not an ephemeris.",
});

export const NASA_MOON_PROVENANCE = Object.freeze({author:"NASA 3D Resources",source:"https://github.com/nasa/NASA-3D-Resources",license:"LicenseRef-NASA-Media",licenseUrl:"https://www.nasa.gov/nasa-brand-center/images-and-media/",changes:"NASA source maps recompressed without flips. Illustration uses the same map with Modular's drawn shading. Artistic presentation; no NASA endorsement. Source revisions and hashes: moon-manifest.json."});
const CELESTIA_MOON_PROVENANCE={
 titania:{author:"ItzImcool / Paul Schenk / NASA–JPL–Ted Stryk",source:"https://github.com/CelestiaProject/CelestiaContent/blob/1993a082ee6307c0df7fdc0828eb117a0e8e9958/textures/medres/titania.jpg.license",license:"CC-BY-SA-4.0",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/",changes:"Recompressed map and rendered posters retain CC BY-SA 4.0. Includes unobserved uniform areas; no invented geological detail. See moon-manifest.json."},
 triton:{author:"Askaniy Anpilogov / NASA–JPL-Caltech–ASI–USGS",source:"https://github.com/CelestiaProject/CelestiaContent/blob/1993a082ee6307c0df7fdc0828eb117a0e8e9958/textures/hires/triton.jpg.license",license:"CC-BY-3.0",licenseUrl:"https://creativecommons.org/licenses/by/3.0/",changes:"Recompressed map and rendered posters retain CC BY 3.0. Includes reconstructed/unobserved areas. See moon-manifest.json."},
} as const;
export function planetProvenance(id:string){return id==="titania"||id==="triton"?CELESTIA_MOON_PROVENANCE[id]:isMoonId(id)?NASA_MOON_PROVENANCE:UNIVERSE_PROVENANCE;}

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
export interface WeatherObjectAttachment {schemaVersion:1;kind:"modular-object";id:WeatherId;version:typeof WEATHER_VERSION;style:PlanetStyle;animation:{playing:boolean;speed:number}}
export type ModularObjectAttachment = BuiltinObjectAttachment | CommunityObjectAttachment | VectorObjectAttachment | WeatherObjectAttachment;
export function parseModularObjectAttachment(raw:unknown):ModularObjectAttachment|undefined {
  if(!raw||typeof raw!=="object")return;
  const o=raw as Record<string,unknown>,a=o.animation as Record<string,unknown>|undefined;
  if(o.schemaVersion===1&&o.kind==="modular-object"&&(VECTOR_IDS as readonly unknown[]).includes(o.id)&&o.version==="1.0.0"&&o.style==="vector"&&a?.playing===false&&a?.speed===1)return {schemaVersion:1,kind:"modular-object",id:o.id as VectorObjectAttachment['id'],version:"1.0.0",style:"vector",animation:{playing:false,speed:1}};
  if(o.schemaVersion!==1||o.kind!=="modular-object"||typeof o.id!=="string"||
    (o.style!=="photorealistic"&&o.style!=="illustration")||!a||typeof a.playing!=="boolean"||typeof a.speed!=="number"||!Number.isFinite(a.speed)||a.speed<.1||a.speed>3)return;
  if(isPlanetId(o.id)&&o.version===UNIVERSE_VERSION)return {schemaVersion:1,kind:"modular-object",id:o.id,version:UNIVERSE_VERSION,style:o.style,animation:{playing:a.playing,speed:a.speed}};
  if(isWeatherId(o.id)&&o.version===WEATHER_VERSION)return {schemaVersion:1,kind:"modular-object",id:o.id,version:WEATHER_VERSION,style:o.style,animation:{playing:a.playing,speed:a.speed}};
  if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(o.id)&&o.version==="1.0.0"&&typeof o.sha256==="string"&&/^[0-9a-f]{64}$/.test(o.sha256))return {schemaVersion:1,kind:"modular-object",id:o.id,version:"1.0.0",sha256:o.sha256,style:o.style,animation:{playing:a.playing,speed:a.speed}};
}
