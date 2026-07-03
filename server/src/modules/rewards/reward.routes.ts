import express from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  adjustWallet,
  createPointRule,
  createRedemptionRule,
  deletePointRule,
  deleteRedemptionRule,
  earnPoints,
  getPointRules,
  getRedemptionRules,
  getTransactions,
  getWallet,
  getWalletHistory,
  getWallets,
  redeemPoints,
  togglePointRule,
  toggleRedemptionRule,
  updatePointRule,
  updateRedemptionRule,
} from "./reward.controller";

const router = express.Router();

router.get("/point-rules", protect, permission(PERMISSIONS.REWARD_READ), getPointRules);

router.post("/point-rules", protect, permission(PERMISSIONS.REWARD_MANAGE), createPointRule);

router.put("/point-rules/:id", protect, permission(PERMISSIONS.REWARD_MANAGE), updatePointRule);

router.patch("/point-rules/:id/toggle", protect, permission(PERMISSIONS.REWARD_MANAGE), togglePointRule);

router.delete("/point-rules/:id", protect, permission(PERMISSIONS.REWARD_MANAGE), deletePointRule);

router.get("/redemption-rules", protect, permission(PERMISSIONS.REWARD_READ), getRedemptionRules);

router.post("/redemption-rules", protect, permission(PERMISSIONS.REWARD_MANAGE), createRedemptionRule);

router.put("/redemption-rules/:id", protect, permission(PERMISSIONS.REWARD_MANAGE), updateRedemptionRule);

router.patch("/redemption-rules/:id/toggle", protect, permission(PERMISSIONS.REWARD_MANAGE), toggleRedemptionRule);

router.delete("/redemption-rules/:id", protect, permission(PERMISSIONS.REWARD_MANAGE), deleteRedemptionRule);

router.get("/wallet", protect, getWallet);

router.get("/wallets", protect, permission(PERMISSIONS.REWARD_READ), getWallets);

router.post("/wallets/adjust", protect, permission(PERMISSIONS.REWARD_MANAGE), adjustWallet);

router.get("/transactions", protect, permission(PERMISSIONS.REWARD_READ), getTransactions);

router.get("/wallet-history/:userId", protect, permission(PERMISSIONS.REWARD_READ), getWalletHistory);

router.post("/earn", protect, permission(PERMISSIONS.REWARD_MANAGE), earnPoints);

router.post("/redeem", protect, redeemPoints);

export default router;
