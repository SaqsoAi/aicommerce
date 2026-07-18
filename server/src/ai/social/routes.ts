import { Router } from "express";
import {
  analyzeSocialPerformance,
  approveSocialLead,
  createHumanHandoff,
  generateSocialDraft,
  prepareSocialSchedule,
} from "./service";

const router = Router();

function asyncHandler(fn: any) {
  return (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
}

router.get("/health", (_req, res) => {
  res.json({
    ok: true,
    module: "enterprise-ai-social-media-manager",
    autoReply: false,
    autoSend: false,
    autoPublish: false,
    providerCalls: "AI_GATEWAY_ONLY",
  });
});

router.post("/draft-reply", asyncHandler(async (req: any, res: any) => {
  const result = await generateSocialDraft(req.body || {});
  res.json({ success: true, data: result });
}));

router.post("/comments/suggest", asyncHandler(async (req: any, res: any) => {
  const result = await generateSocialDraft({ ...(req.body || {}), source: "COMMENT" });
  res.json({ success: true, data: result });
}));

router.post("/dm/suggest", asyncHandler(async (req: any, res: any) => {
  const result = await generateSocialDraft({ ...(req.body || {}), source: "DM" });
  res.json({ success: true, data: result });
}));

router.post("/leads/approve", asyncHandler(async (req: any, res: any) => {
  const result = await approveSocialLead(req.body || {});
  res.json({ success: true, data: result });
}));

router.post("/handoff", asyncHandler(async (req: any, res: any) => {
  const result = await createHumanHandoff(req.body || {});
  res.json({ success: true, data: result });
}));

router.post("/analytics/analyze", asyncHandler(async (req: any, res: any) => {
  const result = await analyzeSocialPerformance(req.body || {});
  res.json({ success: true, data: result });
}));

router.post("/scheduler/prepare", asyncHandler(async (req: any, res: any) => {
  const result = await prepareSocialSchedule(req.body || {});
  res.json({ success: true, data: result });
}));

export default router;