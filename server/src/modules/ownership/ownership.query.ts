import { OwnershipActor, OwnershipResource } from "./ownership.types";
import { hasSuperAdminOverride, resolveOwnershipRule } from "./ownership.resolver";

function normalizeActorValue(actor: OwnershipActor, field: keyof OwnershipActor): string | null {
  const value = actor[field] ?? (field === "id" ? actor.userId : null);
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export function buildOwnershipWhere(
  actor: OwnershipActor,
  resource: OwnershipResource,
  baseWhere: Record<string, unknown> = {},
  allowSuperAdminOverride = true
): Record<string, unknown> {
  if (allowSuperAdminOverride && hasSuperAdminOverride(actor)) {
    return { ...baseWhere };
  }

  const rule = resolveOwnershipRule(resource);
  const actorValue = normalizeActorValue(actor, rule.actorField);

  if (!actorValue) {
    return {
      ...baseWhere,
      __ownership_denied__: "__missing_actor_scope__",
    };
  }

  return {
    ...baseWhere,
    [rule.ownerField]: actorValue,
  };
}

export function mergeOwnershipWhere(
  baseWhere: Record<string, unknown> | undefined,
  ownershipWhere: Record<string, unknown>
): Record<string, unknown> {
  return {
    ...(baseWhere ?? {}),
    ...ownershipWhere,
  };
}

export function buildOwnershipCreateData(
  actor: OwnershipActor,
  resource: OwnershipResource,
  data: Record<string, unknown> = {}
): Record<string, unknown> {
  const rule = resolveOwnershipRule(resource);
  const actorValue = normalizeActorValue(actor, rule.actorField);

  if (!actorValue || hasSuperAdminOverride(actor)) {
    return { ...data };
  }

  return {
    ...data,
    [rule.ownerField]: data[rule.ownerField] ?? actorValue,
  };
}