export const controlPlanes={
 platform:{role:"SUPER_ADMIN",label:"Platform Admin",scope:"GLOBAL",dailyTenantMutation:false},
 tenant:{roles:["ADMIN","MANAGER","INVENTORY","MARKETING","SUPPORT","WAREHOUSE_MANAGER","DELIVERY_MANAGER","FINANCE_MANAGER"],scope:"ASSIGNED_TENANT_STORE"},
 customer:{roles:["CUSTOMER"],scope:"SELF"}
} as const;
