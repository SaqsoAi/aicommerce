export type TenantContext={tenantId:string;storeId?:string};
export function tenantOwnedWhere(context:TenantContext){return {tenantId:context.tenantId,...(context.storeId?{storeId:context.storeId}:{})};}
export function assertTenantContext(value:any):TenantContext{if(!value?.tenantId)throw Object.assign(new Error("Tenant context required"),{code:"TENANT_CONTEXT_REQUIRED"});return {tenantId:String(value.tenantId),storeId:value.storeId?String(value.storeId):undefined};}
