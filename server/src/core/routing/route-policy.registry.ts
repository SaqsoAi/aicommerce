export type RouteScope="PLATFORM"|"TENANT"|"CUSTOMER"|"PUBLIC";
export type RoutePolicy={prefix:string;scope:RouteScope;roles:string[];tenantRequired:boolean;storeRequired:boolean};
export const routePolicies:RoutePolicy[]=[
 {prefix:"/api/platform",scope:"PLATFORM",roles:["SUPER_ADMIN"],tenantRequired:false,storeRequired:false},
 {prefix:"/api/admin",scope:"TENANT",roles:["ADMIN","MANAGER","INVENTORY","MARKETING","SUPPORT","WAREHOUSE_MANAGER","DELIVERY_MANAGER","FINANCE_MANAGER"],tenantRequired:true,storeRequired:false},
 {prefix:"/api/client",scope:"PUBLIC",roles:[],tenantRequired:true,storeRequired:true},
 {prefix:"/api/auth",scope:"PUBLIC",roles:[],tenantRequired:false,storeRequired:false},
 {prefix:"/api/tenant",scope:"PUBLIC",roles:[],tenantRequired:false,storeRequired:false},
 {prefix:"/api/ai",scope:"TENANT",roles:["SUPER_ADMIN","ADMIN","MANAGER","INVENTORY","MARKETING","SUPPORT","WAREHOUSE_MANAGER","DELIVERY_MANAGER","FINANCE_MANAGER"],tenantRequired:false,storeRequired:false},
 {prefix:"/api/system",scope:"PLATFORM",roles:["SUPER_ADMIN"],tenantRequired:false,storeRequired:false}
];
