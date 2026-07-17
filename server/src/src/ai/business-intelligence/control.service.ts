import prisma from "../../config/prisma";

export const businessAiControlService={
 async get(tenantId?:string,storeId?:string){
  const model=(prisma as any).businessAiSetting;
  if(model){
   const found=await model.findFirst({where:{tenantId:tenantId??null,storeId:storeId??null}});
   if(found)return found;
  }
  return {enabled:true,approvalRequired:true,monthlyBudgetLimit:null,allowedRoles:["ADMIN","MANAGER","MARKETING","FINANCE_MANAGER"],tenantId,storeId,persistence:"DEFAULT_UNTIL_DB1"};
 },
 async save(input:any){
  const model=(prisma as any).businessAiSetting;
  if(!model)throw new Error("BusinessAiSetting schema is not installed. Run Business AI DB1 PS1.");
  return model.upsert({where:{tenantId_storeId:{tenantId:input.tenantId,storeId:input.storeId??""}},create:input,update:input});
 }
};
