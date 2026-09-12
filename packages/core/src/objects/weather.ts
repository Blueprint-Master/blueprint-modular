/** Original, deterministic atmospheric studies. Artistic cycles, not forecasts. */
export const WEATHER_VERSION = "1.0.0" as const;
export const WEATHER_ASSET_PATH = "/objects/weather-v1";
export const WEATHER_NAMES = Object.freeze({
  "weather-sun": {fr:"Grand soleil",en:"Clear sunshine"},
  "weather-fair": {fr:"Éclaircies",en:"Sunny intervals"},
  "weather-overcast": {fr:"Ciel couvert",en:"Overcast sky"},
  "weather-rain": {fr:"Pluie",en:"Rain"},
  "weather-storm": {fr:"Orage",en:"Thunderstorm"},
  "weather-snow": {fr:"Neige",en:"Snow"},
});
export type WeatherId = keyof typeof WEATHER_NAMES;
export type WeatherStyle = "photorealistic" | "illustration";
export const WEATHER_IDS = Object.freeze(Object.keys(WEATHER_NAMES) as WeatherId[]);
export function isWeatherId(id:string):id is WeatherId { return Object.prototype.hasOwnProperty.call(WEATHER_NAMES,id); }
export function weatherSurfacePath(style:WeatherStyle) { return `cloud-${style}.webp`; }
export function weatherMaterialPath(id:WeatherId,style:WeatherStyle) { return id==="weather-sun"?`sun-${style}.webp`:weatherSurfacePath(style); }
export function weatherAssetPaths(id:WeatherId,style:WeatherStyle) { return [weatherPosterPath(id,style),weatherMaterialPath(id,style)]; }
export function weatherPosterPath(id:WeatherId,style:WeatherStyle) { return `previews/${id}-${style}.webp`; }
export function weatherBudget(width:number,dpr=1,constrained=false) {
  return {size:Math.round(Math.max(48,Math.min(constrained?224:320,width*Math.min(dpr,1.5)))),fps:constrained?12:18};
}
