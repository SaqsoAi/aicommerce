import prisma from "../../config/prisma";

type SaveLookPayload = {
  name?: string | undefined;
  notes?: string | undefined;
};

const cleanPayload = (payload: SaveLookPayload) => {
  const data: {
    name?: string;
    notes?: string;
  } = {};

  if (typeof payload.name === "string") {
    data.name = payload.name;
  }

  if (typeof payload.notes === "string") {
    data.notes = payload.notes;
  }

  return data;
};

export const saveLook = async (
  userId: string,
  lookbookId: string,
  payload: SaveLookPayload
) => {
  const lookbook = await prisma.lookbook.findUnique({
    where: {
      id: lookbookId,
    },
  });

  if (!lookbook) {
    throw new Error("Lookbook not found");
  }

  const data = cleanPayload(payload);

  return prisma.savedLook.upsert({
    where: {
      userId_lookbookId: {
        userId,
        lookbookId,
      },
    },
    update: data,
    create: {
      userId,
      lookbookId,
      ...data,
    },
    include: {
      lookbook: {
        include: {
          items: {
            orderBy: {
              sortOrder: "asc",
            },
            include: {
              products: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getMySavedLooks = async (userId: string) => {
  return prisma.savedLook.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      lookbook: {
        include: {
          items: {
            take: 3,
            orderBy: {
              sortOrder: "asc",
            },
            include: {
              products: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const removeSavedLook = async (
  userId: string,
  lookbookId: string
) => {
  return prisma.savedLook.delete({
    where: {
      userId_lookbookId: {
        userId,
        lookbookId,
      },
    },
  });
};
