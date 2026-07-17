import type {NextFunction,Response} from "express";
export function requireResolvedTenant(req:any,res:Response,next:NextFunction){
 if(String(req.user?.role)==="SUPER_ADMIN")return next();
 const tenantId=req.user?.tenantId;
 if(!tenantId)return res.status(403).json({success:false,error:{code:"TENANT_CONTEXT_REQUIRED",message:"Tenant context is required"}});
 req.tenantContext={tenantId:String(tenantId),storeId:req.user?.storeId?String(req.user.storeId):undefined};
 return next();
}
export function tenantWhere(req:any){const c=req.tenantContext??req.user??{};return {tenantId:String(c.tenantId),...(c.storeId?{storeId:String(c.storeId)}:{})};}
