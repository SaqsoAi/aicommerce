import { Router } from "express";
import path from "path";
import prisma from "../config/prisma";
import { protect, type AuthRequest } from "../modules/auth/auth.middleware";
import { requirePlatformAdmin } from "../middleware/authorize.middleware";
import { buildProjectIndexSummary, createSafeExecutionSandboxPlan, generateCopilotPreview, sanitizeCopilotText } from "../ai/developmentCopilot";
import { answerBuilder } from "../ai/builder/orchestrator";
import { inspectRepository as inspectLegacyRepository } from "../ai/builder/repository";
import { buildKnowledgeGraph } from "../ai/builder/knowledgeGraph";
import { createWorkspace, listWorkspaces } from "../ai/developmentCopilot/completion/workspace.service";
import { inspectRepository } from "../ai/developmentCopilot/completion/repository-intelligence.service";
import { reviewSource, debugLog } from "../ai/developmentCopilot/completion/review-debug.service";
import { auditUiFile, templateBlueprint } from "../ai/developmentCopilot/completion/visual-intelligence.service";
import { createArtifact, createPluginBlueprint } from "../ai/developmentCopilot/completion/artifact-delivery.service";
import { deploymentPlan, runBuild } from "../ai/developmentCopilot/completion/certification.service";

const router = Router();
router.use(protect);
router.use(...(requirePlatformAdmin as any));
const root = path.resolve(process.env.PROJECT_ROOT ?? path.join(process.cwd(), ".."));

router.get("/health", (_req, res) => res.json({ success: true, module: "saqso-ai-builder", version: "2.6.1", completionLevel: 6, voice: true, multilingual: true, liveMutation: false, approvalRequired: true }));
router.get("/completion-health", (_req, res) => res.json({ success: true, data: { module: "saqso-ai-builder", completionLevel: 6, liveMutation: false, approvalRequired: true } }));
router.get("/project-index", (_req, res) => res.json({ success: true, data: buildProjectIndexSummary(process.cwd()) }));
router.get("/repository", (_req, res) => res.json({ success: true, data: inspectLegacyRepository(process.cwd()) }));
router.get("/knowledge-graph", (_req, res) => { const repo = inspectLegacyRepository(process.cwd()); res.json({ success: true, data: buildKnowledgeGraph(repo) }); });
router.get("/sandbox", (_req, res) => res.json({ success: true, data: createSafeExecutionSandboxPlan() }));
router.post("/chat", async (req: AuthRequest, res, next) => { try { const prompt = sanitizeCopilotText(String(req.body?.prompt ?? "")).trim(); if (!prompt) return res.status(400).json({ success: false, error: { code: "PROMPT_REQUIRED", message: "Prompt is required" } }); const data = answerBuilder(prompt); const actorId = req.user?.id || req.user?.userId; await prisma.$transaction([prisma.aILog.create({ data: { feature: "SAQSO AI Builder", prompt, response: data.summary } }), prisma.auditLog.create({ data: { userId: actorId, action: "AI_BUILDER_CHAT", module: "AI_BUILDER", description: `${data.intent} plan generated without auto-apply` } })]); return res.json({ success: true, data }); } catch (error) { next(error); } });
router.post("/preview", async (req: AuthRequest, res, next) => { try { const body = req.body || {}; const prompt = sanitizeCopilotText(String(body.prompt || "")).trim(); const result = await generateCopilotPreview({ mode: body.mode || "review", role: body.role || "AI_CODE_REVIEWER", prompt, module: body.module, tenantId: body.tenantId, userId: body.userId }); return res.json({ success: true, data: result }); } catch (error) { next(error); } });
router.get("/workspaces", async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await listWorkspaces({ userId: String(req.user?.id ?? req.user?.userId) }) }); } catch (error) { next(error); } });
router.post("/workspaces", async (req: AuthRequest, res, next) => { try { res.json({ success: true, data: await createWorkspace({ userId: String(req.user?.id ?? req.user?.userId) }, req.body ?? {}) }); } catch (error) { next(error); } });
router.get("/repository-intelligence", (_req, res, next) => { try { res.json({ success: true, data: inspectRepository(root) }); } catch (error) { next(error); } });

router.post("/review", (req, res, next) => { try { res.json({ success: true, data: reviewSource(path.resolve(root, String(req.body?.file ?? ""))) }); } catch (error) { next(error); } });
router.post("/debug", (req, res) => res.json({ success: true, data: debugLog(String(req.body?.log ?? "")) }));

router.post("/visual-audit", (req, res, next) => { try { res.json({ success: true, data: auditUiFile(path.resolve(root, String(req.body?.file ?? ""))) }); } catch (error) { next(error); } });
router.post("/template-blueprint", (req, res) => res.json({ success: true, data: templateBlueprint(req.body ?? {}) }));

router.post("/artifacts", (req, res) => res.json({ success: true, data: createArtifact(root, req.body ?? {}) }));
router.post("/plugin-blueprint", (req, res) => res.json({ success: true, data: createPluginBlueprint(root, req.body ?? {}) }));

router.get("/deployment-plan", (_req, res) => res.json({ success: true, data: deploymentPlan() }));
router.post("/build", (req, res) => res.json({ success: true, data: runBuild(root, req.body?.app) }));

export default router;
