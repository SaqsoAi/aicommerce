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

// PHASE 5.4 ENTERPRISE CHECKOUT TRANSACTION GUARDS - START
type Phase54MoneyInput = number | string | null | undefined;

function phase54ToMoney(value: Phase54MoneyInput, fieldName = "amount"): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return Math.round(n * 100) / 100;
}

function phase54AssertPositiveCheckoutQuantity(quantity: unknown): void {
  const n = Number(quantity);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("Invalid checkout quantity");
  }
}

function phase54AssertServerTotalIntegrity(parts: {
  subtotal: Phase54MoneyInput;
  discount?: Phase54MoneyInput;
  couponDiscount?: Phase54MoneyInput;
  membershipDiscount?: Phase54MoneyInput;
  rewardDiscount?: Phase54MoneyInput;
  tax?: Phase54MoneyInput;
  shipping?: Phase54MoneyInput;
  grandTotal: Phase54MoneyInput;
}): void {
  const subtotal = phase54ToMoney(parts.subtotal, "subtotal");
  const discount =
    phase54ToMoney(parts.discount, "discount") +
    phase54ToMoney(parts.couponDiscount, "couponDiscount") +
    phase54ToMoney(parts.membershipDiscount, "membershipDiscount") +
    phase54ToMoney(parts.rewardDiscount, "rewardDiscount");
  const tax = phase54ToMoney(parts.tax, "tax");
  const shipping = phase54ToMoney(parts.shipping, "shipping");
  const expected = phase54ToMoney(subtotal - discount + tax + shipping, "expectedGrandTotal");
  const actual = phase54ToMoney(parts.grandTotal, "grandTotal");

  if (Math.abs(expected - actual) > 0.01) {
    throw new Error("Checkout total integrity failed: client totals are untrusted");
  }
}

function phase54AssertNoClientTrustedTotal(clientTotal: unknown): void {
  if (clientTotal !== undefined && clientTotal !== null) {
    const total = Number(clientTotal);
    if (!Number.isFinite(total) || total < 0) {
      throw new Error("Invalid client-submitted total");
    }
  }
}
// PHASE 5.4 ENTERPRISE CHECKOUT TRANSACTION GUARDS - END
