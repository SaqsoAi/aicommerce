import { Router } from "express";

import {
  createAccountAddress,
  getAccountAddresses,
  getAccountDashboard,
  getAccountMembership,
  getAccountOrders,
  getAccountProfile,
  getAccountRewards,
  getAccountWishlist,
  updateAccountProfile,
} from "./account.service";

const router = Router();

function getUserId(req: any): string | null {
  return req.user?.id || req.user?.userId || req.query?.userId || req.body?.userId || null;
}

function ok(res: any, data: unknown, message = "OK") {
  return res.json({ success: true, message, data });
}

function fail(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Account API error";
  return res.status(500).json({ success: false, message });
}

router.get("/dashboard", async (req, res) => {
  try {
    return ok(res, await getAccountDashboard(getUserId(req)), "Account dashboard loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/profile", async (req, res) => {
  try {
    return ok(res, await getAccountProfile(getUserId(req)), "Account profile loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.patch("/profile", async (req, res) => {
  try {
    return ok(res, await updateAccountProfile(getUserId(req), req.body || {}), "Account profile updated");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/addresses", async (req, res) => {
  try {
    return ok(res, await getAccountAddresses(getUserId(req)), "Account addresses loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.post("/addresses", async (req, res) => {
  try {
    return ok(res, await createAccountAddress(getUserId(req), req.body || {}), "Account address created");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/orders", async (_req, res) => {
  try {
    return ok(res, await getAccountOrders(), "Account orders loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/wishlist", async (_req, res) => {
  try {
    return ok(res, await getAccountWishlist(), "Account wishlist loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/rewards", async (req, res) => {
  try {
    return ok(res, await getAccountRewards(getUserId(req)), "Account rewards loaded");
  } catch (error) {
    return fail(res, error);
  }
});

router.get("/membership", async (req, res) => {
  try {
    return ok(res, await getAccountMembership(getUserId(req)), "Account membership loaded");
  } catch (error) {
    return fail(res, error);
  }
});

export default router;