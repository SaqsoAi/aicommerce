import prisma from "../../config/prisma";

export const getSocialFeedSettingsService = async () => {
  return prisma.homepageSocialFeedSetting.upsert({
    where: {
      singletonKey: "main",
    },
    update: {},
    create: {
      singletonKey: "main",
      facebookEnabled: true,
      instagramEnabled: true,
      displayMode: "GRID",
      maxItems: 8,
      active: true,
    },
  });
};

export const updateSocialFeedSettingsService = async (data: any) => {
  const updateData: any = {};

  if (data.facebookEnabled !== undefined) {
    updateData.facebookEnabled = Boolean(data.facebookEnabled);
  }

  if (data.instagramEnabled !== undefined) {
    updateData.instagramEnabled = Boolean(data.instagramEnabled);
  }

  if (data.facebookPageUrl !== undefined) {
    updateData.facebookPageUrl = data.facebookPageUrl;
  }

  if (data.instagramUrl !== undefined) {
    updateData.instagramUrl = data.instagramUrl;
  }

  if (data.displayMode !== undefined) {
    updateData.displayMode = data.displayMode;
  }

  if (data.maxItems !== undefined) {
    updateData.maxItems = Number(data.maxItems);
  }

  if (data.active !== undefined) {
    updateData.active = Boolean(data.active);
  }

  return prisma.homepageSocialFeedSetting.upsert({
    where: {
      singletonKey: "main",
    },
    update: updateData,
    create: {
      singletonKey: "main",
      facebookEnabled: data.facebookEnabled ?? true,
      instagramEnabled: data.instagramEnabled ?? true,
      facebookPageUrl: data.facebookPageUrl || "",
      instagramUrl: data.instagramUrl || "",
      displayMode: data.displayMode || "GRID",
      maxItems: Number(data.maxItems || 8),
      active: data.active ?? true,
    },
  });
};
