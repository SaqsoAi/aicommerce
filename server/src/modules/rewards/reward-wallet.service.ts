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

// PHASE 5.6 ENTERPRISE REWARD GUARDS - START
function phase56AssertRewardPoints(points: unknown): number {
  const value = Number(points);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error("Invalid reward points");
  }
  return Math.floor(value);
}

function phase56AssertRewardRedemption(input: {
  walletBalance: unknown;
  requestedPoints: unknown;
}): number {
  const walletBalance = phase56AssertRewardPoints(input.walletBalance);
  const requestedPoints = phase56AssertRewardPoints(input.requestedPoints);

  if (requestedPoints <= 0) {
    throw new Error("Reward redemption points must be greater than 0");
  }
  if (requestedPoints > walletBalance) {
    throw new Error("Reward redemption exceeds wallet balance");
  }

  return requestedPoints;
}

function phase56AssertRewardTransactionIdempotency(key: unknown): string {
  const value = String(key ?? "").trim();
  if (!value) {
    throw new Error("Reward transaction idempotency key is required");
  }
  return value;
}
// PHASE 5.6 ENTERPRISE REWARD GUARDS - END
