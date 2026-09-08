import {NextResponse} from "next/server";
import {readFile} from "node:fs/promises";
import {prisma} from "@/lib/prisma";
import {objectContributor,canReviewObjects} from "@/lib/objects/contributions";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;const object=await prisma.objectContribution.findUnique({where:{id}});
  if(!object)return new NextResponse(null,{status:404});
  if(object.status!=="published"){
    const user=await objectContributor();if(!user||(user.id!==object.authorId&&!canReviewObjects(user)))return new NextResponse(null,{status:404});
  }
  try{const image=await readFile(object.filePath);return new NextResponse(new Uint8Array(image),{headers:{"Content-Type":"image/webp","X-Content-Type-Options":"nosniff","Cache-Control":object.status==="published"?"public, max-age=86400":"private, no-store","Content-Security-Policy":"default-src 'none'; sandbox"}});}catch{return new NextResponse(null,{status:404});}
}
