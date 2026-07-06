import prisma from "../../config/prisma";

export const createMembershipDiscountLog =
async (
  payload: {
    userId: string;
    orderId?: string;
    membershipCardId?: string;
    tierName: string;
    discountPercent: number;
    discountAmount: number;
    eligibleAmount: number;
  }
) => {

  return prisma.membershipDiscountLog.create({
    data: payload,
  });
};

export const createRewardRedemptionLog =
async (
  payload: {
    userId: string;
    orderId?: string;
    ruleId: string;
    pointsUsed: number;
    rewardType: string;
    discountAmount?: number;
    discountPercent?: number;
    freeDelivery?: boolean;
  }
) => {

  return prisma.checkoutRewardRedemption.create({
    data: payload,
  });
};
