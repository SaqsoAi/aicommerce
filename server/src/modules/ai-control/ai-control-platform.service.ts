import { randomUUID } from "crypto";
import prisma from "../../config/prisma";

function text(value: unknown, field: string): string {
  const result = String(value ?? "").trim();
  if (!result) throw new Error(`${field} is required`);
  return result;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getAiPlatformRegistry() {
  const [prompts, models, policies, settings] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(`SELECT id, registry_key AS "key", version, category, title, template, variables, approved, created_by AS "createdBy", created_at AS "createdAt", updated_at AS "updatedAt" FROM ai_prompt_registry ORDER BY registry_key, version DESC`),
    prisma.$queryRawUnsafe<any[]>(`SELECT id, registry_key AS "key", provider_key AS "providerKey", model_id AS "modelId", model_type AS "modelType", display_name AS "displayName", enabled, priority, config, updated_at AS "updatedAt" FROM ai_model_registry ORDER BY priority, registry_key`),
    prisma.$queryRawUnsafe<any[]>(`SELECT id, policy_key AS "key", title, description, enabled, policy, updated_by AS "updatedBy", updated_at AS "updatedAt" FROM ai_policy_registry ORDER BY policy_key`),
    prisma.$queryRawUnsafe<any[]>(`SELECT id, setting_key AS "key", label, description, value, updated_by AS "updatedBy", updated_at AS "updatedAt" FROM ai_enterprise_settings ORDER BY setting_key`),
  ]);
  return { prompts, models, policies, settings, governance: { scope: "PLATFORM", role: "SUPER_ADMIN", secretsReturned: false, schemaVersion: "AI-G1-1.0" } };
}

export async function saveAiPrompt(payload: any, actorId?: string) {
  const key = text(payload.key, "key").toLowerCase();
  const version = Math.max(1, Number(payload.version || 1));
  return prisma.$queryRawUnsafe<any[]>(`INSERT INTO ai_prompt_registry (id, registry_key, version, category, title, template, variables, approved, created_by, created_at, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,NOW(),NOW())
    ON CONFLICT (registry_key, version) DO UPDATE SET category=EXCLUDED.category,title=EXCLUDED.title,template=EXCLUDED.template,variables=EXCLUDED.variables,approved=EXCLUDED.approved,updated_at=NOW()
    RETURNING id,registry_key AS "key",version,category,title,template,variables,approved,updated_at AS "updatedAt"`, randomUUID(), key, version, text(payload.category || "core", "category"), text(payload.title, "title"), text(payload.template, "template"), JSON.stringify(Array.isArray(payload.variables) ? payload.variables.map(String) : []), Boolean(payload.approved), actorId || null);
}

export async function saveAiModel(payload: any) {
  const key = text(payload.key, "key").toLowerCase();
  return prisma.$queryRawUnsafe<any[]>(`INSERT INTO ai_model_registry (id,registry_key,provider_key,model_id,model_type,display_name,enabled,priority,config,created_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,NOW(),NOW())
    ON CONFLICT (registry_key) DO UPDATE SET provider_key=EXCLUDED.provider_key,model_id=EXCLUDED.model_id,model_type=EXCLUDED.model_type,display_name=EXCLUDED.display_name,enabled=EXCLUDED.enabled,priority=EXCLUDED.priority,config=EXCLUDED.config,updated_at=NOW()
    RETURNING id,registry_key AS "key",provider_key AS "providerKey",model_id AS "modelId",model_type AS "modelType",display_name AS "displayName",enabled,priority,config`, randomUUID(), key, text(payload.providerKey, "providerKey"), text(payload.modelId, "modelId"), text(payload.modelType || "chat", "modelType"), text(payload.displayName || payload.modelId, "displayName"), Boolean(payload.enabled), Number(payload.priority || 100), JSON.stringify(object(payload.config)));
}

export async function saveAiPolicy(keyValue: string, payload: any, actorId?: string) {
  const key = text(keyValue, "key").toLowerCase();
  return prisma.$queryRawUnsafe<any[]>(`INSERT INTO ai_policy_registry (id,policy_key,title,description,enabled,policy,updated_by,created_at,updated_at)
    VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,NOW(),NOW()) ON CONFLICT (policy_key) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,enabled=EXCLUDED.enabled,policy=EXCLUDED.policy,updated_by=EXCLUDED.updated_by,updated_at=NOW()
    RETURNING id,policy_key AS "key",title,description,enabled,policy,updated_at AS "updatedAt"`, randomUUID(), key, text(payload.title || key, "title"), String(payload.description || ""), Boolean(payload.enabled), JSON.stringify(object(payload.policy)), actorId || null);
}

export async function saveAiEnterpriseSetting(keyValue: string, payload: any, actorId?: string) {
  const key = text(keyValue, "key").toLowerCase();
  return prisma.$queryRawUnsafe<any[]>(`INSERT INTO ai_enterprise_settings (id,setting_key,label,description,value,updated_by,created_at,updated_at)
    VALUES ($1,$2,$3,$4,$5::jsonb,$6,NOW(),NOW()) ON CONFLICT (setting_key) DO UPDATE SET label=EXCLUDED.label,description=EXCLUDED.description,value=EXCLUDED.value,updated_by=EXCLUDED.updated_by,updated_at=NOW()
    RETURNING id,setting_key AS "key",label,description,value,updated_at AS "updatedAt"`, randomUUID(), key, text(payload.label || key, "label"), String(payload.description || ""), JSON.stringify(object(payload.value)), actorId || null);
}
