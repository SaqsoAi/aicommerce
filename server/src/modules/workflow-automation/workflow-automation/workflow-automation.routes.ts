import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import { workflowAutomationController } from "./workflow-automation.controller";

const router = Router();

router.use(protect);

router.get("/", workflowAutomationController.list);
router.post("/", workflowAutomationController.create);
router.get("/analytics/summary", workflowAutomationController.analytics);
router.post("/ai/generate", workflowAutomationController.aiGenerate);
router.get("/:id", workflowAutomationController.get);
router.post("/:id/graph", workflowAutomationController.saveGraph);
router.post("/:id/publish", workflowAutomationController.publish);
router.post("/:id/execute", workflowAutomationController.execute);

export default router;
