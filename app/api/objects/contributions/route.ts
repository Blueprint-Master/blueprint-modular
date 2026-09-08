import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {contributionSchema,objectContributor,canReviewObjects,objectSelect,objectUploadRoot,sameOrigin,limitedFormData} from "@/lib/objects/contributions";
import {mkdir,writeFile,unlink} from "node:fs/promises";
import {createHash,randomUUID} from "node:crypto";
import path from "node:path";
import sharp from "sharp";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:Request){
  const query=new URL(request.url).searchParams,own=query.get("scope")==="mine",cursor=query.get("cursor");
  if(cursor&&!/^[0-9a-f-]{36}$/.test(cursor))return NextResponse.json({error:"Page invalide"},{status:400});
  const user=own?await objectContributor():null;
  if(own&&!user)return NextResponse.json({error:"Connectez-vous pour voir vos objets."},{status:401});
  const objects=await prisma.objectContribution.findMany({where:own?(canReviewObjects(user)?{}:{authorId:user!.id}):{status:"published"},select:objectSelect,orderBy:[{createdAt:"desc"},{id:"desc"}],take:101,...(cursor?{cursor:{id:cursor},skip:1}:{})});
  return NextResponse.json({objects:objects.slice(0,100),nextCursor:objects.length>100?objects[99].id:null,canReview:canReviewObjects(user)});
}
export async function POST(request:Request){
  if(!sameOrigin(request))return NextResponse.json({error:"Origine invalide"},{status:403});
  const user=await objectContributor();if(!user)return NextResponse.json({error:"Connectez-vous pour proposer un objet."},{status:401});
  const pending=await prisma.objectContribution.count({where:{authorId:user.id,status:"pending"}});
  if(pending>=20)return NextResponse.json({error:"Vous avez déjà 20 objets en cours de validation."},{status:429});
  let form:FormData;try{form=await limitedFormData(request);}catch{return NextResponse.json({error:"Fichier trop volumineux ou formulaire invalide (10 Mo maximum)."},{status:400});}
  const parsed=contributionSchema.safeParse(Object.fromEntries([...form.entries()].filter(([key])=>key!=="file")));
  const file=form.get("file");
  if(!parsed.success||!(file instanceof File)||file.size===0||file.size>10*1024*1024||!["image/png","image/jpeg","image/webp"].includes(file.type))return NextResponse.json({error:"Vérifiez les champs, les droits et le fichier PNG, JPEG ou WebP (10 Mo maximum)."},{status:400});
  let image:Buffer;
  try{
    const input=Buffer.from(await file.arrayBuffer()),processor=sharp(input,{limitInputPixels:16777216,animated:false}),meta=await processor.metadata();
    if(!["png","jpeg","webp"].includes(meta.format||"")||(meta.pages??1)>1)throw new Error("Format");
    if(parsed.data.kind==="planet-texture"&&(!meta.width||!meta.height||meta.width!==meta.height*2))return NextResponse.json({error:"Une texture de planète doit avoir un ratio 2:1, par exemple 2048 × 1024."},{status:400});
    image=await processor.rotate().resize({width:2048,height:2048,fit:"inside",withoutEnlargement:true}).webp({quality:90}).toBuffer();
  }catch{return NextResponse.json({error:"Impossible de lire cette image."},{status:400});}
  const id=randomUUID(),filePath=path.join(objectUploadRoot(),`${id}.webp`);
  await mkdir(objectUploadRoot(),{recursive:true});await writeFile(filePath,image,{flag:"wx"});
  try{const {rightsConfirmed,...metadata}=parsed.data;void rightsConfirmed;
    const object=await prisma.objectContribution.create({data:{id,authorId:user.id,name:metadata.name!,family:metadata.family!,kind:metadata.kind!,license:metadata.license!,sourceUrl:metadata.sourceUrl!,filePath,sha256:createHash("sha256").update(image).digest("hex")},select:objectSelect});
    return NextResponse.json({object},{status:201});
  }catch{await unlink(filePath).catch(()=>{});return NextResponse.json({error:"L’objet n’a pas pu être enregistré."},{status:500});}
}
