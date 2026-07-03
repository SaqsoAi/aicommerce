import prisma from "../../config/prisma";
import type {
  FitReviewInput,
  SizeFitCenterSettingsInput,
} from "./size-fit-center.types";

const defaultIncludeReview = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
    },
  },
};

function cleanUndefined(input: Record<string, unknown>) {
  const data: Record<string, unknown> = {};

  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      data[key] = value;
    }
  });

  return data;
}

export const sizeFitCenterService = {
  async getSettings() {
    const existing = await prisma.sizeFitCenterSettings.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) return existing;

    return prisma.sizeFitCenterSettings.create({
      data: {
        active: true,
        heroJson: {
          badge: "AI Powered Fit Center",
          title: "Find Your Perfect Fit",
          subtitle:
            "Smart size guide, real customer fit reviews, virtual try-on and expert measurement help in one place.",
        },
        statsJson: [],
        menuJson: [],
        layoutJson: {
          style: "enterprise",
          darkMode: true,
          lightMode: true,
        },
      },
    });
  },

  async updateSettings(input: SizeFitCenterSettingsInput) {
    const existing = await prisma.sizeFitCenterSettings.findFirst({
      where: { active: true },
      orderBy: { updatedAt: "desc" },
    });

    const data = cleanUndefined(input as Record<string, unknown>);

    if (existing) {
      return prisma.sizeFitCenterSettings.update({
        where: { id: existing.id },
        data,
      });
    }

    return prisma.sizeFitCenterSettings.create({
      data: {
        ...data,
        active: input.active ?? true,
      },
    });
  },

  async getApprovedReviews() {
    return prisma.review.findMany({
      where: {
        isApproved: true,
      },
      orderBy: [
        {
          isFeatured: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      include: defaultIncludeReview,
      take: 24,
    });
  },

  async getAdminReviews() {
    return prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: defaultIncludeReview,
      take: 100,
    });
  },

  async submitReview(input: FitReviewInput) {
    const verifiedPurchase = await prisma.order.findFirst({
      where: {
        userId: input.userId,
        status: {
          in: ["DELIVERED"],
        },
        items: {
          some: {
            productId: input.productId,
          },
        },
      },
    });

    return prisma.review.create({
      data: {
        rating: input.rating,
        comment: input.comment ?? null,
        productId: input.productId,
        userId: input.userId,
        fitRating: input.fitRating ?? null,
        bodyType: input.bodyType ?? null,
        heightCm: input.heightCm ?? null,
        weightKg: input.weightKg ?? null,
        sizeOrdered: input.sizeOrdered ?? null,
        
        verifiedPurchase: Boolean(verifiedPurchase),
        isApproved: false,
        isFeatured: false,
      },
      include: defaultIncludeReview,
    });
  },

  async approveReview(id: string, value = true) {
    return prisma.review.update({
      where: { id },
      data: {
        isApproved: value,
      },
      include: defaultIncludeReview,
    });
  },

  async featureReview(id: string, value = true) {
    return prisma.review.update({
      where: { id },
      data: {
        isFeatured: value,
      },
      include: defaultIncludeReview,
    });
  },
};


