import prisma from "../../config/prisma";

export const getAuditLogs =
  async () => {
    return prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc",
      },

      take: 100,
    });
  };
