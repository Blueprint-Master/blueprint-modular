import {getServerSession} from "next-auth";
import {authOptions} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {z} from "zod";
import path from "node:path";

export const contributionSchema=z.object({
  name:z.string().trim().min(2).max(100),family:z.enum(["space","buildings","mobility","logistics","nature","characters","other"]),
  kind:z.enum(["image","planet-texture"]),license:z.enum(["CC0-1.0","CC-BY-4.0"]),
  sourceUrl:z.union([z.literal(""),z.string().trim().url().max(2048).refine(s=>/^https:\/\//.test(s))]).default(""),
  rightsConfirmed:z.literal("true"),
}).strict();
/** Contributions require a real session; never use the demo/test identity. */
export async function objectContributor(){
  const session=await getServerSession(authOptions);
  return session?.user?.email?prisma.user.findUnique({where:{email:session.user.email},select:{id:true,role:true}}):null;
}
export function canReviewObjects(user:{role:string}|null){return !!user&&["OWNER","ADMIN"].includes(user.role);}
export const objectUploadRoot=()=>path.resolve(process.env.OBJECT_UPLOAD_DIR||path.join(process.cwd(),"uploads","objects"));
export function sameOrigin(request:Request){const origin=request.headers.get("origin");return !origin||origin===new URL(request.url).origin;}
export const objectSelect={id:true,name:true,family:true,kind:true,license:true,sourceUrl:true,status:true,sha256:true,createdAt:true,author:{select:{name:true}}} as const;
export async function limitedFormData(request:Request,maxBytes=11*1024*1024){
  if(Number(request.headers.get("content-length"))>maxBytes)throw new Error("Too large");
  if(!request.body)throw new Error("Empty");const reader=request.body.getReader(),parts:Uint8Array[]=[];let size=0;
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error("Too large");}parts.push(value);}
  return new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type")||""},body:Buffer.concat(parts)}).formData();
}
