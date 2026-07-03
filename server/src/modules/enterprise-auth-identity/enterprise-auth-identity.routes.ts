import { Router } from "express";
import { protect } from "../auth/auth.middleware";
import { enterpriseAuthIdentityController } from "./enterprise-auth-identity.controller";

const router = Router();

router.use(protect);

router.get("/dashboard", enterpriseAuthIdentityController.dashboard);

router.get("/sessions", enterpriseAuthIdentityController.sessions);
router.post("/sessions", enterpriseAuthIdentityController.createSession);
router.post("/sessions/:id/revoke", enterpriseAuthIdentityController.revokeSession);
router.post("/users/:id/force-logout", enterpriseAuthIdentityController.forceLogout);

router.get("/devices", enterpriseAuthIdentityController.devices);
router.post("/devices/trust", enterpriseAuthIdentityController.trustDevice);

router.get("/login-history", enterpriseAuthIdentityController.loginHistory);

router.get("/two-factor", enterpriseAuthIdentityController.twoFactor);
router.post("/two-factor/enable", enterpriseAuthIdentityController.enableTwoFactor);

router.post("/magic-link", enterpriseAuthIdentityController.magicLink);
router.post("/password-reset", enterpriseAuthIdentityController.passwordReset);

router.get("/policies", enterpriseAuthIdentityController.policies);
router.post("/policies", enterpriseAuthIdentityController.upsertPolicy);

router.get("/events", enterpriseAuthIdentityController.events);

export default router;
