import prisma from "../../config/prisma";

export const getRewardWalletHistoryService =
async (userId: string) => {

  const wallet =
    await prisma.rewardWallet.findFirst({
      where: {
        userId,
      },
    });

  const history =
    await prisma.rewardTransaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return {
    wallet,
    history,
  };
};
