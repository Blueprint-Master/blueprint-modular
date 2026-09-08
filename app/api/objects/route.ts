import {NextResponse} from "next/server";
import {MODULAR_OBJECTS} from "../../../packages/core/src/objects/catalog";
import {UNIVERSE_VERSION,UNIVERSE_PROVENANCE,UNIVERSE_ASSET_PATH} from "../../../packages/core/src/objects/universe";
export async function GET(){return NextResponse.json({schemaVersion:1,objects:MODULAR_OBJECTS.map(o=>({...o,version:o.family==="space"?UNIVERSE_VERSION:o.version,
  previewPath:o.family==="space"?`${UNIVERSE_ASSET_PATH}/previews/${o.id}-photorealistic.png`:`/objects/vector-v1/${o.id}.png`,
  variants:o.family==="space"?["photorealistic","illustration"]:["vector"],animated:o.family==="space",
  ...(o.family==="space"?{license:UNIVERSE_PROVENANCE.license,provenance:UNIVERSE_PROVENANCE,assetBasePath:UNIVERSE_ASSET_PATH}:{}),
}))},{headers:{"Cache-Control":"public, max-age=300","Access-Control-Allow-Origin":"*"}});}
