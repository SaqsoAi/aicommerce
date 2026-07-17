import { Response } from "express";
import {
  activateMembershipCardService,
  createMembershipClaimService,
  createMembershipTierService,
  getMembershipCardsService,
  getMembershipClaimsService,
  getMembershipRecommendationService,
  getMembershipTiersService,
  getMyMembershipService,
  issueMembershipCardService,
} from "./membership.service";

import {
  getMembershipCartRecommendationService,
  getMembershipQualificationService,
  calculateMembershipDiscountService,
} from "./membership.checkout.service";

import { getVirtualMembershipCardService } from "./membership-card.service";

export const getTiers = async (req: any, res: Response) => {
  const data = await getMembershipTiersService();
  return res.json({ success: true, data });
};

export const createTier = async (req: any, res: Response) => {
  const data = await createMembershipTierService(req.body);
  return res.status(201).json({ success: true, data });
};

export const getRecommendation = async (req: any, res: Response) => {
  const cartAmount = Number(req.query.cartAmount || 0);
  const data = await getMembershipRecommendationService(cartAmount);
  return res.json({ success: true, data });
};

export const claimMembership = async (req: any, res: Response) => {
  const userId = req.user?.id || req.body.userId;

  const result = await createMembershipClaimService(
    userId,
    {
      invoiceAmount: Number(req.body.invoiceAmount),
      orderId: req.body.orderId || null,
    }
  );

  return res.status(result.success ? 201 : 400).json(result);
};

export const getClaims = async (req: any, res: Response) => {
  const data = await getMembershipClaimsService();
  return res.json({ success: true, data });
};

export const getCards = async (req: any, res: Response) => {
  const data = await getMembershipCardsService();
  return res.json({ success: true, data });
};

export const issueCard = async (req: any, res: Response) => {
  try {
    const data = await issueMembershipCardService(
      String(req.params.claimId),
      req.body.whatsapp,
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const activateCard = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;

    const data = await activateMembershipCardService(
      userId,
      req.body.cardNumber,
      req.body.pinCode,
    );

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyMembership = async (req: any, res: Response) => {
  const userId = req.user?.id || req.query.userId;
  const data = await getMyMembershipService(String(userId));

  return res.json({ success: true, data });
};

export const getCartRecommendation = async (req: any, res: Response) => {
  const cartAmount = Number(req.query.cartAmount || 0);

  const data = await getMembershipCartRecommendationService(cartAmount);

  return res.json({
    success: true,
    data,
  });
};

export const getQualification = async (req: any, res: Response) => {
  const cartAmount = Number(req.query.cartAmount || 0);

  const data = await getMembershipQualificationService(cartAmount);

  return res.json({
    success: true,
    data,
  });
};

export const calculateDiscount = async (req: any, res: Response) => {
  const userId = req.user?.id || req.body.userId;

  const data = await calculateMembershipDiscountService(
    userId,
    req.body.items || [],
  );

  return res.json({
    success: true,
    data,
  });
};

export const getVirtualCard = async (req: any, res: Response) => {
  const card = await getVirtualMembershipCardService(req.user.id);

  return res.json({
    success: true,
    data: card,
  });
};

