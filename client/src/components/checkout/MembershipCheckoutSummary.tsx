"use client";

import { useEffect, useMemo, useState } from "react";
import { calculateMembershipDiscount } from "@/services/membership.service";
import {
  getRewardRedemptionRules,
  getRewardWallet,
} from "@/services/reward.service";
import { getDiscountPolicy } from "@/services/discount-policy.service";
import { SaqsoCard } from "@/components/saqso";
import MembershipCartBanner from "@/components/membership/MembershipCartBanner";

type Props = {
  items: any[];
  selectedRewardRuleId?: string;
  setSelectedRewardRuleId?: (id: string) => void;
};

const isDiscountedItem = (item: any) => {
  return Boolean(item.discountPrice) || Number(item.originalPrice || 0) > Number(item.price || 0);
};

const itemTotal = (item: any) =>
  Number(item.price || 0) * Number(item.quantity || 1);

const isAllowedByScope = (scope: string, item: any) => {
  if (scope === "DISABLED") return false;
  if (scope === "ALL_PRODUCTS") return true;
  if (scope === "DISCOUNTED_ONLY") return isDiscountedItem(item);
  if (scope === "NON_DISCOUNTED_ONLY") return !isDiscountedItem(item);
  return true;
};

export default function MembershipCheckoutSummary({
  items,
  selectedRewardRuleId,
  setSelectedRewardRuleId,
}: Props) {
  const [membershipDiscountData, setMembershipDiscountData] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [rules, setRules] = useState<any[]>([]);
  const [policy, setPolicy] = useState<any>(null);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + itemTotal(item), 0);
  }, [items]);

  useEffect(() => {
    if (!items.length) return;

    calculateMembershipDiscount(items)
      .then((res) => setMembershipDiscountData(res.data))
      .catch(console.error);

    getRewardWallet()
      .then((res) => setWallet(res.data))
      .catch(console.error);

    getRewardRedemptionRules()
      .then((res) => setRules(res.data || []))
      .catch(console.error);

    getDiscountPolicy()
      .then((res) => setPolicy(res.data))
      .catch(console.error);
  }, [items]);

  const deliveryCharge = 100;

  const membershipEligibleSubtotal = useMemo(() => {
    const scope = policy?.membershipDiscountScope || "NON_DISCOUNTED_ONLY";

    return items
      .filter((item) => isAllowedByScope(scope, item))
      .reduce((sum, item) => sum + itemTotal(item), 0);
  }, [items, policy]);

  const rewardEligibleSubtotal = useMemo(() => {
    const scope = policy?.rewardDiscountScope || "ALL_PRODUCTS";

    return items
      .filter((item) => isAllowedByScope(scope, item))
      .reduce((sum, item) => sum + itemTotal(item), 0);
  }, [items, policy]);

  const rawMembershipDiscount = Number(
    membershipDiscountData?.discountAmount || 0
  );

  const membershipDiscount =
    membershipEligibleSubtotal > 0 &&
    policy?.membershipDiscountScope !== "DISABLED"
      ? Math.min(rawMembershipDiscount, membershipEligibleSubtotal)
      : 0;

  const selectedReward = rules.find(
    (rule) => rule.id === selectedRewardRuleId
  );

  const canUseSelectedReward =
    selectedReward &&
    Number(wallet?.points || 0) >= Number(selectedReward.requiredPoints || 0) &&
    rewardEligibleSubtotal > 0 &&
    policy?.rewardDiscountScope !== "DISABLED";

  const rewardDiscount = canUseSelectedReward
    ? Math.min(
        Number(selectedReward.discountAmount || 0),
        rewardEligibleSubtotal
      )
    : 0;

  const allowTogether =
    policy?.allowMembershipRewardTogether !== false;

  let finalMembershipDiscount = membershipDiscount;
  let finalRewardDiscount = rewardDiscount;

  if (!allowTogether && membershipDiscount > 0 && rewardDiscount > 0) {
    const mode = policy?.conflictResolution || "HIGHEST_DISCOUNT";

    if (mode === "MEMBERSHIP_ONLY") {
      finalRewardDiscount = 0;
    }

    if (mode === "REWARD_ONLY") {
      finalMembershipDiscount = 0;
    }

    if (mode === "HIGHEST_DISCOUNT") {
      if (membershipDiscount >= rewardDiscount) {
        finalRewardDiscount = 0;
      } else {
        finalMembershipDiscount = 0;
      }
    }
  }

  const totalDiscount =
    finalMembershipDiscount + finalRewardDiscount;

  const finalTotal =
    subtotal - totalDiscount + deliveryCharge;

  return (
    <div className="space-y-5">
      <MembershipCartBanner cartAmount={subtotal} />

      <SaqsoCard>
        <h2 className="mb-5 text-2xl font-black text-zinc-950 dark:text-slate-950 dark:text-white">
          Checkout Savings
        </h2>

        <div className="space-y-3 text-sm sm:text-[15px]">
          <Row label="Subtotal" value={`Tk ${subtotal}`} />

          <Row
            label="Membership Eligible Amount"
            value={`Tk ${membershipEligibleSubtotal}`}
          />

          <Row
            label="Membership Discount"
            value={`- Tk ${finalMembershipDiscount}`}
          />

          <Row
            label="Reward Eligible Amount"
            value={`Tk ${rewardEligibleSubtotal}`}
          />

          <Row
            label="Reward Discount"
            value={`- Tk ${finalRewardDiscount}`}
          />

          <Row label="Delivery" value={`Tk ${deliveryCharge}`} />

          <div className="border-t pt-3 dark:border-zinc-800">
            <Row label="Final Total" value={`Tk ${finalTotal}`} strong />
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-zinc-100 p-5 sm:p-6 dark:bg-zinc-900">
          <p className="font-bold text-zinc-950 dark:text-slate-950 dark:text-white">
            Reward Points
          </p>

          <p className="mt-1 text-sm sm:text-[15px] text-zinc-500">
            Available: {wallet?.points || 0} points
          </p>

          <select
            value={selectedRewardRuleId || ""}
            onChange={(e) => setSelectedRewardRuleId?.(e.target.value)}
            className="mt-4 w-full rounded-2xl border border-zinc-200 bg-white p-3 text-sm sm:text-[15px] dark:border-zinc-800 dark:bg-zinc-950"
          >
            <option value="">Do not redeem points</option>

            {rules.map((rule) => (
              <option
                key={rule.id}
                value={rule.id}
                disabled={Number(wallet?.points || 0) < Number(rule.requiredPoints)}
              >
                {rule.title} — {rule.requiredPoints} points
              </option>
            ))}
          </select>

          {policy ? (
            <div className="mt-4 rounded-2xl border border-zinc-200 p-5 sm:p-6 text-xs text-zinc-500 dark:border-zinc-800">
              <p>
                Membership applies: <b>{policy.membershipDiscountScope}</b>
              </p>
              <p>
                Reward applies: <b>{policy.rewardDiscountScope}</b>
              </p>
              <p>
                Together allowed:{" "}
                <b>{policy.allowMembershipRewardTogether ? "YES" : "NO"}</b>
              </p>
            </div>
          ) : null}
        </div>
      </SaqsoCard>
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5 sm:gap-6 sm:p-5">
      <span className="text-zinc-500">{label}</span>

      <span
        className={
          strong
            ? "text-xl font-black text-zinc-950 dark:text-slate-950 dark:text-white"
            : "font-bold text-zinc-950 dark:text-slate-950 dark:text-white"
        }
      >
        {value}
      </span>
    </div>
  );
}


