import { OwnershipActor, OwnershipContext, OwnershipDecision, OwnershipResource } from "./ownership.types";
import { resolveOwnership } from "./ownership.resolver";
import { validateOwnership } from "./ownership.validator";
import { buildOwnershipCreateData, buildOwnershipWhere } from "./ownership.query";

export class OwnershipService {
  resolve(ctx: OwnershipContext): OwnershipDecision {
    return resolveOwnership(ctx);
  }

  assert(ctx: OwnershipContext): OwnershipDecision {
    return validateOwnership(ctx);
  }

  where(actor: OwnershipActor, resource: OwnershipResource, baseWhere: Record<string, unknown> = {}) {
    return buildOwnershipWhere(actor, resource, baseWhere);
  }

  createData(actor: OwnershipActor, resource: OwnershipResource, data: Record<string, unknown> = {}) {
    return buildOwnershipCreateData(actor, resource, data);
  }
}

export const ownershipService = new OwnershipService();