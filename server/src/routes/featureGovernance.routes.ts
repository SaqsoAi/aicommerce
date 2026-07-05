import { Router } from "express";
import { featureFlagService } from "../governance/featureFlag.service";
import { providerRegistryService } from "../governance/providerRegistry.service";
import { providerHealthService } from "../governance/providerHealth.service";

const router = Router();

function requireSuperAdmin(req: any, res: any, next: any) {
  const role = req.user?.role || req.user?.type || req.headers["x-user-role"];
  if (role !== "SUPER_ADMIN" && role !== "super_admin") {
    return res.status(403).json({ success: false, code: "SUPER_ADMIN_REQUIRED" });
  }
  return next();
}

router.get("/feature-flags", requireSuperAdmin, (_req, res) => {
  res.json({ success: true, data: featureFlagService.list() });
});

router.post("/feature-flags/:key", requireSuperAdmin, (req, res) => {
  const body = req.body || {};
  const data = featureFlagService.upsert({
    key: req.params.key,
    enabled: Boolean(body.enabled),
    kind: body.kind || "SYSTEM",
    scope: body.scope || "SYSTEM",
    tenantId: body.tenantId || null,
    storeId: body.storeId || null,
    role: body.role || null,
    environment: body.environment || process.env.NODE_ENV || "development",
    reason: body.reason || null
  });
  res.json({ success: true, data });
});

router.get("/feature-flags/:key/resolve", (req, res) => {
  const enabled = featureFlagService.resolve(req.params.key, {
    tenantId: String(req.query.tenantId || ""),
    storeId: String(req.query.storeId || ""),
    role: String(req.query.role || ""),
    environment: String(req.query.environment || process.env.NODE_ENV || "development")
  });
  res.json({ success: true, data: { key: req.params.key, enabled } });
});

router.get("/providers", requireSuperAdmin, (_req, res) => {
  res.json({ success: true, data: providerRegistryService.list() });
});

router.get("/providers/health", requireSuperAdmin, (_req, res) => {
  res.json({ success: true, data: providerHealthService.checkAll() });
});

router.post("/providers/:type/test", requireSuperAdmin, (req, res) => {
  const health = providerHealthService.check(String(req.params.type).toUpperCase());
  res.json({ success: true, data: health });
});

export default router;
