import { getAccountRewards } from "@/api/account.api";
import { AccountCard, AccountList, AccountMetric, AccountNotice, AccountPageShell } from "../_components/AccountClientUi";

export default async function AccountRewardsPage() {
  let rewards: any = { balance: 0, ledger: [] };
  let error = "";
  try {
    rewards = await getAccountRewards();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load rewards";
  }

  return (
    <AccountPageShell active="Rewards" eyebrow="Rewards" title="Rewards" description="Style points, reward ledger, redeem rules, and benefit status.">
      {error && <AccountNotice message={`Rewards API fallback: ${error}`} />}
      <div className="grid gap-4 md:grid-cols-3">
        <AccountMetric label="Available Points" value={rewards?.balance || 0} />
        <AccountMetric label="Ledger Items" value={(rewards?.ledger || []).length} />
        <AccountMetric label="Status" value="Active" />
      </div>
      <AccountCard title="Reward Ledger">
        <AccountList rows={rewards?.ledger || []} empty="No reward ledger found." />
      </AccountCard>
    </AccountPageShell>
  );
}