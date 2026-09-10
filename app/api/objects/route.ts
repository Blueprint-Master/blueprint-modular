import {isFormId,FORMS_ASSET_PATH,formPosterPath} from "../../../packages/core/src/objects/forms";
import {NextResponse} from "next/server";
import {DISCOVERABLE_OBJECTS} from "../../../packages/core/src/objects/catalog";
import {isWeatherId,WEATHER_ASSET_PATH,weatherPosterPath} from "../../../packages/core/src/objects/weather";
import {UNIVERSE_VERSION,planetProvenance,UNIVERSE_ASSET_PATH,planetPosterPath,type PlanetId} from "../../../packages/core/src/objects/universe";
export async function GET(){return NextResponse.json({schemaVersion:1,objects:DISCOVERABLE_OBJECTS.map(o=>({...o,version:o.family==="space"?UNIVERSE_VERSION:o.version,
  previewPath:isFormId(o.id)?`${FORMS_ASSET_PATH}/${formPosterPath(o.id,"photorealistic")}`:isWeatherId(o.id)?`${WEATHER_ASSET_PATH}/${weatherPosterPath(o.id,"photorealistic")}`:o.family==="space"?`${UNIVERSE_ASSET_PATH}/${planetPosterPath(o.id as PlanetId,"photorealistic")}`:`/objects/vector-v1/${o.id}.png`,
  variants:o.family==="space"||o.family==="weather"||o.family==="forms"?["photorealistic","illustration"]:["vector"],animated:o.family==="space"||o.family==="weather"||o.family==="forms",
  ...(o.family==="forms"?{assetBasePath:FORMS_ASSET_PATH}:{}),
  ...(o.family==="weather"?{assetBasePath:WEATHER_ASSET_PATH}:{}),
  ...(o.family==="space"?{license:planetProvenance(o.id).license,provenance:planetProvenance(o.id),assetBasePath:UNIVERSE_ASSET_PATH}:{}),
}))},{headers:{"Cache-Control":"public, max-age=300","Access-Control-Allow-Origin":"*"}});}
