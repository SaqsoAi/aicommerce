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
