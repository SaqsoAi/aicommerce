"use client";

import { SaqsoButton, SaqsoCard } from "@/components/saqso";
import { redeemReward } from "@/services/reward.service";

export default function RewardWalletWidget({
  wallet,
  redemptionRules,
  onRefresh,
}: {
  wallet: any;
  redemptionRules: any[];
  onRefresh: () => void;
}) {
  const redeem = async (ruleId: string) => {
    const res = await redeemReward(ruleId);

    alert(
      res.success
        ? "Reward redeemed"
        : res.message
    );

    onRefresh();
  };

  return (
    <SaqsoCard>
      <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
        Rewards
      </p>

      <h2 className="mt-2 text-4xl font-black text-zinc-950 dark:text-white">
        {wallet?.points || 0} Points
      </h2>

      <p className="mt-2 text-zinc-500">
        Use your points at checkout for free delivery or discounts.
      </p>

      <div className="mt-6 space-y-3">
        {redemptionRules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between rounded-2xl border p-4 dark:border-zinc-800"
          >
            <div>
              <p className="font-bold text-zinc-950 dark:text-white">
                {rule.title}
              </p>
              <p className="text-sm text-zinc-500">
                Required: {rule.requiredPoints} points
              </p>
            </div>

            <SaqsoButton
              variant="secondary"
              onClick={() => redeem(rule.id)}
            >
              Redeem
            </SaqsoButton>
          </div>
        ))}
      </div>
    </SaqsoCard>
  );
}



