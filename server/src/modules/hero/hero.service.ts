import prisma from "../../prisma/prisma";

/**
 * ================= CLEAN HELPERS =================
 */
const cleanString = (value: any) => {
  if (!value || value === "") return null;
  return value;
};

const cleanDate = (value: any) => {
  if (!value || value === "") return null;

  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * ================= CREATE HERO =================
 */
export const createHero = async (data: any) => {
  console.log("CREATE HERO DATA:", data);

  return prisma.hero.create({
    data: {
      title: data.title,

      subtitle: cleanString(data.subtitle),
      image: cleanString(data.image),
      video: cleanString(data.video),

      type: data.type || "slider",
      active: true,

      buttonText: cleanString(data.buttonText),
      buttonLink: cleanString(data.buttonLink),

      secondaryText: cleanString(data.secondaryText),
      secondaryLink: cleanString(data.secondaryLink),

      startDate: cleanDate(data.startDate),
      endDate: cleanDate(data.endDate),
    },
  });
};

/**
 * ================= GET HEROES =================
 */
export const getHeroes = async () => {
  const now = new Date();

  const heroes = await prisma.hero.findMany({
    where: {
      AND: [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
        {
          active: true,
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: heroes,
  };
};

/**
 * ================= GET HERO BY ID =================
 */
export const getHeroById = async (id: string) => {
  return prisma.hero.findUnique({
    where: { id },
  });
};

/**
 * ================= UPDATE HERO =================
 */
export const updateHero = async (id: string, data: any) => {
  return prisma.hero.update({
    where: { id },
    data: {
      title: data.title,

      subtitle: cleanString(data.subtitle),
      image: cleanString(data.image),
      video: cleanString(data.video),

      type: data.type,

      buttonText: cleanString(data.buttonText),
      buttonLink: cleanString(data.buttonLink),

      secondaryText: cleanString(data.secondaryText),
      secondaryLink: cleanString(data.secondaryLink),

      startDate: cleanDate(data.startDate),
      endDate: cleanDate(data.endDate),
    },
  });
};

/**
 * ================= DELETE HERO =================
 */
export const deleteHero = async (id: string) => {
  return prisma.hero.delete({
    where: { id },
  });
};

