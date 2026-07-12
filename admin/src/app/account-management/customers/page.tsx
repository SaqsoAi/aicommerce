import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function CustomerProfileAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Customers"
      title="Customer Profile Tools"
      description="Edit customer profile fields, support profile completeness, avatar metadata, phone, and style preference review."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Edit Customer Profile"
          description="This form prepares customer profile editing UI for API binding."
          submitLabel="Save Profile"
          fields={[
            { name: "userId", label: "User ID", placeholder: "Customer user id", required: true },
            { name: "displayName", label: "Display Name", placeholder: "Test Customer" },
            { name: "phone", label: "Phone", placeholder: "+880..." },
            { name: "tier", label: "Membership Tier", options: ["Bronze", "Silver", "Gold", "Platinum"] },
          ]}
        />
        <AccountAdminTable
          title="Customer Snapshot"
          rows={[
            { Customer: "Test Customer", Tier: "Gold", Points: "2450", Status: "Ready" },
            { Customer: "Guest Customer", Tier: "Bronze", Points: "0", Status: "Profile Pending" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}