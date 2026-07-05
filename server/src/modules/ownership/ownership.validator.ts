import { OwnershipContext, OwnershipDecision, OwnershipError } from "./ownership.types";
import { resolveOwnership } from "./ownership.resolver";

export function validateOwnership(ctx: OwnershipContext): OwnershipDecision {
  const decision = resolveOwnership(ctx);
  if (!decision.allowed) {
    throw new OwnershipError(decision.reason);
  }
  return decision;
}

export function assertOwnership(ctx: OwnershipContext): OwnershipDecision {
  return validateOwnership(ctx);
}

export function isOwnershipAllowed(ctx: OwnershipContext): boolean {
  return resolveOwnership(ctx).allowed;
}