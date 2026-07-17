import prisma from "../../config/prisma";

export const getHeroesService = async () => {
  return prisma.homepageHeroContent.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const createHeroService = async (data: any) => {
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
      sortOrder: Number(data.sortOrder ?? 0),
    },
  });
};

export const deleteHeroService = async (id: string) => {
  return prisma.homepageHeroContent.delete({
    where: { id },
  });
};
