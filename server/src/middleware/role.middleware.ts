import { requireRole } from "./authorize.middleware";

export const allowRoles = (...roles: string[]) => requireRole(...roles);
