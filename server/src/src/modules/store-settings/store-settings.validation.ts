import { z } from 'zod';

export const storeSettingsSchema =
  z.object({
    storeName: z.string().min(2).optional(),
    storeTagline: z.string().optional(),
    logoUrl: z.string().optional(),
    faviconUrl: z.string().optional(),

    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),

    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),

    aboutTitle: z.string().optional(),
    aboutText: z.string().optional(),
    footerText: z.string().optional(),

    facebookUrl: z.string().optional(),
    instagramUrl: z.string().optional(),
    tiktokUrl: z.string().optional(),
    youtubeUrl: z.string().optional(),
  });

