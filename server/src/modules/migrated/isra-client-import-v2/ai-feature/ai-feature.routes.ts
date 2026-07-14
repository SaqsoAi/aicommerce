import { Router } from "express";

export const ai_featureMigratedRouter = Router();
const REQUIRED_FIELDS = ["name","provider","model","promptKey","featureFlag","tenantScope","storeScope","enabled"] as const;

ai_featureMigratedRouter.get("/", async (_req, res) => {
  res.status(501).json({ success: false, code: "MIGRATED_FEATURE_NOT_BOUND", message: "Bind this generated contract to the existing service or approved database implementation before publish.", templateKey: "isra-client-import-v2" });
});

ai_featureMigratedRouter.post("/", async (req, res) => {
  const missing = REQUIRED_FIELDS.filter((field) => req.body?.[field] === undefined);
  if (missing.length) return res.status(400).json({ success: false, message: "Required fields missing", missing });
  return res.status(501).json({ success: false, code: "MIGRATED_FEATURE_NOT_BOUND", message: "Generated source contract requires service/database binding before activation." });
});
