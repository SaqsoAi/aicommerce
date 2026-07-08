import { Router } from "express";
import { buildProjectIndexSummary, createSafeExecutionSandboxPlan, generateCopilotPreview } from "../ai/developmentCopilot";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    module: "enterprise-super-admin-ai-development-copilot",
    previewOnly: true,
    autoApply: false,
    autoMigration: false,
    autoDeploy: false,
  });
});

router.get("/project-index", (_req, res) => {
  res.json({ success: true, data: buildProjectIndexSummary(process.cwd()) });
});

router.get("/sandbox", (_req, res) => {
  res.json({ success: true, data: createSafeExecutionSandboxPlan() });
});

router.post("/preview", async (req, res, next) => {
  try {
    const body = req.body || {};
    const result = await generateCopilotPreview({
      mode: body.mode || "review",
      role: body.role || "AI_CODE_REVIEWER",
      prompt: body.prompt || "",
      module: body.module,
      tenantId: body.tenantId,
      userId: body.userId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
