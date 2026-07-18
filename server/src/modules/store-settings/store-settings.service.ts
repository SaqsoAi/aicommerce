import crypto from "crypto";
import prisma from "../../config/prisma";

export type StoreSettingsScope = {
  tenantId: string;
  storeId: string;
};

export type StoreSettingsInput = {
  storeName?: string;
  storeTagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  aboutTitle?: string | null;
  aboutText?: string | null;
  footerText?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  themeMode?: string;
  headerStyle?: string;
  heroStyle?: string;
  buttonStyle?: string;
  footerStyle?: string;
  activeTemplate?: string;
};

function scopedKey(storeId: string): string {
  return `store:${storeId}`;
}

async function assertScope(scope: StoreSettingsScope): Promise<void> {
  const store = await prisma.store.findFirst({
    where: {
      id: scope.storeId,
      tenantId: scope.tenantId,
      status: "ACTIVE",
    },
    select: { id: true },
  });

  if (!store) {
    throw Object.assign(
      new Error("The authenticated store scope is invalid"),
      { statusCode: 403 },
    );
  }
}

export async function getStoreSettingsService(
  scope: StoreSettingsScope,
) {
  await assertScope(scope);

  const singletonKey = scopedKey(scope.storeId);

  return prisma.storeSetting.upsert({
    where: { singletonKey },
    update: {},
    create: {
      id: crypto.randomUUID(),
      singletonKey,
      storeName: "AI Commerce",
      storeTagline: "AI Powered Ecommerce",
      footerText: "© AI Commerce. All rights reserved.",
      updatedAt: new Date(),
    },
  });
}

export async function updateStoreSettingsService(
  scope: StoreSettingsScope,
  data: StoreSettingsInput,
) {
  await assertScope(scope);

  const singletonKey = scopedKey(scope.storeId);

  return prisma.storeSetting.upsert({
    where: { singletonKey },
    update: {
      storeName: data.storeName,
      storeTagline: data.storeTagline,
      logoUrl: data.logoUrl,
      faviconUrl: data.faviconUrl,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      phone: data.phone,
      email: data.email,
      address: data.address,
      aboutTitle: data.aboutTitle,
      aboutText: data.aboutText,
      footerText: data.footerText,
      facebookUrl: data.facebookUrl,
      instagramUrl: data.instagramUrl,
      tiktokUrl: data.tiktokUrl,
      youtubeUrl: data.youtubeUrl,
      themeMode: data.themeMode,
      headerStyle: data.headerStyle,
      heroStyle: data.heroStyle,
      buttonStyle: data.buttonStyle,
      footerStyle: data.footerStyle,
      activeTemplate: data.activeTemplate,
    },
    create: {
      id: crypto.randomUUID(),
      singletonKey,
      storeName: data.storeName || "AI Commerce",
      storeTagline: data.storeTagline,
      logoUrl: data.logoUrl,
      faviconUrl: data.faviconUrl,
      primaryColor: data.primaryColor || "#111827",
      secondaryColor: data.secondaryColor || "#6D28D9",
      phone: data.phone,
      email: data.email,
      address: data.address,
      aboutTitle: data.aboutTitle,
      aboutText: data.aboutText,
      footerText: data.footerText,
      facebookUrl: data.facebookUrl,
      instagramUrl: data.instagramUrl,
      tiktokUrl: data.tiktokUrl,
      youtubeUrl: data.youtubeUrl,
      themeMode: data.themeMode || "SYSTEM",
      headerStyle: data.headerStyle || "GLASS",
      heroStyle: data.heroStyle || "PREMIUM",
      buttonStyle: data.buttonStyle || "LUXURY",
      footerStyle: data.footerStyle || "PREMIUM",
      activeTemplate: data.activeTemplate || "saqsobuild",
      updatedAt: new Date(),
    },
  });
}
