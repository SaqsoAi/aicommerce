import prisma from "../../config/prisma";

export type HeroScope = {
  tenantId: string;
  storeId: string;
};

/**
 * Compatibility hotfix:
 * HomepageHeroContent does not currently contain tenantId/storeId fields.
 * Keep the scoped service signatures required by the controller, but do not
 * issue invalid Prisma filters or writes until the schema change is applied
 * through the approved database PowerShell package.
 */
export const getHeroesService = async (_scope?: HeroScope) => {
  return prisma.homepageHeroContent.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const createHeroService = async (
  _scope: HeroScope,
  data: any
) => {
  return prisma.homepageHeroContent.create({
    data: {
      type: data.type || "image",
      src: data.src,
      alt: data.alt || "",
      headline: data.headline || "",
      subheadline: data.subheadline || "",
      primaryCtaLabel: data.primaryCtaLabel || "",
      primaryCtaLink: data.primaryCtaLink || "",
      secondaryCtaLabel: data.secondaryCtaLabel || "",
      secondaryCtaLink: data.secondaryCtaLink || "",
      sliderEffect: data.sliderEffect || "fade",
      cropMode: data.cropMode || "SYSTEM",
      qualityMode: data.qualityMode || "4K",
      desktopSrc: data.desktopSrc || "",
      tabletSrc: data.tabletSrc || "",
      mobileSrc: data.mobileSrc || "",
      active: Boolean(data.active ?? true),
      sortOrder: Number(data.sortOrder ?? 0),
    },
  });
};

export const updateHeroService = async (
  _scope: HeroScope,
  id: string,
  data: any
) => {
  return prisma.homepageHeroContent.update({
    where: { id },
    data: {
      type: data.type,
      src: data.src,
      alt: data.alt,
      headline: data.headline,
      subheadline: data.subheadline,
      primaryCtaLabel: data.primaryCtaLabel,
      primaryCtaLink: data.primaryCtaLink,
      secondaryCtaLabel: data.secondaryCtaLabel,
      secondaryCtaLink: data.secondaryCtaLink,
      sliderEffect: data.sliderEffect,
      cropMode: data.cropMode,
      qualityMode: data.qualityMode,
      desktopSrc: data.desktopSrc,
      tabletSrc: data.tabletSrc,
      mobileSrc: data.mobileSrc,
      active: data.active,
      sortOrder:
        data.sortOrder === undefined
          ? undefined
          : Number(data.sortOrder),
    },
  });
};

export const deleteHeroService = async (
  _scope: HeroScope,
  id: string
) => {
  return prisma.homepageHeroContent.delete({
    where: { id },
  });
};
