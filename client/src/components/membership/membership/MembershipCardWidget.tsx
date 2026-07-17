"use client";

import { useState } from "react";
import { SaqsoButton, SaqsoCard } from "@/components/saqso";
import {
  activateMembershipCard,
  claimMembershipCard,
} from "@/services/membership.service";

export default function MembershipCardWidget({
  membership,
  recommendation,
  profile,
  onRefresh,
}: {
  membership: any;
  recommendation: any;
  profile: any;
  onRefresh: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [pinCode, setPinCode] = useState("");

  const profileComplete =
    profile?.name &&
    profile?.phone &&
    profile?.gender &&
    profile?.dateOfBirth &&
    profile?.addressLine1 &&
    profile?.alternatePhone;

  const claimCard = async () => {
    if (!profileComplete) {
      alert(
        "Complete your profile first: Name, Phone, WhatsApp, Gender, Date of Birth and Address."
      );
      return;
    }

    const invoiceAmount = Number(
      prompt("Enter eligible invoice amount")
    );

    if (!invoiceAmount) return;

    const res = await claimMembershipCard({
      invoiceAmount,
    });

    alert(
      res.message ||
        "Membership claim submitted to admin"
    );

    onRefresh();
  };

  const activateCard = async () => {
    if (!cardNumber || !pinCode) {
      alert("Card number and PIN required");
      return;
    }

    const res = await activateMembershipCard({
      cardNumber,
      pinCode,
    });

    alert(
      res.success
        ? "Membership card activated"
        : res.message
    );

    onRefresh();
  };

  return (
    <SaqsoCard>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Membership
          </p>

          <h2 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">
            {membership
              ? `${membership.tier?.name} Member`
              : "No Active Card"}
          </h2>

          {membership ? (
            <div className="mt-4 space-y-2 text-sm text-zinc-500">
              <p>Card: {membership.cardNumber}</p>
              <p>Status: {membership.status}</p>
              <p>
                Discount:{" "}
                {membership.tier?.discountPercent || 0}%
              </p>
            </div>
          ) : (
            <p className="mt-3 text-zinc-500">
              Activate your membership card to get instant discount on non-discounted products.
            </p>
          )}
        </div>

        {!membership && (
          <div className="w-full max-w-sm space-y-3">
            <input
              value={cardNumber}
              onChange={(e) =>
                setCardNumber(e.target.value)
              }
              placeholder="Card Number"
              className="w-full rounded-2xl border p-3 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <input
              value={pinCode}
              onChange={(e) =>
                setPinCode(e.target.value)
              }
              placeholder="PIN Code"
              className="w-full rounded-2xl border p-3 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <SaqsoButton onClick={activateCard}>
              Activate Card
            </SaqsoButton>
          </div>
        )}
      </div>

      {!membership && recommendation && (
        <div className="mt-6 rounded-3xl bg-zinc-950 p-5 text-white dark:bg-white dark:text-black">
          <p className="text-lg font-black">
            {recommendation.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {recommendation.qualified && (
              <SaqsoButton onClick={claimCard}>
                Claim Card
              </SaqsoButton>
            )}

            <SaqsoButton
              variant="secondary"
              onClick={() =>
                alert(
                  "Card Benefits: Instant discount on non-discounted products, rewards points, exclusive offers and member-only campaigns."
                )
              }
            >
              View Benefits
            </SaqsoButton>
          </div>
        </div>
      )}
    </SaqsoCard>
  );
}



