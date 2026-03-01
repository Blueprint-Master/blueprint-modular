import { NextResponse } from "next/server";
import { COMPONENTS_DOC } from "@/lib/docs/components";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const name = searchParams.get("name");

  let data = [...COMPONENTS_DOC];
  if (name) data = data.filter((c) => c.name === name);
  if (category)
    data = data.filter(
      (c) => c.category === (category as (typeof data)[0]["category"])
    );

  const version =
    (process.env.npm_package_version as string | undefined) ?? "0.0.0";

  return NextResponse.json(
    {
      components: data,
      total: data.length,
      version,
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
