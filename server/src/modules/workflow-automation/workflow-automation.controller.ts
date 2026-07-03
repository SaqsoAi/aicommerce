import { Request, Response } from "express";
import { workflowAutomationService } from "./workflow-automation.service";
import {
  aiWorkflowGenerateSchema,
  workflowCreateSchema,
  workflowExecutionSchema,
  workflowGraphSchema,
} from "./workflow-automation.validation";

const ok = (res: Response, data: any) => res.json({ success: true, data });

const fail = (res: Response, error: any) =>
  res.status(400).json({
    success: false,
    message: error?.message || "Workflow automation error",
  });

const paramId = (req: Request): string => {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : String(raw);
};

export const workflowAutomationController = {
  async list(req: Request, res: Response) {
    try {
      ok(res, await workflowAutomationService.list());
    } catch (e) {
      fail(res, e);
    }
  },

  async get(req: Request, res: Response) {
    try {
      ok(res, await workflowAutomationService.get(paramId(req)));
    } catch (e) {
      fail(res, e);
    }
  },

  async create(req: Request, res: Response) {
    try {
      const data = workflowCreateSchema.parse(req.body);
      ok(res, await workflowAutomationService.create(data, (req as any).user?.id));
    } catch (e) {
      fail(res, e);
    }
  },

  async saveGraph(req: Request, res: Response) {
    try {
      const data = workflowGraphSchema.parse(req.body);
      ok(res, await workflowAutomationService.saveGraph(paramId(req), data.nodes, data.connections));
    } catch (e) {
      fail(res, e);
    }
  },

  async publish(req: Request, res: Response) {
    try {
      ok(res, await workflowAutomationService.publish(paramId(req), (req as any).user?.id));
    } catch (e) {
      fail(res, e);
    }
  },

  async execute(req: Request, res: Response) {
    try {
      const data = workflowExecutionSchema.parse(req.body || {});
      ok(res, await workflowAutomationService.execute(paramId(req), data.inputJson, data.triggerType));
    } catch (e) {
      fail(res, e);
    }
  },

  async analytics(req: Request, res: Response) {
    try {
      ok(res, await workflowAutomationService.analytics());
    } catch (e) {
      fail(res, e);
    }
  },

  async aiGenerate(req: Request, res: Response) {
    try {
      const data = aiWorkflowGenerateSchema.parse(req.body);
      ok(res, await workflowAutomationService.generateAiWorkflow(data.prompt));
    } catch (e) {
      fail(res, e);
    }
  },
};
