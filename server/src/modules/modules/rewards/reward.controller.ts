import { Response } from "express";
import {
  adjustRewardWalletService,
  createRewardPointRuleService,
  createRewardRedemptionRuleService,
  deleteRewardPointRuleService,
  deleteRewardRedemptionRuleService,
  earnRewardPointsService,
  getRewardPointRulesService,
  getRewardRedemptionRulesService,
  getRewardTransactionsService,
  getRewardWalletService,
  getRewardWalletsService,
  redeemRewardService,
  toggleRewardPointRuleService,
  toggleRewardRedemptionRuleService,
  updateRewardPointRuleService,
  updateRewardRedemptionRuleService,
} from "./reward.service";
import { getRewardWalletHistoryService } from "./reward-wallet.service";

const ok = (res: Response, data: any) =>
  res.json({ success: true, data });

const fail = (res: Response, error: any, status = 400) =>
  res.status(status).json({
    success: false,
    message: error.message || "Request failed",
  });

export const getPointRules = async (_req: any, res: Response) => {
  try {
    return ok(res, await getRewardPointRulesService());
  } catch (error: any) {
    return fail(res, error, 500);
  }
};

export const createPointRule = async (req: any, res: Response) => {
  try {
    const data = await createRewardPointRuleService(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return fail(res, error);
  }
};

export const updatePointRule = async (req: any, res: Response) => {
  try {
    return ok(
      res,
      await updateRewardPointRuleService(String(req.params.id), req.body)
    );
  } catch (error: any) {
    return fail(res, error);
  }
};

export const togglePointRule = async (req: any, res: Response) => {
  try {
    return ok(res, await toggleRewardPointRuleService(String(req.params.id)));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const deletePointRule = async (req: any, res: Response) => {
  try {
    return ok(res, await deleteRewardPointRuleService(String(req.params.id)));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const getRedemptionRules = async (_req: any, res: Response) => {
  try {
    return ok(res, await getRewardRedemptionRulesService());
  } catch (error: any) {
    return fail(res, error, 500);
  }
};

export const createRedemptionRule = async (req: any, res: Response) => {
  try {
    const data = await createRewardRedemptionRuleService(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return fail(res, error);
  }
};

export const updateRedemptionRule = async (req: any, res: Response) => {
  try {
    return ok(
      res,
      await updateRewardRedemptionRuleService(String(req.params.id), req.body)
    );
  } catch (error: any) {
    return fail(res, error);
  }
};

export const toggleRedemptionRule = async (req: any, res: Response) => {
  try {
    return ok(
      res,
      await toggleRewardRedemptionRuleService(String(req.params.id))
    );
  } catch (error: any) {
    return fail(res, error);
  }
};

export const deleteRedemptionRule = async (req: any, res: Response) => {
  try {
    return ok(
      res,
      await deleteRewardRedemptionRuleService(String(req.params.id))
    );
  } catch (error: any) {
    return fail(res, error);
  }
};

export const getWallet = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;
    return ok(res, await getRewardWalletService(String(userId)));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const getWallets = async (_req: any, res: Response) => {
  try {
    return ok(res, await getRewardWalletsService());
  } catch (error: any) {
    return fail(res, error, 500);
  }
};

export const getTransactions = async (_req: any, res: Response) => {
  try {
    return ok(res, await getRewardTransactionsService());
  } catch (error: any) {
    return fail(res, error, 500);
  }
};

export const adjustWallet = async (req: any, res: Response) => {
  try {
    return ok(res, await adjustRewardWalletService(req.body));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const earnPoints = async (req: any, res: Response) => {
  try {
    const data = await earnRewardPointsService(
      req.body.userId,
      req.body.orderId,
      Number(req.body.amount),
      Number(req.body.quantity)
    );

    return ok(res, data);
  } catch (error: any) {
    return fail(res, error);
  }
};

export const redeemPoints = async (req: any, res: Response) => {
  try {
    const userId = req.user?.id || req.body.userId;
    return ok(res, await redeemRewardService(userId, req.body.ruleId));
  } catch (error: any) {
    return fail(res, error);
  }
};

export const getWalletHistory = async (req: any, res: Response) => {
  try {
    const data = await getRewardWalletHistoryService(req.params.userId);
    return ok(res, data);
  } catch (error: any) {
    return fail(res, error, 500);
  }
};
