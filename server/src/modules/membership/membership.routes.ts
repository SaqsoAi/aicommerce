import express from "express";

import { protect } from "../auth/auth.middleware";
import { permission } from "../../middleware/permission.middleware";
import { PERMISSIONS } from "../../constants/permissions";

import {
  activateCard,
  claimMembership,
  createTier,
  getCards,
  getClaims,
  getMyMembership,
  getRecommendation,
  getTiers,
  issueCard,
  getCartRecommendation,
  getQualification,
  calculateDiscount,
  getVirtualCard,
} from "./membership.controller";

const router = express.Router();

router.get("/tiers", protect, permission(PERMISSIONS.MEMBERSHIP_READ), getTiers);
router.post("/tiers", protect, permission(PERMISSIONS.MEMBERSHIP_MANAGE), createTier);

router.get("/recommendation", getRecommendation);

router.post("/claim", protect, claimMembership);

router.get("/claims", protect, permission(PERMISSIONS.MEMBERSHIP_READ), getClaims);

router.get("/cards", protect, permission(PERMISSIONS.MEMBERSHIP_READ), getCards);

router.post(
  "/claims/:claimId/issue-card",
  protect,
  permission(PERMISSIONS.MEMBERSHIP_ISSUE),
  issueCard
);

router.post("/activate", protect, activateCard);

router.get("/me", protect, getMyMembership);

router.get("/cart-recommendation", getCartRecommendation);

router.get("/qualification", getQualification);

router.post("/calculate-discount", protect, calculateDiscount);

router.get("/virtual-card", protect, getVirtualCard);

export default router;
