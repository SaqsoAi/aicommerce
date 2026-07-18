import prisma from "../../config/prisma";

export const getPermissionsService =
async () => {
  return prisma.permission.findMany({
    orderBy: {
      code: "asc",
    },
  });
};
