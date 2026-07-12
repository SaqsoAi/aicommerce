import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function RewardsAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Rewards"
      title="Reward Rules & Adjustments"
      description="Prepare reward earning, redemption, and manual adjustment controls for customer account management."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Create Reward Rule"
          description="Define how customers earn or redeem style points."
          submitLabel="Save Reward Rule"
          fields={[
            { name: "ruleName", label: "Rule Name", placeholder: "Order purchase points", required: true },
            { name: "points", label: "Points", type: "number", placeholder: "50", required: true },
            { name: "trigger", label: "Trigger", options: ["ORDER_PLACED", "REVIEW_ADDED", "PROFILE_COMPLETED", "MANUAL_ADJUSTMENT"] },
            { name: "status", label: "Status", options: ["ACTIVE", "DRAFT", "PAUSED"] },
          ]}
        />
        <AccountAdminTable
          title="Prepared Reward Rules"
          rows={[
            { Rule: "Order purchase", Points: "50", Trigger: "ORDER_PLACED", Status: "ACTIVE" },
            { Rule: "Profile complete", Points: "100", Trigger: "PROFILE_COMPLETED", Status: "DRAFT" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}