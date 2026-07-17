import prisma from "../../../config/prisma";
import crypto from "crypto";
const fallback=new Map<string,any>();
export async function createWorkspace(ctx:any,input:any){const data={id:crypto.randomUUID(),userId:ctx.userId,name:String(input.name??"AI Builder Workspace"),language:String(input.language??"auto"),status:"ACTIVE",createdAt:new Date(),updatedAt:new Date()};const model=(prisma as any).aiBuilderWorkspace;if(model?.create)return model.create({data});fallback.set(data.id,data);return data;}
export async function listWorkspaces(ctx:any){const model=(prisma as any).aiBuilderWorkspace;if(model?.findMany)return model.findMany({where:{userId:ctx.userId},orderBy:{updatedAt:"desc"}});return [...fallback.values()].filter(x=>x.userId===ctx.userId);}
export async function saveMessage(ctx:any,workspaceId:string,role:string,content:string,metadata:any={}){const model=(prisma as any).aiBuilderMessage;const data={id:crypto.randomUUID(),workspaceId,userId:ctx.userId,role,content,metadata,createdAt:new Date()};if(model?.create)return model.create({data});return data;}
