"use client";

import { useEffect, useState } from "react";
import { getMembershipCartRecommendation } from "@/services/membership.service";
import { SaqsoButton, SaqsoCard } from "@/components/saqso";

export default function MembershipCartBanner({
  cartAmount,
  onClaim,
}: {
  cartAmount: number;
  onClaim?: () => void;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!cartAmount) return;

    getMembershipCartRecommendation(cartAmount)
      .then((res) => setData(res.data))
      .catch(console.error);
  }, [cartAmount]);

  if (!data?.showBanner && !data?.qualified) {
    return null;
  }

  return (
    <SaqsoCard className="border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-950/30">
      <p className="text-sm uppercase tracking-[0.25em] text-amber-600 dark:text-amber-300">
        Membership Opportunity
      </p>

      <h3 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
        {data.message}
      </h3>

      {data.needAmount && (
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          Add products worth Tk {data.needAmount} more to unlock this card.
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        {data.qualified && (
          <SaqsoButton onClick={onClaim}>
            Claim Card
          </SaqsoButton>
        )}

        <SaqsoButton
          variant="secondary"
          onClick={() =>
            alert(
              "Membership Benefits: Instant discount on non-discounted items, reward points, exclusive offers, birthday gifts, and member-only campaigns."
            )
          }
        >
          View Benefits
        </SaqsoButton>
      </div>
    </SaqsoCard>
  );
}


