"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
  getRewardHistory,
  getRewardRedemptionRules,
  getRewardWallet,
  redeemReward,
} from "@/services/reward.service";

const pointValue = (points: number) => Math.floor(points / 10);

export default function CustomerRewardsPage() {
  const { user } = useAuth();

  const [wallet, setWallet] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [walletRes, ruleRes] = await Promise.all([
        getRewardWallet(),
        getRewardRedemptionRules(),
      ]);

      setWallet(walletRes.data || null);
      setRules(ruleRes.data || []);

      if (user?.id) {
        const historyRes = await getRewardHistory(user.id);
        setHistory(historyRes.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user?.id]);

  const availablePoints = Number(wallet?.points || 0);

  const nextReward = useMemo(() => {
    return rules.find(
      (rule) => Number(rule.requiredPoints) > availablePoints
    );
  }, [rules, availablePoints]);

  const progress = nextReward
    ? Math.min(
        100,
        Math.round(
          (availablePoints / Number(nextReward.requiredPoints)) * 100
        )
      )
    : 100;

  const vipStatus =
    availablePoints >= 20000
      ? "VIP"
      : availablePoints >= 10000
        ? "Gold"
        : availablePoints >= 5000
          ? "Silver"
          : "Regular";

  const handleRedeem = async (ruleId: string) => {
    if (!confirm("Redeem this reward?")) return;

    const res = await redeemReward(ruleId);

    if (!res.success) {
      alert(res.message || "Redeem failed");
      return;
    }

    alert("Reward redeemed successfully");
    await loadData();
  };

  return (
    <main className="min-min-min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-5 py-8 sm:px-8 lg:px-4 sm:px-6 lg:px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
              Customer Rewards
            </p>
            <h1 className="mt-2 text-2xl sm:text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl lg:text-2xl sm:text-xl sm:text-2xl lg:text-3xl lg:text-4xl font-black md:text-6xl">
              Rewards Wallet
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-500">
              Earn points from shopping, reviews, profile completion, referrals and redeem them for coupons, shipping, VIP status and gifts.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-black dark:border-zinc-800"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Available Points" value={availablePoints.toLocaleString()} />
          <StatCard label="Point Value" value={`Tk ${pointValue(availablePoints)}`} />
          <StatCard label="Lifetime Earned" value={Number(wallet?.lifetimeEarned || 0).toLocaleString()} />
          <StatCard label="Lifetime Used" value={Number(wallet?.lifetimeUsed || 0).toLocaleString()} />
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-hidden rounded-[2rem] bg-black text-white shadow-2xl">
            <div className="p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.35em] text-yellow-300">
                SAQSO Reward Card
              </p>

              <div className="mt-8 flex flex-col justify-between gap-8 md:flex-row">
                <div>
                  <p className="text-sm text-white/60">Wallet Holder</p>
                  <h2 className="mt-1 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">
                    {user?.name || user?.email || "Customer"}
                  </h2>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-sm text-white/60">Status</p>
                  <h3 className="mt-1 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">{vipStatus}</h3>
                </div>
              </div>

              <div className="mt-10">
                <p className="text-sm text-white/60">Available Balance</p>
                <h3 className="mt-2 text-6xl font-black">
                  {availablePoints}
                </h3>
                <p className="mt-2 text-white/60">
                  10 Points = Tk 1 value
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
              Next Reward
            </p>

            {nextReward ? (
              <>
                <h2 className="mt-3 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">
                  {nextReward.title}
                </h2>

                <p className="mt-3 text-zinc-500">
                  Need{" "}
                  {Number(nextReward.requiredPoints) - availablePoints} more
                  points to unlock this reward.
                </p>

                <div className="mt-6 h-4 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-black dark:bg-white"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="mt-3 text-sm font-bold">
                  {progress}% completed
                </p>
              </>
            ) : (
              <p className="mt-3 text-zinc-500">
                You can unlock all listed rewards.
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-zinc-500">
              Redeem Rewards
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">
              Available reward options
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 sm:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => {
              const locked = availablePoints < Number(rule.requiredPoints);

              return (
                <div
                  key={rule.id}
                  className="rounded-3xl border border-zinc-200 p-5 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">{rule.title}</h3>
                      <p className="mt-1 text-sm text-zinc-500">
                        {rule.requiredPoints} Points · {rule.rewardType}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        locked
                          ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {locked ? "Locked" : "Ready"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRedeem(rule.id)}
                    disabled={locked}
                    className="mt-5 w-full rounded-2xl bg-black py-3 text-sm font-black text-white disabled:opacity-40 dark:bg-white dark:text-black"
                  >
                    Redeem Now
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="overflow-x-auto max-w-full max-w-full rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Reward History</h2>
          </div>

          <table className="w-full min-w-0 text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Points</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{item.type}</td>
                  <td className="p-4">{item.points}</td>
                  <td className="p-4">{item.reason}</td>
                  <td className="p-4">{item.balanceAfter ?? "-"}</td>
                  <td className="p-4">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {!history.length && !loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500">
                    No reward history yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-3xl font-black">{value}</p>
    </div>
  );
}


