import { Request, Response } from "express";
import { heroEnterprisePersistenceService } from "./hero-enterprise-persistence.service";

const paramToString = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
};

export const heroEnterprisePersistenceController = {
  async saveDraft(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId || req.body.heroId);
    const data = await heroEnterprisePersistenceService.saveDraft({
      ...req.body,
      heroId,
    });
    res.json({ success: true, data });
  },

  async listDrafts(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const data = await heroEnterprisePersistenceService.listDrafts(heroId);
    res.json({ success: true, data });
  },

  async createVersion(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const data = await heroEnterprisePersistenceService.createVersion(
      heroId,
      req.body.snapshotJson || req.body,
      req.body.note
    );
    res.json({ success: true, data });
  },

  async listVersions(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const data = await heroEnterprisePersistenceService.listVersions(heroId);
    res.json({ success: true, data });
  },

  async restoreVersion(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const versionId = paramToString(req.params.versionId);
    const data = await heroEnterprisePersistenceService.restoreVersion(heroId, versionId);
    res.json({ success: true, data });
  },

  async trackAnalytics(req: Request, res: Response) {
    const data = await heroEnterprisePersistenceService.trackAnalytics(req.body);
    res.json({ success: true, data });
  },

  async listVariants(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const data = await heroEnterprisePersistenceService.listVariants(heroId);
    res.json({ success: true, data });
  },

  async upsertVariant(req: Request, res: Response) {
    const heroId = paramToString(req.params.heroId);
    const data = await heroEnterprisePersistenceService.upsertVariant(heroId, req.body);
    res.json({ success: true, data });
  },
};