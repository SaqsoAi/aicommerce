import prisma from '../../config/prisma';
import crypto from "crypto";

const singletonKey = 'main';

export const getStoreSettingsService =
  async () => {
    return prisma.storeSetting.upsert({
      where: { singletonKey },
      update: {},
       create: {
        id: crypto.randomUUID(),
        
        singletonKey,

        storeName: 'AI Commerce',

        storeTagline:
          'AI Powered Ecommerce',

        footerText:
          '© AI Commerce. All rights reserved.',
          updatedAt: new Date(),
      },
    });
  };

export const updateStoreSettingsService =
  async (data: any) => {
    return prisma.storeSetting.upsert({
      where: { singletonKey },
      update: {
        storeName: data.storeName ?? undefined,
        storeTagline: data.storeTagline ?? undefined,
        logoUrl: data.logoUrl ?? undefined,
        faviconUrl: data.faviconUrl ?? undefined,

        primaryColor: data.primaryColor ?? undefined,
        secondaryColor: data.secondaryColor ?? undefined,

        phone: data.phone ?? undefined,
        email: data.email ?? undefined,
        address: data.address ?? undefined,

        aboutTitle: data.aboutTitle ?? undefined,
        aboutText: data.aboutText ?? undefined,
        footerText: data.footerText ?? undefined,

        facebookUrl: data.facebookUrl ?? undefined,
        instagramUrl: data.instagramUrl ?? undefined,
        tiktokUrl: data.tiktokUrl ?? undefined,
        youtubeUrl: data.youtubeUrl ?? undefined,

        themeMode: data.themeMode ?? undefined,

        headerStyle: data.headerStyle ?? undefined,

        heroStyle: data.heroStyle ?? undefined,

        buttonStyle: data.buttonStyle ?? undefined,

        footerStyle: data.footerStyle ?? undefined,

        activeTemplate:
          data.activeTemplate ?? undefined,
      },
      create: {
        id: crypto.randomUUID(),
        
        singletonKey: "STORE_SETTINGS",
        
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
        
        facebookUrl: data.facebookUrl,
        
        instagramUrl: data.instagramUrl,
        
        linkedinUrl: data.linkedinUrl,
        
        twitterUrl: data.twitterUrl,
        
        youtubeUrl: data.youtubeUrl,
        
        updatedAt: new Date(),
      },
    });
  };


