import prisma from "../../config/prisma";
import { generateCardNumber, generatePinCode } from "./membership.generator";

const mandatoryProfileFields = [
  "name",
  "phone",
  "gender",
  "dateOfBirth",
  "addressLine1",
  "alternatePhone",
];

export const getMembershipTiersService = async () => {
  return prisma.membershipTier.findMany({
    where: { active: true },
    orderBy: { minOrderAmount: "asc" },
  });
};

export const createMembershipTierService = async (data: any) => {
  return prisma.membershipTier.create({
    data: {
      name: data.name,
      minOrderAmount: Number(data.minOrderAmount),
      discountPercent: Number(data.discountPercent || 0),
      active: data.active ?? true,
      sortOrder: Number(data.sortOrder || 0),
    },
  });
};

export const getMembershipRecommendationService = async (
  cartAmount: number,
) => {
  const tiers = await prisma.membershipTier.findMany({
    where: { active: true },
    orderBy: { minOrderAmount: "asc" },
  });

  const achieved = tiers
    .filter((tier) => cartAmount >= tier.minOrderAmount)
    .pop();

  if (achieved) {
    return {
      qualified: true,
      tier: achieved,
      message: `Congratulations! You got ${achieved.name} Membership Card.`,
    };
  }

  const nextTier = tiers.find((tier) => cartAmount < tier.minOrderAmount);

  if (!nextTier) {
    return {
      qualified: false,
      tier: null,
      message: "No membership tier available.",
    };
  }

  const needAmount = nextTier.minOrderAmount - cartAmount;

  return {
    qualified: false,
    tier: nextTier,
    needAmount,
    message: `Buy more Tk ${needAmount} to get ${nextTier.name} Card.`,
  };
};

export const checkProfileCompleteService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return {
      complete: false,
      missing: ["user"],
      // Added empty fallbacks to prevent errors if profile details are destructured below
      name: null,
      phone: null,
      alternatePhone: null,
    };
  }

  const missing = mandatoryProfileFields.filter((field) => {
    return !(user as any)[field];
  });

  return {
    complete: missing.length === 0,
    missing,
    name: user.name,
    phone: user.phone,
    alternatePhone: (user as any).alternatePhone, // casting if necessary
  };
};

/* ========================================================
   UPDATED CLAIM CREATE SERVICE
   ======================================================== */
export const createMembershipClaimService = async (
  userId: string,
  payload: { invoiceAmount: number; orderId?: string },
) => {
  const profile = await checkProfileCompleteService(userId);

  if (!profile.complete) {
    return {
      success: false,
      needProfile: true,
      missing: profile.missing,
      message: "Complete your profile before claiming membership card.",
    };
  }

  const tier = await prisma.membershipTier.findFirst({
    where: {
      active: true,
      minOrderAmount: {
        lte: payload.invoiceAmount,
      },
    },
    orderBy: {
      minOrderAmount: "desc",
    },
  });

  if (!tier) {
    return {
      success: false,
      message: "Invoice amount is not eligible for membership.",
    };
  }

  const claim = await prisma.membershipClaim.create({
    data: {
      userId,
      tierId: tier.id,
      orderId: payload.orderId || null,
      invoiceAmount: payload.invoiceAmount,
      customerName: profile?.name,
      customerPhone: profile?.phone,
      customerWhatsapp: profile?.alternatePhone,
      profileSnapshot: profile as any, // Cast if your prisma json schema type dictates it
      status: "PENDING",
    },
  });

  return {
    success: true,
    data: claim,
  };
};

export const getMembershipClaimsService = async () => {
  return prisma.membershipClaim.findMany({
    orderBy: { createdAt: "desc" },
    include: { tier: true },
  });
};

export const getMembershipCardsService = async () => {
  return prisma.membershipCard.findMany({
    orderBy: { createdAt: "desc" },
    include: { tier: true },
  });
};

const createUniqueCardNumber = async () => {
  for (let i = 0; i < 20; i++) {
    const cardNumber = generateCardNumber();

    const exists = await prisma.membershipCard.findUnique({
      where: { cardNumber },
    });

    if (!exists) return cardNumber;
  }

  throw new Error("Failed to generate unique card number");
};

export const issueMembershipCardService = async (
  claimId: string,
  whatsapp?: string,
) => {
  const claim = await prisma.membershipClaim.findUnique({
    where: { id: claimId },
    include: { tier: true },
  });

  if (!claim) {
    throw new Error("Claim not found");
  }

  if (claim.status !== "PENDING") {
    throw new Error("Claim already processed");
  }

  const cardNumber = await createUniqueCardNumber();
  const pinCode = generatePinCode();

  const card = await prisma.membershipCard.create({
    data: {
      cardNumber,
      pinCode,
      tierId: claim.tierId,
      assignedUserId: claim.userId,
      status: "ISSUED",
      sentToWhatsapp: whatsapp || null,
      sentAt: whatsapp ? new Date() : null,
    },
    include: {
      tier: true,
    },
  });

  await prisma.membershipClaim.update({
    where: { id: claimId },
    data: {
      status: "APPROVED",
      note: `Card issued: ${cardNumber}`,
    },
  });

  return {
    card,
    whatsappInstruction: `Welcome to SAQSOBUILD Membership. Card: ${card.cardNumber}. PIN: ${card.pinCode}. Login to your dashboard and activate your card.`,
    adminInstruction: `Login → Dashboard → Membership → Activate Card`,
  };
};

export const activateMembershipCardService = async (
  userId: string,
  cardNumber: string,
  pinCode: string,
) => {
  const card = await prisma.membershipCard.findUnique({
    where: { cardNumber },
    include: { tier: true },
  });

  if (!card) {
    throw new Error("Invalid card");
  }

  if (card.pinCode !== pinCode) {
    throw new Error("Invalid PIN");
  }

  if (card.status === "ACTIVE") {
    throw new Error("Card already activated");
  }

  if (card.assignedUserId && card.assignedUserId !== userId) {
    throw new Error("This card is assigned to another customer");
  }

  return prisma.membershipCard.update({
    where: { id: card.id },
    data: {
      assignedUserId: userId,
      status: "ACTIVE",
      activatedAt: new Date(),
    },
    include: {
      tier: true,
    },
  });
};

export const getMyMembershipService = async (userId: string) => {
  return prisma.membershipCard.findFirst({
    where: {
      assignedUserId: userId,
      status: "ACTIVE",
    },
    include: {
      tier: true,
    },
    orderBy: {
      activatedAt: "desc",
    },
  });
};
