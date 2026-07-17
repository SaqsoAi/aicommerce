import prisma from "../../config/prisma";

export const getRolesService = async () => {
  return prisma.role.findMany({
    include: {
      permissions: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};
