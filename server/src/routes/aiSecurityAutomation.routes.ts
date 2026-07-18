import { Router } from "express";
import {
  createExplainableSecurityDecision,
  getAiSecurityAutomationHealth,
} from "../ai/security-automation";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: getAiSecurityAutomationHealth(),
  });
});

router.post("/analyze", (req, res) => {
  const result = createExplainableSecurityDecision(req.body ?? { mode: "SECURITY_CENTER" });
  res.json({
    success: true,
    data: result,
  });
});

router.post("/decision-trace", (req, res) => {
  const result = createExplainableSecurityDecision({
    ...(req.body ?? {}),
    mode: "DECISION_TRACEABILITY",
  });
  res.json({
    success: true,
    data: result,
  });
});

router.post("/explain", (req, res) => {
  const result = createExplainableSecurityDecision({
    ...(req.body ?? {}),
    mode: "EXPLAINABILITY",
  });
  res.json({
    success: true,
    data: result,
  });
});

export default router;
