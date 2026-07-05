import { Request } from "express";
import { OwnershipResource } from "./ownership.types";
import { getOwnershipActor, readOwnershipTarget } from "./ownership.helper";
import { validateOwnership } from "./ownership.validator";
import { buildOwnershipWhere } from "./ownership.query";

export function ownershipGuard(req: Request, resource: OwnershipResource, action = "read") {
  const actor = getOwnershipActor(req);
  const target = readOwnershipTarget(req);
  return validateOwnership({
    actor,
    resource,
    action,
    ...target,
  });
}

export function ownershipWhereFromRequest(
  req: Request,
  resource: OwnershipResource,
  baseWhere: Record<string, unknown> = {}
): Record<string, unknown> {
  const actor = getOwnershipActor(req);
  return buildOwnershipWhere(actor, resource, baseWhere);
}