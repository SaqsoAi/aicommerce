"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Sparkles } from "lucide-react";
import BrandingAssetBindingField from "@/components/store-settings/BrandingAssetBindingField";
import EnterpriseBrandCoreForm from "@/components/store-settings/EnterpriseBrandCoreForm";

type SettingField = {
  id: string;
  key?: string;
  name?: string;
  label?: string;
  value?: any;
  category?: string;
  group?: string;
  type?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function authHeaders(extra?: HeadersInit): HeadersInit {
  if (typeof window === "undefined") return extra || {};
  const token = localStorage.getItem("token");
  return {
    ...(extra || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function labelOf(field: SettingField) {
  return field.label || field.name || field.key || field.id;
}

function valueOf(field: SettingField) {
  if (field.value === null || field.value === undefined) return "";
  if (typeof field.value === "object") return JSON.stringify(field.value, null, 2);
  return String(field.value);
}

function categoryOf(field: SettingField) {
  return field.category || field.group || "General";
}

export default function EnterpriseStoreSettingsPage() {
  const [fields, setFields] = useState<SettingField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return fields.reduce<Record<string, SettingField[]>>((acc, field) => {
      const cat = categoryOf(field);
      acc[cat] ||= [];
      acc[cat].push(field);
      return acc;
    }, {});
  }, [fields]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/enterprise-settings`, {
        headers: authHeaders(),
        cache: "no-store",
      });
      const json = await res.json();
      const list: SettingField[] = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : Array.isArray(json?.settings)
            ? json.settings
            : [];

      setFields(list);

      const next: Record<string, string> = {};
      list.forEach((field) => {
        next[field.id] = valueOf(field);
      });
      setValues(next);
    } finally {
      setLoading(false);
    }
  }

  async function seed() {
    await fetch(`${API}/enterprise-settings/seed`, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    await load();
  }

  async function save(field: SettingField) {
    setSaving(field.id);
    try {
      await fetch(`${API}/enterprise-settings/field/${field.id}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ value: values[field.id] ?? "" }),
      });
      await load();
    } finally {
      setSaving(null);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen text-slate-950 dark:text-white">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.045] md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-cyan-500">
              Enterprise Store Settings
            </p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">
              Store Branding Control
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-500 dark:text-white/50">
              Manage branding, theme, contact, social, SEO and homepage settings from one place.
              Client providers will consume this data as the single source of truth.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={seed}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white"
            >
              <Sparkles size={17} />
              Seed Defaults
            </button>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black dark:border-white/10 dark:bg-white/[0.06]"
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      <EnterpriseBrandCoreForm />

      <section className="mt-6">
        {loading ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center font-black dark:border-white/10 dark:bg-white/[0.045]">
            Loading settings...
          </div>
        ) : fields.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/[0.045]">
            <p className="text-lg font-black">No settings found</p>
            <button onClick={seed} className="mt-4 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-white">
              Create Default Settings
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {Object.entries(grouped).map(([category, list]) => (
              <div key={category} className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.045] md:p-6">
                <h2 className="text-xl font-black">{category}</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {list.map((field) => (
                    <div key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {labelOf(field)}
                      </label>
                      <textarea
                        value={values[field.id] ?? ""}
                        onChange={(e) => setValues((prev) => ({ ...prev, [field.id]: e.target.value }))}
                        rows={3}
                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold outline-none focus:border-cyan-400 dark:border-white/10 dark:bg-black/20"
                      />
                      <button
                        onClick={() => save(field)}
                        disabled={saving === field.id}
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60 dark:bg-white dark:text-slate-950"
                      >
                        <Save size={16} />
                        {saving === field.id ? "Saving..." : "Save Field"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
