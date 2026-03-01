import { NextResponse } from "next/server";
import { getComponentDoc } from "@/lib/docs/components";

export async function GET(
  _req: Request,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;
  const doc = getComponentDoc(name);
  if (!doc) {
    return NextResponse.json(
      { error: "Component not found" },
      { status: 404 }
    );
  }
  return NextResponse.json(doc, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
