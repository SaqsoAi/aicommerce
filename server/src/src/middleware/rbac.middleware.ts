import { requireRole } from "./authorize.middleware";

export const rbac = (...roles: string[]) => requireRole(...roles);
