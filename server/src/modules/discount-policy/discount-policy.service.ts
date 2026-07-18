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

// PHASE 5.6 ENTERPRISE COUPON GUARDS - START
function phase56AssertCouponActiveWindow(input: {
  active?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  now?: Date;
}): void {
  const now = input.now ?? new Date();

  if (input.active !== undefined && input.active !== null) {
    const activeValue = String(input.active).toUpperCase();
    if (!["TRUE", "ACTIVE", "1", "YES"].includes(activeValue)) {
      throw new Error("Coupon is not active");
    }
  }

  if (input.startsAt && new Date(String(input.startsAt)) > now) {
    throw new Error("Coupon is not started yet");
  }

  if (input.endsAt && new Date(String(input.endsAt)) < now) {
    throw new Error("Coupon is expired");
  }
}

function phase56AssertCouponDiscount(input: {
  cartSubtotal: unknown;
  discountAmount: unknown;
  maxDiscount?: unknown;
}): number {
  const subtotal = Number(input.cartSubtotal);
  const discount = Number(input.discountAmount);
  const maxDiscount = input.maxDiscount === undefined || input.maxDiscount === null ? null : Number(input.maxDiscount);

  if (!Number.isFinite(subtotal) || subtotal < 0) {
    throw new Error("Invalid cart subtotal");
  }
  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("Invalid coupon discount");
  }
  if (discount > subtotal) {
    throw new Error("Coupon discount exceeds subtotal");
  }
  if (maxDiscount !== null && (!Number.isFinite(maxDiscount) || discount > maxDiscount)) {
    throw new Error("Coupon discount exceeds max discount");
  }

  return Math.round(discount * 100) / 100;
}

function phase56AssertCouponUsageLimit(input: {
  usageCount?: unknown;
  usageLimit?: unknown;
  userUsageCount?: unknown;
  userUsageLimit?: unknown;
}): void {
  const usageCount = Number(input.usageCount ?? 0);
  const usageLimit = input.usageLimit === undefined || input.usageLimit === null ? null : Number(input.usageLimit);
  const userUsageCount = Number(input.userUsageCount ?? 0);
  const userUsageLimit = input.userUsageLimit === undefined || input.userUsageLimit === null ? null : Number(input.userUsageLimit);

  if (usageLimit !== null && usageCount >= usageLimit) {
    throw new Error("Coupon usage limit reached");
  }
  if (userUsageLimit !== null && userUsageCount >= userUsageLimit) {
    throw new Error("Coupon user usage limit reached");
  }
}
// PHASE 5.6 ENTERPRISE COUPON GUARDS - END
