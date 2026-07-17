import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function WishlistAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Wishlist"
      title="Wishlist Admin View"
      description="Inspect saved items, demand signals, and product recommendation candidates."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Wishlist Lookup"
          description="Prepare customer wishlist search and support tools."
          submitLabel="Search Wishlist"
          fields={[
            { name: "userId", label: "User ID", placeholder: "Customer user id" },
            { name: "email", label: "Customer Email", placeholder: "customer@example.com" },
            { name: "status", label: "Signal Type", options: ["Saved", "High Intent", "Abandoned", "Recommended"] },
            { name: "limit", label: "Limit", type: "number", placeholder: "20" },
          ]}
        />
        <AccountAdminTable
          title="Wishlist Signals"
          rows={[
            { Product: "Polo Shirt H/S", Signal: "Saved", Count: "12", Priority: "High" },
            { Product: "Mens Shirt F/S", Signal: "Recommended", Count: "8", Priority: "Medium" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}