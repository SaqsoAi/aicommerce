import prisma from "../../config/prisma";

export const getVirtualMembershipCardService =
async (userId: string) => {

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
    return null;
  }

  return {
    id: card.id,
    cardNumber: card.cardNumber,
    tier: card.tier.name,
    discountPercent:
      card.tier.discountPercent,
    status: card.status,
    qrCodeUrl: card.qrCodeUrl,
    cardImageUrl: card.cardImageUrl,
    expiresAt: card.expiresAt,
    activatedAt: card.activatedAt,
  };
};

// PHASE 5.6 ENTERPRISE MEMBERSHIP GUARDS - START
function phase56AssertMembershipInvoiceThreshold(input: {
  invoiceAmount: unknown;
  thresholdAmount: unknown;
}): number {
  const invoiceAmount = Number(input.invoiceAmount);
  const thresholdAmount = Number(input.thresholdAmount);
  if (!Number.isFinite(invoiceAmount) || invoiceAmount < 0) {
    throw new Error("Invalid membership invoice amount");
  }
  if (!Number.isFinite(thresholdAmount) || thresholdAmount <= 0) {
    throw new Error("Invalid membership threshold amount");
  }
  return invoiceAmount >= thresholdAmount ? invoiceAmount : 0;
}

function phase56AssertMembershipActive(status: unknown): void {
  const value = String(status ?? "").toUpperCase();
  if (!["ACTIVE", "INACTIVE", "EXPIRED", "SUSPENDED", "TRUE", "FALSE"].includes(value)) {
    throw new Error("Invalid membership status");
  }
}

function phase56AssertMembershipServerGeneratedCard(cardNumber: unknown): void {
  if (cardNumber !== undefined && cardNumber !== null && String(cardNumber).trim().length > 0) {
    throw new Error("Membership card number must be server-generated");
  }
}
// PHASE 5.6 ENTERPRISE MEMBERSHIP GUARDS - END
