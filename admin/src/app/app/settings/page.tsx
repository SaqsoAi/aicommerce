"use client";

import {
  Store,
  Globe,
  Sparkles,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  Gift,
  CreditCard,
  Truck,
  Receipt,
  Megaphone,
  Bell,
  Shield,
  Plug,
  BarChart3,
  UserCog,
  Code2,
  Scale,
  DatabaseBackup,
  Ruler,
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import StoreSettingsForm from "@/components/settings/StoreSettingsForm";

const settingsGroups = [
  {
    title: "Store Profile",
    description: "Store name, logo, favicon, domain, business identity and address.",
    icon: Store,
    status: "Active",
  },
  {
    title: "General",
    description: "Currency, language, timezone, date format and measurement units.",
    icon: Globe,
    status: "Planned",
  },
  {
    title: "AI Settings",
    description: "AI assistant, recommendations, AI search, content generation and personalization.",
    icon: Sparkles,
    status: "Planned",
  },
  {
    title: "Product Settings",
    description: "SKU, barcode, approval workflow, reviews, variants and AI categorization.",
    icon: Package,
    status: "Planned",
  },
    {
    title: "Size & Fit Center",
    description:
      "Size guide, virtual fitting room, measurement guide and available size settings.",
    icon: Ruler,
    status: "Active",
  },
  {
    title: "Inventory Settings",
    description: "Inventory tracking, low stock alert, warehouse and stock adjustment rules.",
    icon: Warehouse,
    status: "Planned",
  },
  {
    title: "Order Settings",
    description: "Order prefix, invoice generation, workflow, cancellation and return rules.",
    icon: ShoppingCart,
    status: "Planned",
  },
  {
    title: "Customer Settings",
    description: "Guest checkout, registration, email verification, groups and segmentation.",
    icon: Users,
    status: "Planned",
  },
  {
    title: "Membership & Rewards",
    description: "Tier rules, card issue rules, instant discount and reward redemption.",
    icon: Gift,
    status: "Planned",
  },
  {
    title: "Payment Settings",
    description: "Payment gateways, test/live mode, COD, bank transfer and tax calculation.",
    icon: CreditCard,
    status: "Planned",
  },
  {
    title: "Shipping Settings",
    description: "Shipping zones, delivery charges, free shipping and AI shipping optimization.",
    icon: Truck,
    status: "Planned",
  },
  {
    title: "Tax Settings",
    description: "VAT/GST, inclusive or exclusive pricing, invoice and tax reporting.",
    icon: Receipt,
    status: "Planned",
  },
  {
    title: "Marketing Settings",
    description: "SEO, sitemap, robots.txt, email, SMS, push, coupons and referral rules.",
    icon: Megaphone,
    status: "Planned",
  },
  {
    title: "Notification Settings",
    description: "Email, SMS, WhatsApp, push notifications and admin alerts.",
    icon: Bell,
    status: "Planned",
  },
  {
    title: "Security Settings",
    description: "2FA, password policy, session management, IP whitelist and audit logs.",
    icon: Shield,
    status: "Planned",
  },
  {
    title: "Integrations",
    description: "Facebook Pixel, Google Analytics, GTM, WhatsApp, CRM, ERP and marketplace.",
    icon: Plug,
    status: "Planned",
  },
  {
    title: "Analytics & AI",
    description: "Sales prediction, demand forecasting, product performance and AI reports.",
    icon: BarChart3,
    status: "Planned",
  },
  {
    title: "Staff & Permissions",
    description: "Staff accounts, user roles, permissions and admin access control.",
    icon: UserCog,
    status: "Planned",
  },
  {
    title: "API & Developers",
    description: "API keys, webhooks, OAuth, SDK access and API rate limits.",
    icon: Code2,
    status: "Planned",
  },
  {
    title: "Legal",
    description: "Privacy policy, terms, cookie policy, GDPR and data retention.",
    icon: Scale,
    status: "Planned",
  },
  {
    title: "Backup & Maintenance",
    description: "Database backup, auto backup schedule, restore and maintenance mode.",
    icon: DatabaseBackup,
  Ruler,
    status: "Planned",
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            System
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Settings
          </h1>

          <p className="mt-2 max-w-3xl text-zinc-500">
            Manage your AI-powered eCommerce store configuration, business rules,
            automation, security, integrations and developer settings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {settingsGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.title}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                    {group.status}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold">
                  {group.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {group.description}
                </p>
              </div>
            );
          })}
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Store Profile
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Current active settings form. More settings groups will be connected step by step.
            </p>
          </div>

          <StoreSettingsForm />
        </section>
      </div>
    </DashboardLayout>
  );
}
