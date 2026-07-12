import { AccountCard, AccountForm, AccountPageShell } from "../_components/AccountClientUi";
import ProfileRewardClient from "./ProfileRewardClient";
import AvatarUploadClient from "./AvatarUploadClient";

export default function AccountSettingsPage() {
  return (
    <AccountPageShell
      active="Settings"
      eyebrow="Customer Settings"
      title="Account Settings"
      description="Manage profile, avatar, login identity, social links, WhatsApp, notifications, and security preferences."
    >
      <AccountCard title="Profile Photo">
        <AvatarUploadClient />
      </AccountCard>

      <AccountCard title="Profile & Login Identity">
        <ProfileRewardClient />
      </AccountCard>

      <AccountCard title="Social Profiles">
        <AccountForm
          title="Connected Social Links"
          submitLabel="Save Social Links"
          fields={[
            { name: "facebook", label: "Facebook", placeholder: "Facebook profile/page URL" },
            { name: "instagram", label: "Instagram", placeholder: "Instagram profile URL" },
            { name: "tiktok", label: "TikTok", placeholder: "TikTok profile URL" },
            { name: "whatsappBusiness", label: "WhatsApp Business", placeholder: "WhatsApp business/contact link" },
          ]}
        />
      </AccountCard>

      <AccountCard title="Notification Preferences">
        <AccountForm
          title="Notifications"
          submitLabel="Save Notifications"
          fields={[
            { name: "orderEmail", label: "Order Email", options: ["Enabled", "Disabled"] },
            { name: "orderSms", label: "Order SMS", options: ["Enabled", "Disabled"] },
            { name: "orderPush", label: "Order Push", options: ["Enabled", "Disabled"] },
            { name: "promoEmail", label: "Promotion Email", options: ["Enabled", "Disabled"] },
            { name: "promoSms", label: "Promotion SMS", options: ["Enabled", "Disabled"] },
            { name: "styleUpdates", label: "Style Updates", options: ["Enabled", "Disabled"] },
          ]}
        />
      </AccountCard>
    </AccountPageShell>
  );
}