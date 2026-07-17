import { getAccountMembership, getAccountRewards } from "@/api/account.api";
import { AccountCard, AccountList, AccountMetric, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

export default async function AccountMembershipPage() {
  let membership: any = null;
  let rewards: any = { balance: 0 };
  let error = "";
  try {
    membership = await getAccountMembership();
    rewards = await getAccountRewards();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load membership";
  }

  return (
    <AccountPageShell active="Rewards" eyebrow="Membership" title="ISRA Member Benefits" description="Your current tier, benefits, progress, and exclusive member perks.">
      {error && <AccountNotice message={`Membership API fallback: ${error}`} />}
      <div className="grid gap-4 md:grid-cols-3">
        <AccountMetric label="Tier" value={membership?.tier || "Bronze"} />
        <AccountMetric label="Points" value={membership?.stylePoints || rewards?.balance || 0} />
        <AccountMetric label="Status" value={membership?.status || "Active"} />
      </div>
      <AccountCard title="Benefits">
        <AccountList rows={[
          { Benefit: "Early Access", Status: "Active", Value: "Premium drops" },
          { Benefit: "Rewards Boost", Status: "Active", Value: "Extra points" },
          { Benefit: "Priority Support", Status: "Active", Value: "24/7 support" },
        ]} />
      </AccountCard>
    </AccountPageShell>
  );
}