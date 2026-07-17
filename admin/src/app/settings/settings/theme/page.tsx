"use client";

import { useState } from "react";
import AdminHeader from "@/components/ui/AdminHeader";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

export default function ThemeSettingsPage() {
  const [role, setRole] = useState("SUPER_ADMIN");

  const [brandName, setBrandName] = useState("SAQSO");
  const [brandShortName, setBrandShortName] = useState("SQ");
  const [brandSlogan, setBrandSlogan] = useState("Fashion & Lifestyle");

  const [adminLogo, setAdminLogo] = useState("");
  const [clientLogo, setClientLogo] = useState("");

  const [dashboardName, setDashboardName] = useState("AI Commerce Admin");
  const [headerColor, setHeaderColor] = useState("#7c3aed");
  const [sidebarColor, setSidebarColor] = useState("#020617");
  const [footerColor, setFooterColor] = useState("#111827");
  const [buttonRadius, setButtonRadius] = useState("14");

  async function saveBranding() {
    await fetch(`${API}/theme-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "ADMIN",
        key: "branding-settings",
        value: {
          brandName,
          brandShortName,
          brandSlogan,
          adminLogo,
          clientLogo,
        },
        active: true,
      }),
    });

    alert("Global branding saved");
  }

  async function saveRoleTheme() {
    await fetch(`${API}/theme-settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scope: "ROLE",
        role,
        key: `role-theme-${role}`,
        value: {
          dashboardName,
          headerColor,
          sidebarColor,
          footerColor,
          buttonRadius,
          mode: "enterprise",
        },
        active: true,
      }),
    });

    alert("Role theme saved");
  }

  return (
    <main className="space-y-8 p-4 md:p-8">
      <AdminHeader
        title="Enterprise Theme Manager"
        description="Control global branding, role dashboard names, colors, buttons and light/dark compatible design."
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold">Global Branding</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Brand identity for Admin and Client storefront.
          </p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold">Brand Name</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Example: SAQSO"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Brand Short Name</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={brandShortName}
                onChange={(e) => setBrandShortName(e.target.value)}
                placeholder="Example: SQ"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Brand Slogan</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={brandSlogan}
                onChange={(e) => setBrandSlogan(e.target.value)}
                placeholder="Example: Fashion & Lifestyle"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Admin Logo URL</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={adminLogo}
                onChange={(e) => setAdminLogo(e.target.value)}
                placeholder="/uploads/admin-logo.png or https://..."
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Client Logo URL</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={clientLogo}
                onChange={(e) => setClientLogo(e.target.value)}
                placeholder="/uploads/client-logo.png or https://..."
              />
            </label>

            <button
              onClick={saveBranding}
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-lg dark:bg-white dark:text-slate-950"
            >
              Save Global Branding
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-bold">Role Theme Control</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Role-based dashboard name and interface colors.
          </p>

          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold">Role</span>
              <select
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
                <option value="CUSTOMER">Client / Customer</option>
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Dashboard Name</span>
              <input
                className="mt-2 w-full rounded-xl border border-border bg-background p-3"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                placeholder="Example: SAQSO Admin Control Center"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Header Color</span>
              <input
                type="color"
                className="mt-2 h-12 w-full rounded-xl"
                value={headerColor}
                onChange={(e) => setHeaderColor(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Sidebar Color</span>
              <input
                type="color"
                className="mt-2 h-12 w-full rounded-xl"
                value={sidebarColor}
                onChange={(e) => setSidebarColor(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Footer Color</span>
              <input
                type="color"
                className="mt-2 h-12 w-full rounded-xl"
                value={footerColor}
                onChange={(e) => setFooterColor(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold">Button Radius: {buttonRadius}px</span>
              <input
                type="range"
                min="0"
                max="32"
                value={buttonRadius}
                onChange={(e) => setButtonRadius(e.target.value)}
                className="mt-2 w-full"
              />
            </label>

            <button
              onClick={saveRoleTheme}
              className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-bold text-white shadow-lg dark:bg-white dark:text-slate-950"
            >
              Save Role Theme
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-bold">Live Preview</h2>

        <div className="mt-6 overflow-hidden rounded-3xl border border-border">
          <div className="flex items-center gap-4 p-6 text-white" style={{ background: headerColor }}>
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/15">
              {adminLogo ? (
                <img src={adminLogo} alt="Admin Logo" className="h-full w-full object-cover" />
              ) : (
                <span className="font-black">{brandShortName}</span>
              )}
            </div>

            <div>
              <p className="text-sm opacity-80">{brandSlogan}</p>
              <h3 className="text-2xl font-black">{brandName}</h3>
              <p className="text-xs opacity-75">{dashboardName}</p>
            </div>
          </div>

          <div className="grid grid-cols-[130px_1fr]">
            <div className="min-h-[180px] p-4 text-white" style={{ background: sidebarColor }}>
              {brandShortName}
            </div>

            <div className="p-5">
              <p className="font-bold">Dashboard Card</p>
              <p className="text-sm text-muted-foreground">
                Global branding + role theme preview.
              </p>

              <button
                className="mt-5 px-5 py-3 font-bold text-white"
                style={{ background: headerColor, borderRadius: `${buttonRadius}px` }}
              >
                Action Button
              </button>
            </div>
          </div>

          <div className="p-4 text-sm text-white" style={{ background: footerColor }}>
            Footer Preview
          </div>
        </div>
      </section>
    </main>
  );
}
