import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function TimelineAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Timeline"
      title="Customer Account Timeline"
      description="Review account events across orders, wishlist, rewards, membership, support, and profile updates."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Timeline Filter"
          description="Prepare account timeline filtering for support teams."
          submitLabel="Load Timeline"
          fields={[
            { name: "userId", label: "User ID", placeholder: "Customer user id", required: true },
            { name: "eventType", label: "Event Type", options: ["ALL", "ORDER", "REWARD", "WISHLIST", "PROFILE", "SUPPORT"] },
            { name: "from", label: "From Date", type: "date" },
            { name: "to", label: "To Date", type: "date" },
          ]}
        />
        <AccountAdminTable
          title="Timeline Preview"
          rows={[
            { Time: "Today", Event: "Wishlist updated", Source: "Client", Status: "Ready" },
            { Time: "Yesterday", Event: "Reward earned", Source: "Order", Status: "Ready" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}