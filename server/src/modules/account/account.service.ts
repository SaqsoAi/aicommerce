import prisma from "../../config/prisma";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar: true,
  role: true,
  createdAt: true,

  firstName: true,
  lastName: true,
  dateOfBirth: true,
  gender: true,
  bio: true,
  alternatePhone: true,

  country: true,
  state: true,
  city: true,
  postalCode: true,
  addressLine1: true,
  addressLine2: true,

  facebookUrl: true,
  instagramUrl: true,
  twitterUrl: true,
  linkedinUrl: true,
  youtubeUrl: true,
  tiktokUrl: true,
  websiteUrl: true,

  preferredLanguage: true,
  preferredCurrency: true,
  themeMode: true,

  marketingOptIn: true,
  smsOptIn: true,
  emailOptIn: true,
};

export const getProfileService =
  async (userId: string) => {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: profileSelect,
    });
  };

export const updateProfileService =
  async (
    userId: string,
    data: any
  ) => {
    const updateData: any = {};

    const allowedFields = [
      "name",
      "phone",
      "avatar",

      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
      "bio",
      "alternatePhone",

      "country",
      "state",
      "city",
      "postalCode",
      "addressLine1",
      "addressLine2",

      "facebookUrl",
      "instagramUrl",
      "twitterUrl",
      "linkedinUrl",
      "youtubeUrl",
      "tiktokUrl",
      "websiteUrl",

      "preferredLanguage",
      "preferredCurrency",
      "themeMode",

      "marketingOptIn",
      "smsOptIn",
      "emailOptIn",
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === "dateOfBirth" && data[field]) {
          updateData[field] = new Date(data[field]);
        } else {
          updateData[field] = data[field];
        }
      }
    }

    return prisma.user.update({
      where: {
        id: userId,
      },
      data: updateData,
      select: profileSelect,
    });
  };

export const getUserOrdersService =
  async (userId: string) => {
    return prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  };

export const getUserWishlistService =
  async (userId: string) => {
    return prisma.wishlist.findMany({
      where: {
        userId,
      },
      include: {
        product: true,
      },
    });
  };
