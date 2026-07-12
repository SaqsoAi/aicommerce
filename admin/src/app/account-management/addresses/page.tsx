import { AccountAdminForm, AccountAdminShell, AccountAdminTable } from "../_components/AccountAdminUi";

export default function AddressAdminPage() {
  return (
    <AccountAdminShell
      eyebrow="Addresses"
      title="Customer Address Management"
      description="Create, edit, and review customer delivery addresses for account support workflows."
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AccountAdminForm
          title="Create Address"
          description="Prepare address CRUD form with account-safe fields."
          submitLabel="Save Address"
          fields={[
            { name: "userId", label: "User ID", placeholder: "Customer user id", required: true },
            { name: "label", label: "Label", placeholder: "Home" },
            { name: "fullName", label: "Full Name", placeholder: "Customer name" },
            { name: "phone", label: "Phone", placeholder: "+880..." },
            { name: "line1", label: "Address Line", placeholder: "House, Road, Area", required: true },
            { name: "city", label: "City", placeholder: "Dhaka" },
          ]}
        />
        <AccountAdminTable
          title="Address Review"
          rows={[
            { Label: "Home", City: "Dhaka", Country: "Bangladesh", Default: "Yes" },
            { Label: "Office", City: "Dhaka", Country: "Bangladesh", Default: "No" },
          ]}
        />
      </div>
    </AccountAdminShell>
  );
}