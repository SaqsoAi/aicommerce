import { Request, Response } from "express";
import { enterpriseAuthIdentityService } from "./enterprise-auth-identity.service";
import {
  createSessionSchema,
  magicLinkSchema,
  passwordResetSchema,
  securityPolicySchema,
  trustedDeviceSchema,
  twoFactorSchema,
} from "./enterprise-auth-identity.validation";

const ok = (res: Response, data: any) => res.json({ success: true, data });

const fail = (res: Response, error: any) =>
  res.status(400).json({
    success: false,
    message: error?.message || "Enterprise auth identity error",
  });

const paramId = (req: Request): string => {
  const raw = req.params.id;
  return Array.isArray(raw) ? raw[0] : String(raw);
};

export const enterpriseAuthIdentityController = {
  async dashboard(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.dashboard()); }
    catch (e) { fail(res, e); }
  },

  async sessions(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listSessions(req.query.userId as string | undefined)); }
    catch (e) { fail(res, e); }
  },

  async createSession(req: Request, res: Response) {
    try {
      const data = createSessionSchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.createSession(data));
    } catch (e) { fail(res, e); }
  },

  async revokeSession(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.revokeSession(paramId(req))); }
    catch (e) { fail(res, e); }
  },

  async forceLogout(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.forceLogoutUser(paramId(req))); }
    catch (e) { fail(res, e); }
  },

  async devices(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listDevices(req.query.userId as string | undefined)); }
    catch (e) { fail(res, e); }
  },

  async trustDevice(req: Request, res: Response) {
    try {
      const data = trustedDeviceSchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.trustDevice(data));
    } catch (e) { fail(res, e); }
  },

  async loginHistory(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listLoginHistory(req.query.userId as string | undefined)); }
    catch (e) { fail(res, e); }
  },

  async twoFactor(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listTwoFactor(req.query.userId as string | undefined)); }
    catch (e) { fail(res, e); }
  },

  async enableTwoFactor(req: Request, res: Response) {
    try {
      const data = twoFactorSchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.enableTwoFactor(data));
    } catch (e) { fail(res, e); }
  },

  async magicLink(req: Request, res: Response) {
    try {
      const data = magicLinkSchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.createMagicLink(data));
    } catch (e) { fail(res, e); }
  },

  async passwordReset(req: Request, res: Response) {
    try {
      const data = passwordResetSchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.createPasswordReset(data));
    } catch (e) { fail(res, e); }
  },

  async policies(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listPolicies()); }
    catch (e) { fail(res, e); }
  },

  async upsertPolicy(req: Request, res: Response) {
    try {
      const data = securityPolicySchema.parse(req.body);
      ok(res, await enterpriseAuthIdentityService.upsertPolicy(data));
    } catch (e) { fail(res, e); }
  },

  async events(req: Request, res: Response) {
    try { ok(res, await enterpriseAuthIdentityService.listSecurityEvents(req.query.userId as string | undefined)); }
    catch (e) { fail(res, e); }
  },
};
