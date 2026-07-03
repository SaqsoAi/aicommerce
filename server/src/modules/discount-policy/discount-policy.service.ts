import prisma from "../../config/prisma";

const singletonKey = "main";

export const getDiscountPolicyService = async () => {
  return prisma.discountPolicySetting.upsert({
    where: { singletonKey },
    update: {},
    create: {
      singletonKey,
      membershipDiscountScope: "NON_DISCOUNTED_ONLY",
      rewardDiscountScope: "ALL_PRODUCTS",
      allowMembershipRewardTogether: true,
      conflictResolution: "HIGHEST_DISCOUNT",
      active: true,
    },
  });
};

export const updateDiscountPolicyService = async (data: any) => {
  return prisma.discountPolicySetting.upsert({
    where: { singletonKey },
    update: {
      membershipDiscountScope: data.membershipDiscountScope ?? undefined,
      rewardDiscountScope: data.rewardDiscountScope ?? undefined,
      allowMembershipRewardTogether:
        data.allowMembershipRewardTogether ?? undefined,
      conflictResolution: data.conflictResolution ?? undefined,
      maxDiscountPercent:
        data.maxDiscountPercent === "" || data.maxDiscountPercent === undefined
          ? null
          : Number(data.maxDiscountPercent),
      active: data.active ?? undefined,
    },
    create: {
      singletonKey,
      membershipDiscountScope:
        data.membershipDiscountScope ?? "NON_DISCOUNTED_ONLY",
      rewardDiscountScope: data.rewardDiscountScope ?? "ALL_PRODUCTS",
      allowMembershipRewardTogether:
        data.allowMembershipRewardTogether ?? true,
      conflictResolution: data.conflictResolution ?? "HIGHEST_DISCOUNT",
      maxDiscountPercent:
        data.maxDiscountPercent === "" || data.maxDiscountPercent === undefined
          ? null
          : Number(data.maxDiscountPercent),
      active: data.active ?? true,
    },
  });
};
