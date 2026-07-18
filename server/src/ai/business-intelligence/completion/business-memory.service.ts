import crypto from "crypto";
import prisma from "../../../config/prisma";

type Context = {
  tenantId?: string;
  storeId?: string;
  userId: string;
};

const fallback = new Map<string, unknown[]>();

function key(context: Context) {
  return `${context.tenantId ?? "platform"}:${context.storeId ?? "all"}:${context.userId}`;
}

export async function rememberBusinessDecision(
  context: Context,
  input: {
    category?: string;
    content?: string;
    outcome?: unknown;
    feedbackScore?: number;
  },
) {
  const data = {
    id: crypto.randomUUID(),
    tenantId: context.tenantId ?? "platform",
    storeId: context.storeId ?? null,
    userId: context.userId,
    category: String(input.category ?? "DECISION"),
    content: String(input.content ?? ""),
    outcome: input.outcome ?? {},
    feedbackScore: input.feedbackScore ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const model = (prisma as any).businessAiMemory;
  if (model?.create) return model.create({data});

  fallback.set(key(context), [...(fallback.get(key(context)) ?? []), data]);
  return data;
}

export async function listBusinessMemory(context: Context) {
  const model = (prisma as any).businessAiMemory;
  if (model?.findMany) {
    return model.findMany({
      where: {
        tenantId: context.tenantId ?? "platform",
        ...(context.storeId ? {storeId: context.storeId} : {}),
        userId: context.userId,
      },
      orderBy: {updatedAt: "desc"},
      take: 200,
    });
  }
  return fallback.get(key(context)) ?? [];
}
