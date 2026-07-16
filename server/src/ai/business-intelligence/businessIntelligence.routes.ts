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

router.get("/health", (_req, res) => res.json({ success: true, module: "saqso-business-ai-advisor", version: "2.4.2", completionLevel: 5, tenantIsolation: true, multilingual: true, liveMutation: false }));
router.get("/completion-health", (_req, res) => res.json({ success: true, data: { module: "business-ai-advisor", completionLevel: 5, tenantIsolation: true } }));
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

export default router;
