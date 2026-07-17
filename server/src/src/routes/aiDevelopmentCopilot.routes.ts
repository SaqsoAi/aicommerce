import { developerConversation, providerStatus } from "../ai/developmentCopilot/completion/live-provider.service";
import { composePlugin } from "../ai/developmentCopilot/completion/plugin-composer.service";
import { generateTestPlan } from "../ai/developmentCopilot/completion/test-generator.service";
import { createDiff } from "../ai/developmentCopilot/completion/patch-diff.service";
import { voiceSession, memoryPolicy } from "../ai/developmentCopilot/completion/voice-memory.service";
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
import { compileVisualLogic } from "../ai/developmentCopilot/completion/visual-logic.service";
import { buildIntelligentForm } from "../ai/developmentCopilot/completion/form-intelligence.service";
import { analyzeTheme } from "../ai/developmentCopilot/completion/theme-intelligence.service";
import { responsiveAudit } from "../ai/developmentCopilot/completion/responsive-intelligence.service";
import { modernTemplateBlueprint } from "../ai/developmentCopilot/completion/modern-template-builder.service";
import { interactivePreview } from "../ai/developmentCopilot/completion/interactive-diff-preview.service";
import { dryRunExecution } from "../ai/developmentCopilot/completion/dry-run-execution.service";
import { autoCodeCertification } from "../ai/developmentCopilot/completion/auto-code-certification.service";
import { specialistReview, specialistCouncil } from "../ai/developmentCopilot/completion/specialist-ai.service";

const router = Router();
router.use(protect);
router.use(...(requirePlatformAdmin as any));
const root = path.resolve(process.env.PROJECT_ROOT ?? path.join(process.cwd(), ".."));

router.get("/health", (_req, res) => res.json({ success: true, module: "saqso-ai-builder", version: "3.0.0", completionLevel: 10, voice: true, multilingual: true, liveMutation: false, approvalRequired: true }));
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

router.post("/voice-session",(req,res)=>res.json({success:true,data:voiceSession(req.body??{})}));
router.get("/memory-policy",(_q,res)=>res.json({success:true,data:memoryPolicy()}));

router.post("/patch-diff",(req,res,next)=>{try{res.json({success:true,data:createDiff(path.resolve(root,String(req.body?.file??"")),String(req.body?.next??""))});}catch(e){next(e);}});

router.post("/test-plan",(req,res)=>res.json({success:true,data:generateTestPlan(req.body??{})}));

router.post("/compose-plugin",(req,res)=>res.json({success:true,data:composePlugin(req.body??{})}));

router.get("/providers", (_req,res)=>res.json({success:true,data:providerStatus()}));
router.post("/live-chat", async(req:AuthRequest,res,next)=>{try{
 const prompt=sanitizeCopilotText(String(req.body?.prompt??"")).trim();
 if(!prompt)return res.status(400).json({success:false,error:{code:"PROMPT_REQUIRED",message:"Prompt is required"}});
 const data=await developerConversation({prompt,userId:String(req.user?.id??req.user?.userId??""),workspaceId:req.body?.workspaceId,context:req.body?.context});
 const model=(prisma as any).aiBuilderMessage;
 if(model?.create && req.body?.workspaceId) await model.create({data:{workspaceId:String(req.body.workspaceId),userId:String(req.user?.id??req.user?.userId),role:"ASSISTANT",content:data.answer,metadata:{provider:data.provider,model:data.model,auditId:data.auditId}}});
 return res.json({success:true,data});
}catch(error){next(error);}});
router.post("/visual-logic/compile", (req,res) =>
  res.json({success:true,data:compileVisualLogic(req.body ?? {})})
);
router.post("/forms/generate", (req,res) =>
  res.json({success:true,data:buildIntelligentForm(req.body ?? {})})
);

router.post("/theme/analyze", (req,res) =>
  res.json({success:true,data:analyzeTheme(req.body ?? {})})
);
router.post("/responsive/audit", (req,res) =>
  res.json({success:true,data:responsiveAudit(req.body ?? {})})
);

router.post("/templates/modern-blueprint", (req,res) =>
  res.json({success:true,data:modernTemplateBlueprint(req.body ?? {})})
);

router.post("/diff/interactive-preview", (req,res,next) => {
  try {
    res.json({success:true,data:interactivePreview(root,req.body ?? {})});
  } catch(error) {
    next(error);
  }
});
router.post("/execution/dry-run", (req,res) =>
  res.json({success:true,data:dryRunExecution(req.body ?? {})})
);

router.post("/certification/auto-code", (req,res) =>
  res.json({success:true,data:autoCodeCertification(req.body ?? {})})
);
router.post("/specialists/review", (req,res) =>
  res.json({success:true,data:specialistReview(req.body ?? {})})
);
router.post("/specialists/council", (req,res) =>
  res.json({success:true,data:specialistCouncil(req.body ?? {})})
);

export default router;
