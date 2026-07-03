"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminHeader from "@/components/ui/AdminHeader";

import {
  getStoreSettings,
  updateStoreThemeSettings,
} from "@/services/store-settings.service";

const templates = [
  {
    id: "fashion",
    name: "Fashion",
    description: "Editorial white-space layout for fashion storefronts.",
  },
  {
    id: "luxury",
    name: "Luxury",
    description: "Premium black and gold visual system.",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean product-focused ecommerce grid.",
  },
  {
    id: "saqsobuild",
    name: "SaqsoBuild",
    description:
      "Flagship production template with glass header, editorial hero, personalization, discovery, recommendations and premium footer.",
  },
];

const themeModes = ["LIGHT", "DARK", "SYSTEM"];
const headerStyles = ["GLASS", "MINIMAL", "CLASSIC"];
const heroStyles = ["PREMIUM", "EDITORIAL", "MODERN"];
const buttonStyles = ["LUXURY", "ROUNDED", "MINIMAL"];
const footerStyles = ["PREMIUM", "MINIMAL", "CLASSIC"];

export default function TemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    themeMode: "SYSTEM",
    headerStyle: "GLASS",
    heroStyle: "PREMIUM",
    buttonStyle: "LUXURY",
    footerStyle: "PREMIUM",
    activeTemplate: "saqsobuild",
  });

  useEffect(() => {
    getStoreSettings()
      .then((res) => {
        const data = res.data || {};

        setSettings({
          themeMode: data.themeMode || "SYSTEM",
          headerStyle: data.headerStyle || "GLASS",
          heroStyle: data.heroStyle || "PREMIUM",
          buttonStyle: data.buttonStyle || "LUXURY",
          footerStyle: data.footerStyle || "PREMIUM",
          activeTemplate: data.activeTemplate || "saqsobuild",
        });
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to load template settings");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const updateField = (key: keyof typeof settings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await updateStoreThemeSettings(settings);
      alert("Template settings saved");
    } catch (error) {
      console.error(error);
      alert("Template settings save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <AdminHeader
            title="Templates"
            description="Control active storefront template, theme mode and SaqsoBuild premium style."
          />

          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
              Loading template settings...
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {templates.map((template) => {
                  const active = settings.activeTemplate === template.id;

                  return (
                    <button
                      type="button"
                      key={template.id}
                      onClick={() => updateField("activeTemplate", template.id)}
                      className={`rounded-2xl border p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                        active
                          ? "border-green-500 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold">
                          {template.name}
                        </h2>

                        <span className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black">
                          {active ? "Active" : "Installed"}
                        </span>
                      </div>

                      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {template.description}
                      </p>

                      <div className="mt-5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        Slug: {template.id}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="text-2xl font-bold">
                    SaqsoBuild Theme Control
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Configure storefront dark/light mode, glass header, premium
                    hero and footer style.
                  </p>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <SelectBox
                      label="Theme Mode"
                      value={settings.themeMode}
                      options={themeModes}
                      onChange={(value) => updateField("themeMode", value)}
                    />

                    <SelectBox
                      label="Header Style"
                      value={settings.headerStyle}
                      options={headerStyles}
                      onChange={(value) => updateField("headerStyle", value)}
                    />

                    <SelectBox
                      label="Hero Style"
                      value={settings.heroStyle}
                      options={heroStyles}
                      onChange={(value) => updateField("heroStyle", value)}
                    />

                    <SelectBox
                      label="Button Style"
                      value={settings.buttonStyle}
                      options={buttonStyles}
                      onChange={(value) => updateField("buttonStyle", value)}
                    />

                    <SelectBox
                      label="Footer Style"
                      value={settings.footerStyle}
                      options={footerStyles}
                      onChange={(value) => updateField("footerStyle", value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={saveSettings}
                    disabled={saving}
                    className="mt-6 rounded-xl bg-black px-6 py-3 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
                  >
                    {saving ? "Saving..." : "Save Template Settings"}
                  </button>
                </div>

                <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-950 text-white shadow-sm dark:border-zinc-800">
                  <div className="border-b border-white/10 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-300">
                      Live Preview
                    </p>
                    <h2 className="mt-2 text-3xl font-black">
                      SaqsoBuild Premium
                    </h2>
                  </div>

                  <div className="relative min-h-[420px] bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop')] bg-cover bg-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

                    <div className="relative z-10 p-8">
                      <div className="mb-8 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-xl">
                        Glass Header · {settings.headerStyle}
                      </div>

                      <span className="rounded-full border border-amber-300/50 px-4 py-2 text-sm text-amber-200">
                        {settings.themeMode} MODE
                      </span>

                      <h3 className="mt-6 max-w-md text-5xl font-black leading-tight">
                        Discover Your Style Story
                      </h3>

                      <p className="mt-4 max-w-sm text-zinc-300">
                        Premium editorial storefront preview powered by
                        SaqsoBuild.
                      </p>

                      <div className="mt-6 flex gap-3">
                        <span className="rounded-full bg-white px-5 py-3 font-semibold text-black">
                          Shop Now
                        </span>
                        <span className="rounded-full border border-white/40 px-5 py-3 font-semibold text-white">
                          Explore
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function SelectBox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
