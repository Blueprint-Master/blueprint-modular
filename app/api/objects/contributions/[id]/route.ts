import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {objectContributor,canReviewObjects,objectSelect,sameOrigin} from "@/lib/objects/contributions";
import {z} from "zod";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;const object=await prisma.objectContribution.findFirst({where:{id,status:"published"},select:objectSelect});
  return object?NextResponse.json({object},{headers:{"Cache-Control":"public, max-age=300"}}):NextResponse.json({error:"Objet indisponible"},{status:404});
}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOrigin(request))return NextResponse.json({error:"Origine invalide"},{status:403});
  const user=await objectContributor();if(!canReviewObjects(user))return NextResponse.json({error:"Validation réservée aux administrateurs."},{status:403});
  const parsed=z.object({status:z.enum(["published","rejected"])}).strict().safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:"Décision invalide"},{status:400});
  const {id}=await params;
  const updated=await prisma.objectContribution.updateMany({where:{id,status:"pending"},data:{status:parsed.data.status,reviewedAt:new Date()}});
  if(!updated.count)return NextResponse.json({error:"Cet objet est déjà traité ou indisponible."},{status:409});
  return NextResponse.json({object:await prisma.objectContribution.findUnique({where:{id},select:objectSelect})});
}
