import { Router } from "express";
import { protect, type AuthRequest } from "../auth/auth.middleware";
import {
  createAccountAddress, deleteAccountAddress, getAccountAddresses, getAccountDashboard,
  getAccountMembership, getAccountOrders, getAccountProfile, getAccountRewards, getAccountWishlist,
  updateAccountAddress, updateAccountProfile, listCustomerAccounts,
} from "./account.service";

const router = Router();
router.use(protect);

function userId(req: AuthRequest): string {
  const id = req.user?.id || req.user?.userId;
  if (!id) throw new Error("Authenticated user is required");
  return id;
}
function ok(res: any, data: unknown, message = "OK") { return res.json({ success: true, message, data }); }
function fail(res: any, error: unknown) {
  const message = error instanceof Error ? error.message : "Account API error";
  const status = /not found/i.test(message) ? 404 : /required|invalid/i.test(message) ? 400 : 500;
  return res.status(status).json({ success: false, message });
}

router.get("/dashboard", async (req, res) => { try { return ok(res, await getAccountDashboard(userId(req)), "Account dashboard loaded"); } catch (e) { return fail(res, e); } });
router.get("/profile", async (req, res) => { try { return ok(res, await getAccountProfile(userId(req)), "Account profile loaded"); } catch (e) { return fail(res, e); } });
router.patch("/profile", async (req, res) => { try { return ok(res, await updateAccountProfile(userId(req), req.body || {}), "Account profile updated"); } catch (e) { return fail(res, e); } });
router.get("/addresses", async (req, res) => { try { return ok(res, await getAccountAddresses(userId(req)), "Account addresses loaded"); } catch (e) { return fail(res, e); } });
router.post("/addresses", async (req, res) => { try { return ok(res, await createAccountAddress(userId(req), req.body || {}), "Account address created"); } catch (e) { return fail(res, e); } });
router.patch("/addresses/:id", async (req, res) => { try { return ok(res, await updateAccountAddress(userId(req), req.params.id, req.body || {}), "Account address updated"); } catch (e) { return fail(res, e); } });
router.delete("/addresses/:id", async (req, res) => { try { return ok(res, await deleteAccountAddress(userId(req), req.params.id), "Account address deleted"); } catch (e) { return fail(res, e); } });
router.get("/orders", async (req, res) => { try { return ok(res, await getAccountOrders(userId(req)), "Account orders loaded"); } catch (e) { return fail(res, e); } });
router.get("/wishlist", async (req, res) => { try { return ok(res, await getAccountWishlist(userId(req)), "Account wishlist loaded"); } catch (e) { return fail(res, e); } });
router.get("/rewards", async (req, res) => { try { return ok(res, await getAccountRewards(userId(req)), "Account rewards loaded"); } catch (e) { return fail(res, e); } });
router.get("/membership", async (req, res) => { try { return ok(res, await getAccountMembership(userId(req)), "Account membership loaded"); } catch (e) { return fail(res, e); } });


function requireAccountAdmin(req: AuthRequest, res: any): boolean {
  const role = String(req.user?.role || "").toUpperCase();
  if (!["SUPER_ADMIN", "ADMIN"].includes(role)) {
    res.status(403).json({ success: false, message: "Account administration permission required" });
    return false;
  }
  return true;
}

router.get("/admin/customers", async (req, res) => {
  if (!requireAccountAdmin(req, res)) return;
  try { return ok(res, await listCustomerAccounts(), "Customer accounts loaded"); } catch (e) { return fail(res, e); }
});
router.get("/admin/customers/:userId", async (req, res) => {
  if (!requireAccountAdmin(req, res)) return;
  try { return ok(res, await getAccountDashboard(req.params.userId), "Customer account loaded"); } catch (e) { return fail(res, e); }
});
router.patch("/admin/customers/:userId/profile", async (req, res) => {
  if (!requireAccountAdmin(req, res)) return;
  try { return ok(res, await updateAccountProfile(req.params.userId, req.body || {}), "Customer profile updated"); } catch (e) { return fail(res, e); }
});

export default router;
