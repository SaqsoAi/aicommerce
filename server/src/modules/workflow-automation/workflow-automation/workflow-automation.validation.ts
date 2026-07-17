import { z } from "zod";

export const workflowCreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  triggerType: z.string().default("MANUAL"),
  category: z.string().optional(),
});

export const workflowGraphSchema = z.object({
  nodes: z.array(
    z.object({
      nodeKey: z.string().min(1),
      type: z.string().min(1),
      label: z.string().min(1),
      configJson: z.unknown().optional(),
      positionX: z.coerce.number().int().default(0),
      positionY: z.coerce.number().int().default(0),
    })
  ).default([]),
  connections: z.array(
    z.object({
      sourceKey: z.string().min(1),
      targetKey: z.string().min(1),
      conditionJson: z.unknown().optional(),
    })
  ).default([]),
});

export const workflowExecutionSchema = z.object({
  inputJson: z.unknown().optional(),
  triggerType: z.string().default("MANUAL"),
});

export const aiWorkflowGenerateSchema = z.object({
  prompt: z.string().min(3),
});
