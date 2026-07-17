import prisma from "../../config/prisma";

const numberOrNull = (value: any) =>
  value === undefined || value === "" || value === null
    ? null
    : Number(value);

export const getRewardPointRulesService = async () => {
  return prisma.rewardPointRule.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const createRewardPointRuleService = async (data: any) => {
  return prisma.rewardPointRule.create({
    data: {
      title: data.title,
      ruleType: data.ruleType,
      spendAmount: numberOrNull(data.spendAmount),
      quantity: numberOrNull(data.quantity),
      points: Number(data.points || 0),
      active: data.active ?? true,
    },
  });
};

export const updateRewardPointRuleService = async (id: string, data: any) => {
  return prisma.rewardPointRule.update({
    where: { id },
    data: {
      title: data.title,
      ruleType: data.ruleType,
      spendAmount: numberOrNull(data.spendAmount),
      quantity: numberOrNull(data.quantity),
      points: Number(data.points || 0),
      active: data.active ?? true,
    },
  });
};

export const toggleRewardPointRuleService = async (id: string) => {
  const rule = await prisma.rewardPointRule.findUnique({ where: { id } });

  if (!rule) throw new Error("Point rule not found");

  return prisma.rewardPointRule.update({
    where: { id },
    data: { active: !rule.active },
  });
};

export const deleteRewardPointRuleService = async (id: string) => {
  return prisma.rewardPointRule.delete({
    where: { id },
  });
};

export const getRewardRedemptionRulesService = async () => {
  return prisma.rewardRedemptionRule.findMany({
    orderBy: { requiredPoints: "asc" },
  });
};

export const createRewardRedemptionRuleService = async (data: any) => {
  return prisma.rewardRedemptionRule.create({
    data: {
      title: data.title,
      requiredPoints: Number(data.requiredPoints || 0),
      rewardType: data.rewardType,
      discountAmount: numberOrNull(data.discountAmount),
      discountPercent: numberOrNull(data.discountPercent),
      freeDelivery: Boolean(data.freeDelivery),
      active: data.active ?? true,
    },
  });
};

export const updateRewardRedemptionRuleService = async (
  id: string,
  data: any
) => {
  return prisma.rewardRedemptionRule.update({
    where: { id },
    data: {
      title: data.title,
      requiredPoints: Number(data.requiredPoints || 0),
      rewardType: data.rewardType,
      discountAmount: numberOrNull(data.discountAmount),
      discountPercent: numberOrNull(data.discountPercent),
      freeDelivery: Boolean(data.freeDelivery),
      active: data.active ?? true,
    },
  });
};

export const toggleRewardRedemptionRuleService = async (id: string) => {
  const rule = await prisma.rewardRedemptionRule.findUnique({ where: { id } });

  if (!rule) throw new Error("Redemption rule not found");

  return prisma.rewardRedemptionRule.update({
    where: { id },
    data: { active: !rule.active },
  });
};

export const deleteRewardRedemptionRuleService = async (id: string) => {
  return prisma.rewardRedemptionRule.delete({
    where: { id },
  });
};

export const getRewardWalletService = async (userId: string) => {
  return prisma.rewardWallet.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      points: 0,
      lifetimeEarned: 0,
      lifetimeUsed: 0,
    },
  });
};

export const getRewardWalletsService = async () => {
  return prisma.rewardWallet.findMany({
    orderBy: { updatedAt: "desc" },
  });
};

export const getRewardTransactionsService = async () => {
  return prisma.rewardTransaction.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const adjustRewardWalletService = async (data: any) => {
  const userId = String(data.userId);
  const points = Number(data.points || 0);
  const type = points >= 0 ? "ADMIN_ADJUST_ADD" : "ADMIN_ADJUST_REMOVE";

  const updateData: any = {
    points: {
      increment: points,
    },
  };

  if (points > 0) {
    updateData.lifetimeEarned = {
      increment: points,
    };
  }

  if (points < 0) {
    updateData.lifetimeUsed = {
      increment: Math.abs(points),
    };
  }

  const wallet = await prisma.rewardWallet.upsert({
    where: { userId },
    update: updateData,
    create: {
      userId,
      points,
      lifetimeEarned: points > 0 ? points : 0,
      lifetimeUsed: points < 0 ? Math.abs(points) : 0,
    },
  });

  await prisma.rewardTransaction.create({
    data: {
      userId,
      type,
      points,
      reason: data.reason || "Admin reward adjustment",
      balanceAfter: wallet.points,
    },
  });

  return wallet;
};

export const earnRewardPointsService = async (
  userId: string,
  orderId: string,
  amount: number,
  quantity: number
) => {
  const rules = await prisma.rewardPointRule.findMany({
    where: { active: true },
  });

  let totalPoints = 0;

  for (const rule of rules) {
    if (rule.ruleType === "SPEND" && rule.spendAmount) {
      totalPoints += Math.floor(amount / rule.spendAmount) * rule.points;
    }

    if (rule.ruleType === "QUANTITY" && rule.quantity) {
      totalPoints += Math.floor(quantity / rule.quantity) * rule.points;
    }
  }

  const wallet = await prisma.rewardWallet.upsert({
    where: { userId },
    update: {
      points: { increment: totalPoints },
      lifetimeEarned: { increment: totalPoints },
    },
    create: {
      userId,
      points: totalPoints,
      lifetimeEarned: totalPoints,
      lifetimeUsed: 0,
    },
  });

  await prisma.rewardTransaction.create({
    data: {
      userId,
      orderId,
      type: "EARN",
      points: totalPoints,
      reason: "Order reward points",
      balanceAfter: wallet.points,
    },
  });

  return {
    wallet,
    earnedPoints: totalPoints,
  };
};

export const redeemRewardService = async (userId: string, ruleId: string) => {
  const rule = await prisma.rewardRedemptionRule.findUnique({
    where: { id: ruleId },
  });

  if (!rule || !rule.active) {
    throw new Error("Invalid redemption rule");
  }

  const wallet = await getRewardWalletService(userId);

  if (wallet.points < rule.requiredPoints) {
    throw new Error("Not enough points");
  }

  const updatedWallet = await prisma.rewardWallet.update({
    where: { userId },
    data: {
      points: { decrement: rule.requiredPoints },
      lifetimeUsed: { increment: rule.requiredPoints },
    },
  });

  await prisma.rewardTransaction.create({
    data: {
      userId,
      type: "REDEEM",
      points: -rule.requiredPoints,
      reason: rule.title,
      balanceAfter: updatedWallet.points,
    },
  });

  return {
    wallet: updatedWallet,
    reward: rule,
  };
};

