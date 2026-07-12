import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function MembershipAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Membership"
      title="Membership Plans"
      description="Create and manage tier rules that power customer account widgets, benefits, style points, and retention campaigns."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Create Membership Plan"
          description="Design the visible member tier structure for customer account dashboards."
          submitLabel="Save Membership Plan"
          fields={[
            { name: "tier", label: "Tier Name", placeholder: "Gold", required: true },
            { name: "minPoints", label: "Minimum Points", type: "number", placeholder: "2000", required: true },
            { name: "benefit", label: "Primary Benefit", placeholder: "Free shipping + early access" },
            { name: "status", label: "Status", options: ["ACTIVE", "DRAFT", "ARCHIVED"] },
          ]}
        />
        <AccountAdminTable
          title="Prepared Plans"
          rows={[
            { Tier: "Bronze", Points: "0", Benefit: "Basic rewards", Status: "ACTIVE" },
            { Tier: "Silver", Points: "500", Benefit: "Priority deals", Status: "ACTIVE" },
            { Tier: "Gold", Points: "2000", Benefit: "Premium benefits", Status: "ACTIVE" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}