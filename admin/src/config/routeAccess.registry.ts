import type{UserRole}from "@/config/roles";
export type RouteAccess={prefix:string;roles:UserRole[];tenantRequired:boolean;storeRequired:boolean};
export const routeAccess:RouteAccess[]=[
 {prefix:"/system",roles:["SUPER_ADMIN"],tenantRequired:false,storeRequired:false},
 {prefix:"/super-admin",roles:["SUPER_ADMIN"],tenantRequired:false,storeRequired:false},
 {prefix:"/ai-development-copilot",roles:["SUPER_ADMIN"],tenantRequired:false,storeRequired:false},
 {prefix:"/business-ai",roles:["SUPER_ADMIN","ADMIN","MANAGER"],tenantRequired:false,storeRequired:false},
 {prefix:"/products",roles:["ADMIN","MANAGER"],tenantRequired:true,storeRequired:false},
 {prefix:"/inventory",roles:["ADMIN","MANAGER","INVENTORY","WAREHOUSE_MANAGER"],tenantRequired:true,storeRequired:false},
 {prefix:"/campaigns",roles:["ADMIN","MARKETING"],tenantRequired:true,storeRequired:false}
];
export function canOpenRoute(path:string,role:UserRole){const rule=routeAccess.find(x=>path===x.prefix||path.startsWith(x.prefix+"/"));return !rule||rule.roles.includes(role);}
