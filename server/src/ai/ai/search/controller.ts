import type { Request, Response } from "express";
import { aiSearchService } from "./service";
import type { AiSearchContext, SearchProduct } from "./types";

function contextFromBody(req: Request): AiSearchContext {
  const body = (req.body || {}) as Record<string, unknown>;
  const user = (req as Request & { user?: { id?: string; tenantId?: string } }).user;
  return {
    userId: user?.id || (typeof body.userId === "string" ? body.userId : undefined),
    tenantId: user?.tenantId || (typeof body.tenantId === "string" ? body.tenantId : undefined),
    products: Array.isArray(body.products) ? (body.products as SearchProduct[]) : [],
    product: typeof body.product === "object" && body.product !== null ? (body.product as SearchProduct) : null,
    featureFlags: typeof body.featureFlags === "object" && body.featureFlags !== null ? (body.featureFlags as Record<string, boolean>) : undefined,
    membership: body.membership,
    personalization: typeof body.personalization === "object" && body.personalization !== null ? (body.personalization as Record<string, unknown>) : undefined,
  };
}

function sendError(res: Response, error: unknown): void {
  res.status(500).json({ success: false, message: error instanceof Error ? error.message : "AI Search request failed" });
}

export const aiSearchController = {
  async semantic(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiSearchService.semanticSearch(req.body, contextFromBody(req));
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  },

  async similar(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiSearchService.similarProductSearch(req.body, contextFromBody(req));
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  },

  async imageFoundation(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiSearchService.imageSearchFoundation(req.body, contextFromBody(req));
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  },

  async ocrFoundation(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiSearchService.ocrSearchFoundation(req.body, contextFromBody(req));
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  },

  async voiceFoundation(req: Request, res: Response): Promise<void> {
    try {
      const result = await aiSearchService.voiceSearchFoundation(req.body, contextFromBody(req));
      res.json({ success: true, data: result });
    } catch (error) {
      sendError(res, error);
    }
  },
};
