import { AccountCard, AccountForm, AccountList, AccountPageShell } from "../_components/AccountClientUi";

export default function StyleProfilePage() {
  return (
    <AccountPageShell active="Style Profile" eyebrow="Style Profile" title="Style Profile" description="Manage style personality, preferred colors, and size preferences.">
      <AccountCard title="Style Quiz & Preferences">
        <AccountForm
          title="Update Style Profile"
          submitLabel="Save Style Profile"
          fields={[
            { name: "stylePersonality", label: "Style Personality", options: ["Classic", "Trendy", "Luxury", "Street", "Formal"] },
            { name: "preferredColors", label: "Preferred Colors", placeholder: "Black, White, Navy" },
            { name: "topSize", label: "Top Size", placeholder: "L" },
            { name: "bottomSize", label: "Bottom Size", placeholder: "32" },
            { name: "shoeSize", label: "Shoe Size", placeholder: "42" },
            { name: "fit", label: "Fit", options: ["Slim", "Regular", "Relaxed", "Oversized"] },
          ]}
        />
      </AccountCard>
      <AccountCard title="Saved Measurement Profile">
        <AccountList rows={[
          { Type: "Top", Size: "L", Fit: "Regular" },
          { Type: "Bottom", Size: "32", Fit: "Relaxed" },
          { Type: "Shoe", Size: "42", Fit: "Standard" },
        ]} />
      </AccountCard>
    </AccountPageShell>
  );
}