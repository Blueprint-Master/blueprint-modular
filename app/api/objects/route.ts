import {NextResponse} from "next/server";
import {DISCOVERABLE_OBJECTS} from "../../../packages/core/src/objects/catalog";
import {UNIVERSE_VERSION,planetProvenance,UNIVERSE_ASSET_PATH,planetPosterPath,type PlanetId} from "../../../packages/core/src/objects/universe";
export async function GET(){return NextResponse.json({schemaVersion:1,objects:DISCOVERABLE_OBJECTS.map(o=>({...o,version:o.family==="space"?UNIVERSE_VERSION:o.version,
  previewPath:o.family==="space"?`${UNIVERSE_ASSET_PATH}/${planetPosterPath(o.id as PlanetId,"photorealistic")}`:`/objects/vector-v1/${o.id}.png`,
  variants:o.family==="space"?["photorealistic","illustration"]:["vector"],animated:o.family==="space",
  ...(o.family==="space"?{license:planetProvenance(o.id).license,provenance:planetProvenance(o.id),assetBasePath:UNIVERSE_ASSET_PATH}:{}),
}))},{headers:{"Cache-Control":"public, max-age=300","Access-Control-Allow-Origin":"*"}});}
