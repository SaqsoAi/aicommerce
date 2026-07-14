import { Router } from "express";
import { buildProjectIndexSummary, createSafeExecutionSandboxPlan, generateCopilotPreview, sanitizeCopilotText } from "../ai/developmentCopilot";
import prisma from "../config/prisma";
import { protect, type AuthRequest } from "../modules/auth/auth.middleware";

const router = Router();
router.use(protect);

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

router.post("/preview", async (req: AuthRequest, res, next) => {
  try {
    const body = req.body || {};
    const prompt = sanitizeCopilotText(String(body.prompt || "")).trim();
    const result = await generateCopilotPreview({
      mode: body.mode || "review",
      role: body.role || "AI_CODE_REVIEWER",
      prompt,
      module: body.module,
      tenantId: body.tenantId,
      userId: body.userId,
    });
    const actorId = req.user?.id || req.user?.userId;
    await prisma.$transaction([
      prisma.aILog.create({
        data: {
          feature: `Development Copilot · ${result.mode}`,
          prompt: prompt || "Project analysis preview",
          response: [result.summary, ...result.recommendations].join("\n"),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: actorId,
          action: "COPILOT_PREVIEW_GENERATED",
          module: "AI_DEVELOPMENT_COPILOT",
          description: `${result.mode} preview completed without applying code`,
        },
      }),
    ]);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
