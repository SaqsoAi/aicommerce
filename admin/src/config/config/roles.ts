export const USER_ROLES = [
  "SUPER_ADMIN", "ADMIN", "MANAGER", "INVENTORY", "MARKETING", "SUPPORT",
  "WAREHOUSE_MANAGER", "DELIVERY_MANAGER", "FINANCE_MANAGER", "CUSTOMER",
] as const;
export type UserRole = (typeof USER_ROLES)[number];
export type AdminAppRole = Exclude<UserRole, "CUSTOMER">;
export const ROLE_LABELS: Record<UserRole,string> = {
  SUPER_ADMIN:"Platform Admin", ADMIN:"Store Admin", MANAGER:"Store Manager",
  INVENTORY:"Inventory Officer", MARKETING:"Marketing Officer", SUPPORT:"Support Officer",
  WAREHOUSE_MANAGER:"Warehouse Manager", DELIVERY_MANAGER:"Delivery Manager",
  FINANCE_MANAGER:"Finance Manager", CUSTOMER:"Customer",
};
const aliases: Record<string,UserRole> = {SUPERADMIN:"SUPER_ADMIN",PLATFORM_ADMIN:"SUPER_ADMIN",TENANT_OWNER:"ADMIN",TENANT_ADMIN:"ADMIN",STORE_ADMIN:"ADMIN",USER_ADMIN:"MANAGER",STAFF:"MANAGER",FINANCE:"FINANCE_MANAGER",DELIVERY:"DELIVERY_MANAGER",WAREHOUSE:"WAREHOUSE_MANAGER"};
export function normalizeUserRole(value: unknown, fallback: UserRole="MANAGER"): UserRole {
 const key=String(value??"").trim().toUpperCase().replace(/[-\s]+/g,"_");
 const normalized=aliases[key]??key; return (USER_ROLES as readonly string[]).includes(normalized)?normalized as UserRole:fallback;
}
export const isPlatformAdmin=(r:unknown)=>normalizeUserRole(r)==="SUPER_ADMIN";
export const isTenantStaff=(r:unknown)=>!["SUPER_ADMIN","CUSTOMER"].includes(normalizeUserRole(r));
export function roleLabel(r:unknown){return ROLE_LABELS[normalizeUserRole(r)];}
export const ROLE_LANDING_ROUTES: Record<UserRole,string>={SUPER_ADMIN:"/dashboard",ADMIN:"/dashboard",MANAGER:"/dashboard",INVENTORY:"/inventory",MARKETING:"/campaigns",SUPPORT:"/customers",WAREHOUSE_MANAGER:"/inventory",DELIVERY_MANAGER:"/orders",FINANCE_MANAGER:"/analytics",CUSTOMER:"/account"};
