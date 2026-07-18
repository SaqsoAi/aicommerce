import { certifyAction } from "./completion/action-certification.service";
import { boardReport } from "./completion/board-report.service";
import { executiveAdvisors } from "./completion/executive-advisors.service";
import { forecast, scenario } from "./completion/forecast-scenario.service";
import { businessVoice } from "./completion/voice-advisor.service";
import { Router } from "express";
import path from "path";
import { protect, type AuthRequest } from "../../modules/auth/auth.middleware";
import { requireTenantContext } from "../../middleware/authorize.middleware";
import { aiBusinessIntelligenceService } from "./businessIntelligence.service";
import { businessAiControlService } from "./control.service";
import { createBusinessConversation, listBusinessMessages } from "./completion/conversation.service";
import { salesForecast, financeInsight, inventoryInsight, customerSegments } from "./completion/intelligence-modules.service";
import { executiveReport } from "./completion/report.service";
import { proposeAction, approveAction, executeAction } from "./completion/action.service";
import { orchestrateBusinessAgents } from "./completion/multi-agent-orchestration.service";
import { deepBusinessReasoning } from "./completion/deep-business-reasoning.service";
import { enterpriseScenarioSimulation } from "./completion/enterprise-scenario.service";
import { enterpriseGoalPlan } from "./completion/enterprise-goal-planner.service";
import { rememberBusinessDecision, listBusinessMemory } from "./completion/business-memory.service";
import { enterpriseVoiceSession } from "./completion/enterprise-voice.service";
import { automateManagementReport } from "./completion/management-report-automation.service";
import { executiveDecisionDraft } from "./completion/executive-decision-center.service";
import { predictiveIntelligence } from "./completion/predictive-intelligence.service";
import { certifyBusinessAi } from "./completion/business-ai-enterprise-certification.service";

type BusinessAuthUser = {
  id?: string;
  userId?: string;
  role?: string;
  tenantId?: string;
  storeId?: string;
};

const router = Router();
router.use(protect);
router.use(...(requireTenantContext as any));
const root = path.resolve(process.env.PROJECT_ROOT ?? path.join(process.cwd(), ".."));

function context(req: AuthRequest) {
  const user = (req.user ?? {}) as BusinessAuthUser;
  return {
    userId: String(user.id ?? user.userId ?? "anonymous"),
    role: String(user.role ?? "ADMIN"),
    tenantId: user.tenantId ? String(user.tenantId) : undefined,
    storeId: user.storeId ? String(user.storeId) : undefined,
  };
}

router.get("/health", (_req, res) => res.json({ success: true, module: "saqso-business-ai-advisor", version: "3.0.0", completionLevel: 10, tenantIsolation: true, multilingual: true, liveMutation: false }));
router.get("/completion-health", (_req, res) => res.json({ success: true, data: { module: "business-ai-advisor", version: "4.1.0", completionLevel: 10, realInterface: true, tenantIsolation: true, liveMutation: false } }));
router.get("/snapshot", async (req, res, next) => { try { res.json({ success: true, data: await aiBusinessIntelligenceService.snapshot(context(req), Number(req.query.days ?? 30)) }); } catch (error) { next(error); } });
router.post("/chat", async (req, res, next) => { try { res.json({ success: true, data: await aiBusinessIntelligenceService.chat(context(req), req.body ?? {}) }); } catch (error) { next(error); } });
router.get("/ceo-report", async (req, res, next) => { try { res.json({ success: true, data: await aiBusinessIntelligenceService.ceoReport(context(req), Number(req.query.days ?? 30)) }); } catch (error) { next(error); } });
router.post("/sales-goal-plan", async (req, res, next) => { try { res.json({ success: true, data: await aiBusinessIntelligenceService.chat(context(req), { ...req.body, message: req.body?.message ?? "Create a sales target and budget plan" }) }); } catch (error) { next(error); } });
router.post("/task-draft", (req, res) => {
  const action = req.body?.action;
  if (!action) return res.status(400).json({ success: false, error: { code: "ACTION_REQUIRED", message: "Business action is required" } });
  return res.json({ success: true, data: { title: action.title, description: action.description, owner: action.owner, priority: action.priority, dueInDays: action.dueInDays, source: "BUSINESS_AI", approvalRequired: true } });
});
router.post("/conversations", async (req, res, next) => { try { res.json({ success: true, data: await createBusinessConversation(context(req), req.body?.title) }); } catch (error) { next(error); } });
router.get("/conversations/:id/messages", async (req, res, next) => { try { res.json({ success: true, data: await listBusinessMessages(context(req), req.params.id) }); } catch (error) { next(error); } });
router.get("/intelligence/:module", async (req, res, next) => {
  try {
    const snapshot = await aiBusinessIntelligenceService.snapshot(context(req), Number(req.query.days ?? 30));
    const moduleName = req.params.module;
    const data = moduleName === "sales" ? salesForecast(snapshot) : moduleName === "finance" ? financeInsight(snapshot) : moduleName === "inventory" ? inventoryInsight(snapshot) : moduleName === "customers" ? customerSegments(snapshot) : null;
    if (!data) return res.status(404).json({ success: false, error: { code: "MODULE_NOT_FOUND" } });
    return res.json({ success: true, data });
  } catch (error) { next(error); }
});
router.post("/reports/executive", async (req, res, next) => {
  try {
    const snapshot = await aiBusinessIntelligenceService.snapshot(context(req), Number(req.body?.days ?? 30));
    return res.json({ success: true, data: executiveReport(root, context(req), { title: "Executive Business Report", summary: `Revenue ${snapshot.kpis.revenue}; Orders ${snapshot.kpis.orders}; Units ${snapshot.kpis.units}`, metrics: snapshot.kpis }) });
  } catch (error) { next(error); }
});
router.post("/actions", async (req, res, next) => { try { res.json({ success: true, data: await proposeAction(context(req), req.body ?? {}) }); } catch (error) { next(error); } });
router.post("/actions/:id/approve", async (req, res, next) => { try { res.json({ success: true, data: await approveAction(context(req), req.params.id) }); } catch (error) { next(error); } });
router.post("/actions/:id/execute", async (req, res, next) => { try { res.json({ success: true, data: await executeAction(context(req), req.params.id) }); } catch (error) { next(error); } });
router.get("/platform/control", async (req: any, res, next) => { try { if (String(req.user?.role) !== "SUPER_ADMIN") return res.status(403).json({ success: false, error: { code: "PLATFORM_ADMIN_REQUIRED" } }); res.json({ success: true, data: await businessAiControlService.get(String(req.query.tenantId ?? ""), String(req.query.storeId ?? "") || undefined) }); } catch (error) { next(error); } });
router.post("/platform/control", async (req: any, res, next) => { try { if (String(req.user?.role) !== "SUPER_ADMIN") return res.status(403).json({ success: false, error: { code: "PLATFORM_ADMIN_REQUIRED" } }); res.json({ success: true, data: await businessAiControlService.save(req.body) }); } catch (error) { next(error); } });

router.post("/voice-session",(req,res)=>res.json({success:true,data:businessVoice(req.body??{})}));

router.get("/forecast",async(req,res,next)=>{try{const s=await aiBusinessIntelligenceService.snapshot(context(req),Number(req.query.days??30));res.json({success:true,data:forecast(s,Number(req.query.horizonDays??30))});}catch(e){next(e);}});
router.post("/scenario",async(req,res,next)=>{try{const s=await aiBusinessIntelligenceService.snapshot(context(req),Number(req.body?.days??30));res.json({success:true,data:scenario(s,req.body??{})});}catch(e){next(e);}});

router.get("/executive-advisors",async(req,res,next)=>{try{const s=await aiBusinessIntelligenceService.snapshot(context(req),Number(req.query.days??30));res.json({success:true,data:executiveAdvisors(s)});}catch(e){next(e);}});

router.post("/reports/board",async(req,res,next)=>{try{const s=await aiBusinessIntelligenceService.snapshot(context(req),Number(req.body?.days??30));res.json({success:true,data:boardReport(root,context(req),{title:"Board Report",kpis:s.kpis})});}catch(e){next(e);}});

router.post("/actions/certify",(req,res)=>res.json({success:true,data:certifyAction(req.body??{})}));

router.post("/agents/orchestrate", async (req,res,next) => {
  try {
    const snapshot = await aiBusinessIntelligenceService.snapshot(
      context(req),
      Number(req.body?.days ?? 30),
    );
    res.json({
      success:true,
      data:orchestrateBusinessAgents({
        question:req.body?.question,
        evidence:{kpis:snapshot.kpis},
        agents:req.body?.agents,
      }),
    });
  } catch(error) {
    next(error);
  }
});
router.post("/reasoning/deep", (req,res) =>
  res.json({success:true,data:deepBusinessReasoning(req.body ?? {})})
);

router.post("/scenarios/enterprise", (req,res) =>
  res.json({success:true,data:enterpriseScenarioSimulation(req.body ?? {})})
);
router.post("/goals/enterprise-plan", (req,res) =>
  res.json({success:true,data:enterpriseGoalPlan(req.body ?? {})})
);

router.post("/memory", async (req,res,next) => {
  try {
    res.json({
      success:true,
      data:await rememberBusinessDecision(context(req),req.body ?? {}),
    });
  } catch(error) {
    next(error);
  }
});
router.get("/memory", async (req,res,next) => {
  try {
    res.json({
      success:true,
      data:await listBusinessMemory(context(req)),
    });
  } catch(error) {
    next(error);
  }
});
router.post("/voice/enterprise-session", (req,res) =>
  res.json({success:true,data:enterpriseVoiceSession(req.body ?? {})})
);

router.post("/reports/management-automation", async (req,res,next) => {
  try {
    const snapshot = await aiBusinessIntelligenceService.snapshot(
      context(req),
      Number(req.body?.days ?? 30),
    );
    res.json({
      success:true,
      data:automateManagementReport(root,context(req),{
        ...req.body,
        metrics:snapshot.kpis,
      }),
    });
  } catch(error) {
    next(error);
  }
});
router.post("/decisions/draft", (req,res) =>
  res.json({success:true,data:executiveDecisionDraft(req.body ?? {})})
);
router.post("/predictive-intelligence", (req,res) =>
  res.json({success:true,data:predictiveIntelligence(req.body ?? {})})
);

router.post("/certification/enterprise", (req,res) =>
  res.json({success:true,data:certifyBusinessAi(req.body ?? {})})
);

export default router;
