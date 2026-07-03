import prisma from "../../config/prisma";
import { LandingPageInput, LandingSectionInput } from "./landing.types";

const includeFullLanding = {
  sections: {
    orderBy: {
      sortOrder: "asc" as const,
    },
  },
  publishHistory: {
    orderBy: {
      createdAt: "desc" as const,
    },
  },
};

const normalizeSections = (sections: LandingSectionInput[] = []) => {
  return sections.map((section, index) => ({
    type: section.type,
    title: section.title ?? null,
    subtitle: section.subtitle ?? null,
    sortOrder: section.sortOrder ?? index,
    configJson: section.configJson as any ?? {},
  }));
};

export const landingService = {
  async list() {
    return prisma.landingPage.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sections: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  },

  async getById(id: string) {
    return prisma.landingPage.findUnique({
      where: { id },
      include: includeFullLanding,
    });
  },

  async getBySlug(slug: string) {
    return prisma.landingPage.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  },

  async create(input: LandingPageInput) {
    return prisma.landingPage.create({
      data: {
        name: input.name,
        slug: input.slug,
        campaignId: input.campaignId ?? null,
        title: input.title,
        description: input.description ?? null,
        seoTitle: input.seoTitle ?? null,
        seoDescription: input.seoDescription ?? null,
        seoKeywords: input.seoKeywords ?? null,
        template: input.template ?? "fashion",
        status: "DRAFT",
        isPublished: false,
        sections: {
          create: normalizeSections(input.sections),
        },
      },
      include: includeFullLanding,
    });
  },

  async update(id: string, input: Partial<LandingPageInput>) {
    return prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};

      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.campaignId !== undefined) updateData.campaignId = input.campaignId;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.seoTitle !== undefined) updateData.seoTitle = input.seoTitle;
      if (input.seoDescription !== undefined) updateData.seoDescription = input.seoDescription;
      if (input.seoKeywords !== undefined) updateData.seoKeywords = input.seoKeywords;
      if (input.template !== undefined) updateData.template = input.template;

      const landing = await tx.landingPage.update({
        where: { id },
        data: updateData,
      });

      if (Array.isArray(input.sections)) {
        await tx.landingSection.deleteMany({
          where: { landingPageId: id },
        });

        if (input.sections.length > 0) {
          await tx.landingSection.createMany({
            data: normalizeSections(input.sections).map((section) => ({
              ...section,
              landingPageId: id,
            })),
          });
        }
      }

      return tx.landingPage.findUnique({
        where: { id: landing.id },
        include: includeFullLanding,
      });
    });
  },

  async remove(id: string) {
    return prisma.landingPage.delete({
      where: { id },
    });
  },

  async publish(id: string, publishedBy?: string | null, note?: string | null) {
    return prisma.$transaction(async (tx) => {
      const landing = await tx.landingPage.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          isPublished: true,
          publishedAt: new Date(),
        },
        include: includeFullLanding,
      });

      await tx.landingPublishHistory.create({
        data: {
          landingPageId: id,
          publishedBy: publishedBy ?? null,
          action: "PUBLISH",
          note: note ?? null,
        },
      });

      return landing;
    });
  },

  async unpublish(id: string, publishedBy?: string | null, note?: string | null) {
    return prisma.$transaction(async (tx) => {
      const landing = await tx.landingPage.update({
        where: { id },
        data: {
          status: "UNPUBLISHED",
          isPublished: false,
        },
        include: includeFullLanding,
      });

      await tx.landingPublishHistory.create({
        data: {
          landingPageId: id,
          publishedBy: publishedBy ?? null,
          action: "UNPUBLISH",
          note: note ?? null,
        },
      });

      return landing;
    });
  },
};



