import prisma from "../../config/prisma";

export const getMembershipCartRecommendationService =
async (cartAmount: number) => {

  const setting =
    await prisma.membershipCartRecommendationSetting.findFirst();

  const activationPercent =
    setting?.activationPercent ?? 75;

  const tiers =
    await prisma.membershipTier.findMany({
      where: { active: true },
      orderBy: {
        minOrderAmount: "asc",
      },
    });

  const qualifiedTiers =
    tiers.filter(
      tier => cartAmount >= tier.minOrderAmount
    );

  const currentTier =
    qualifiedTiers.length > 0
      ? qualifiedTiers[qualifiedTiers.length - 1]
      : null;

  const nextTier =
    tiers.find(
      tier => tier.minOrderAmount > cartAmount
    );

  if (!nextTier) {
    return {
      qualified: true,
      currentTier,
      nextTier: null,
      message:
        "You already reached the highest membership tier.",
    };
  }

  const triggerAmount =
    nextTier.minOrderAmount *
    (activationPercent / 100);

  if (cartAmount < triggerAmount) {
    return {
      qualified: false,
      showBanner: false,
      currentTier,
      nextTier,
    };
  }

  const needAmount =
    nextTier.minOrderAmount -
    cartAmount;

  return {
    qualified: false,
    showBanner: true,
    currentTier,
    nextTier,
    targetAmount:
      nextTier.minOrderAmount,
    cartAmount,
    needAmount,
    activationPercent,
    message:
      `Buy More Tk ${needAmount} To Get ${nextTier.name} Membership`,
  };
};

export const getMembershipQualificationService =
async (cartAmount: number) => {

  const tier =
    await prisma.membershipTier.findFirst({
      where: {
        active: true,
        minOrderAmount: {
          lte: cartAmount,
        },
      },
      orderBy: {
        minOrderAmount: "desc",
      },
    });

  if (!tier) {
    return {
      qualified: false,
    };
  }

  return {
    qualified: true,
    tier,
    showClaimButton: true,
    message:
      `Congratulations! You Qualified For ${tier.name} Membership`,
  };
};

export const calculateMembershipDiscountService =
async (
  userId: string,
  items: any[]
) => {

  const card =
    await prisma.membershipCard.findFirst({
      where: {
        assignedUserId: userId,
        status: "ACTIVE",
      },
      include: {
        tier: true,
      },
    });

  if (!card) {
    return {
      discountAmount: 0,
      discountPercent: 0,
    };
  }

  let eligibleAmount = 0;

  for (const item of items) {

    const hasDiscount =
      Number(item.discountPrice || 0) > 0;

    if (!hasDiscount) {
      eligibleAmount +=
        Number(item.price || 0) *
        Number(item.quantity || 1);
    }
  }

  const discountAmount =
    eligibleAmount *
    (card.tier.discountPercent / 100);

  return {
    card,
    eligibleAmount,
    discountPercent:
      card.tier.discountPercent,
    discountAmount,
  };
};
