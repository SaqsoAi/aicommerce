"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

import {
  adjustRewardWallet,
  createRewardPointRule,
  createRewardRedemptionRule,
  deleteRewardPointRule,
  deleteRewardRedemptionRule,
  getRewardPointRules,
  getRewardRedemptionRules,
  getRewardTransactions,
  getRewardWallets,
  toggleRewardPointRule,
  toggleRewardRedemptionRule,
  updateRewardPointRule,
  updateRewardRedemptionRule,
} from "@/services/reward.service";

const pointRuleTypes = [
  "SIGNUP",
  "PROFILE_COMPLETE",
  "FIRST_PURCHASE",
  "SPEND",
  "QUANTITY",
  "PRODUCT_REVIEW",
  "PRODUCT_RATING",
  "NEWSLETTER",
  "APP_DOWNLOAD",
  "DAILY_LOGIN",
  "BIRTHDAY",
  "REFERRAL",
  "REFERRAL_PURCHASE",
  "SOCIAL_FOLLOW",
  "SOCIAL_SHARE",
  "SURVEY",
];

const redemptionTypes = [
  "COUPON_AMOUNT",
  "COUPON_PERCENT",
  "FREE_DELIVERY",
  "VIP_STATUS",
  "GIFT_ITEM",
  "SHOPPING_VOUCHER",
];

const emptyPointForm = {
  title: "",
  ruleType: "SIGNUP",
  spendAmount: "",
  quantity: "",
  points: "",
  active: true,
};

const emptyRedeemForm = {
  title: "",
  requiredPoints: "",
  rewardType: "COUPON_AMOUNT",
  discountAmount: "",
  discountPercent: "",
  freeDelivery: false,
  active: true,
};

export default function RewardsPage() {
  const [pointRules, setPointRules] = useState<any[]>([]);
  const [redeemRules, setRedeemRules] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pointForm, setPointForm] = useState<any>(emptyPointForm);
  const [redeemForm, setRedeemForm] = useState<any>(emptyRedeemForm);
  const [editingPointId, setEditingPointId] = useState<string | null>(null);
  const [editingRedeemId, setEditingRedeemId] = useState<string | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    userId: "",
    points: "",
    reason: "",
  });

  const loadData = async () => {
    const [pointData, redeemData, walletData, transactionData] =
      await Promise.all([
        getRewardPointRules(),
        getRewardRedemptionRules(),
        getRewardWallets(),
        getRewardTransactions(),
      ]);

    setPointRules(pointData || []);
    setRedeemRules(redeemData || []);
    setWallets(walletData || []);
    setTransactions(transactionData || []);
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    return {
      activePointRules: pointRules.filter((item) => item.active).length,
      activeRedeemRules: redeemRules.filter((item) => item.active).length,
      totalWallets: wallets.length,
      totalPoints: wallets.reduce(
        (sum, item) => sum + Number(item.points || 0),
        0
      ),
    };
  }, [pointRules, redeemRules, wallets]);

  const savePointRule = async () => {
    if (!pointForm.title || !pointForm.points) return;

    if (editingPointId) {
      await updateRewardPointRule(editingPointId, pointForm);
    } else {
      await createRewardPointRule(pointForm);
    }

    setEditingPointId(null);
    setPointForm(emptyPointForm);
    await loadData();
  };

  const saveRedeemRule = async () => {
    if (!redeemForm.title || !redeemForm.requiredPoints) return;

    if (editingRedeemId) {
      await updateRewardRedemptionRule(editingRedeemId, redeemForm);
    } else {
      await createRewardRedemptionRule(redeemForm);
    }

    setEditingRedeemId(null);
    setRedeemForm(emptyRedeemForm);
    await loadData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
            Enterprise Rewards Engine
          </p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">
            Rewards & Points
          </h1>
          <p className="mt-2 text-zinc-500">
            Manage earning rules, redemption rules, customer wallets and reward history.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Active Earning Rules", stats.activePointRules],
            ["Active Redemption Rules", stats.activeRedeemRules],
            ["Reward Wallets", stats.totalWallets],
            ["Total Available Points", stats.totalPoints.toLocaleString()],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                {label}
              </p>
              <p className="mt-3 text-3xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-black">
            {editingPointId ? "Edit Earning Rule" : "Create Earning Rule"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <input
              placeholder="Title"
              value={pointForm.title}
              onChange={(e) =>
                setPointForm({ ...pointForm, title: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <select
              value={pointForm.ruleType}
              onChange={(e) =>
                setPointForm({ ...pointForm, ruleType: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {pointRuleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              placeholder="Spend Amount"
              value={pointForm.spendAmount}
              onChange={(e) =>
                setPointForm({ ...pointForm, spendAmount: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              placeholder="Quantity"
              value={pointForm.quantity}
              onChange={(e) =>
                setPointForm({ ...pointForm, quantity: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              placeholder="Points"
              value={pointForm.points}
              onChange={(e) =>
                setPointForm({ ...pointForm, points: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <button
              onClick={savePointRule}
              className="rounded-2xl bg-black px-5 py-4 font-black text-white dark:bg-white dark:text-black"
            >
              {editingPointId ? "Update" : "Add Rule"}
            </button>
          </div>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Earning Rules</h2>
          </div>

          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Spend</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Points</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {pointRules.map((rule) => (
                <tr key={rule.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{rule.title}</td>
                  <td className="p-4">{rule.ruleType}</td>
                  <td className="p-4">{rule.spendAmount || "-"}</td>
                  <td className="p-4">{rule.quantity || "-"}</td>
                  <td className="p-4">{rule.points}</td>
                  <td className="p-4">
                    {rule.active ? "Active" : "Disabled"}
                  </td>
                  <td className="space-x-2 p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingPointId(rule.id);
                        setPointForm({
                          title: rule.title,
                          ruleType: rule.ruleType,
                          spendAmount: rule.spendAmount || "",
                          quantity: rule.quantity || "",
                          points: rule.points || "",
                          active: rule.active,
                        });
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await toggleRewardPointRule(rule.id);
                        await loadData();
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this rule?")) return;
                        await deleteRewardPointRule(rule.id);
                        await loadData();
                      }}
                      className="rounded-xl bg-red-500 px-3 py-2 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-black">
            {editingRedeemId ? "Edit Redemption Rule" : "Create Redemption Rule"}
          </h2>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
            <input
              placeholder="Title"
              value={redeemForm.title}
              onChange={(e) =>
                setRedeemForm({ ...redeemForm, title: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              placeholder="Required Points"
              value={redeemForm.requiredPoints}
              onChange={(e) =>
                setRedeemForm({
                  ...redeemForm,
                  requiredPoints: e.target.value,
                })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <select
              value={redeemForm.rewardType}
              onChange={(e) =>
                setRedeemForm({ ...redeemForm, rewardType: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {redemptionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <input
              placeholder="Discount Amount"
              value={redeemForm.discountAmount}
              onChange={(e) =>
                setRedeemForm({
                  ...redeemForm,
                  discountAmount: e.target.value,
                })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <input
              placeholder="Discount Percent"
              value={redeemForm.discountPercent}
              onChange={(e) =>
                setRedeemForm({
                  ...redeemForm,
                  discountPercent: e.target.value,
                })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />

            <button
              onClick={saveRedeemRule}
              className="rounded-2xl bg-black px-5 py-4 font-black text-white dark:bg-white dark:text-black"
            >
              {editingRedeemId ? "Update" : "Add Rule"}
            </button>
          </div>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Redemption Rules</h2>
          </div>

          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Points</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Percent</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {redeemRules.map((rule) => (
                <tr key={rule.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{rule.title}</td>
                  <td className="p-4">{rule.requiredPoints}</td>
                  <td className="p-4">{rule.rewardType}</td>
                  <td className="p-4">{rule.discountAmount || "-"}</td>
                  <td className="p-4">{rule.discountPercent || "-"}</td>
                  <td className="p-4">
                    {rule.active ? "Active" : "Disabled"}
                  </td>
                  <td className="space-x-2 p-4 text-right">
                    <button
                      onClick={() => {
                        setEditingRedeemId(rule.id);
                        setRedeemForm({
                          title: rule.title,
                          requiredPoints: rule.requiredPoints || "",
                          rewardType: rule.rewardType,
                          discountAmount: rule.discountAmount || "",
                          discountPercent: rule.discountPercent || "",
                          freeDelivery: rule.freeDelivery,
                          active: rule.active,
                        });
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        await toggleRewardRedemptionRule(rule.id);
                        await loadData();
                      }}
                      className="rounded-xl border px-3 py-2"
                    >
                      Toggle
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this rule?")) return;
                        await deleteRewardRedemptionRule(rule.id);
                        await loadData();
                      }}
                      className="rounded-xl bg-red-500 px-3 py-2 text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-5 text-2xl font-black">Adjust Customer Wallet</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <input
              placeholder="User ID"
              value={adjustForm.userId}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, userId: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />
            <input
              placeholder="Points (+/-)"
              value={adjustForm.points}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, points: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />
            <input
              placeholder="Reason"
              value={adjustForm.reason}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, reason: e.target.value })
              }
              className="rounded-2xl border p-4 dark:border-zinc-800 dark:bg-zinc-900"
            />
            <button
              onClick={async () => {
                await adjustRewardWallet(adjustForm);
                setAdjustForm({ userId: "", points: "", reason: "" });
                await loadData();
              }}
              className="rounded-2xl bg-black px-5 py-4 font-black text-white dark:bg-white dark:text-black"
            >
              Adjust
            </button>
          </div>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Customer Wallets</h2>
          </div>

          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">User ID</th>
                <th className="p-4 text-left">Available</th>
                <th className="p-4 text-left">Lifetime Earned</th>
                <th className="p-4 text-left">Lifetime Used</th>
                <th className="p-4 text-left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{wallet.userId}</td>
                  <td className="p-4">{wallet.points}</td>
                  <td className="p-4">{wallet.lifetimeEarned}</td>
                  <td className="p-4">{wallet.lifetimeUsed}</td>
                  <td className="p-4">
                    {new Date(wallet.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="overflow-x-auto rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b p-5 dark:border-zinc-800">
            <h2 className="text-2xl font-black">Reward Transactions</h2>
          </div>

          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-900">
              <tr>
                <th className="p-4 text-left">User ID</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Points</th>
                <th className="p-4 text-left">Reason</th>
                <th className="p-4 text-left">Balance</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 100).map((item) => (
                <tr key={item.id} className="border-t dark:border-zinc-800">
                  <td className="p-4 font-bold">{item.userId}</td>
                  <td className="p-4">{item.type}</td>
                  <td className="p-4">{item.points}</td>
                  <td className="p-4">{item.reason}</td>
                  <td className="p-4">{item.balanceAfter ?? "-"}</td>
                  <td className="p-4">
                    {new Date(item.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </DashboardLayout>
  );
}
