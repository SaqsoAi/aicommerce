"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Template = { id: string; name: string; slug: string };
type Assignment = { id: string; isActive: boolean; template: Template };
type Store = {
  id: string;
  name: string;
  status: string;
  storefrontEnabled: boolean;
  primaryDomain?: string | null;
  templates: Assignment[];
};
type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  storefrontEnabled: boolean;
  stores: Store[];
};
type Catalog = { tenants: Tenant[]; templates: Template[] };

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Request failed: ${response.status}`);
  return (body?.data ?? body) as T;
}

const card: React.CSSProperties = {
  background: "rgba(15,23,42,.76)",
  border: "1px solid rgba(148,163,184,.18)",
  borderRadius: 14,
  padding: 18,
};
const input: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 9,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#08111f",
  color: "#e5eefc",
};

export default function TenantStoreManagement() {
  const [catalog, setCatalog] = useState<Catalog>({ tenants: [], templates: [] });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: "", slug: "" });
  const [storeForm, setStoreForm] = useState({ tenantId: "", name: "", primaryDomain: "" });

  const stores = useMemo(
    () => catalog.tenants.flatMap((tenant) => tenant.stores.map((store) => ({ ...store, tenantName: tenant.name }))),
    [catalog.tenants],
  );

  const load = useCallback(async () => {
    setError("");
    const data = await request<Catalog>("/platform-tenancy/catalog");
    setCatalog({ tenants: data.tenants || [], templates: data.templates || [] });
    setStoreForm((value) => ({
      ...value,
      tenantId: value.tenantId || data.tenants?.[0]?.id || "",
    }));
  }, []);

  useEffect(() => {
    void load().catch((value) => setError(value instanceof Error ? value.message : String(value)));
  }, [load]);

  async function perform(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ padding: 24, color: "#e5eefc" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <p style={{ color: "#60a5fa", margin: 0, letterSpacing: ".12em", fontSize: 12 }}>SUPER ADMIN</p>
          <h1 style={{ margin: "4px 0" }}>Tenant & Store Management</h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>Create tenants and stores, then manage several templates per store in Template Catalog.</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/system/template-catalog" style={{ ...input, width: "auto", textDecoration: "none" }}>Template Catalog</Link>
          <Link href="/system/runtime-domain" style={{ ...input, width: "auto", textDecoration: "none" }}>Runtime & Domains</Link>
          <button onClick={() => void load()} style={{ ...input, width: "auto" }} disabled={busy}>Refresh</button>
        </div>
      </header>

      {error ? <p style={{ background: "#451a1a", padding: 12, borderRadius: 10 }}>{error}</p> : null}
      {message ? <p style={{ background: "rgba(6,78,59,.6)", padding: 12, borderRadius: 10 }}>{message}</p> : null}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 14 }}>
        <div style={card}>
          <h2>Create Tenant</h2>
          <input style={input} placeholder="Tenant name" value={tenantForm.name} onChange={(event) => setTenantForm((value) => ({ ...value, name: event.target.value }))} />
          <div style={{ height: 10 }} />
          <input style={input} placeholder="tenant-slug" value={tenantForm.slug} onChange={(event) => setTenantForm((value) => ({ ...value, slug: event.target.value }))} />
          <div style={{ height: 12 }} />
          <button
            disabled={busy || !tenantForm.name.trim() || !tenantForm.slug.trim()}
            onClick={() => void perform(
              () => request("/platform-tenancy/tenants", { method: "POST", body: JSON.stringify(tenantForm) }),
              "Tenant created. It is immediately available in AI Migrator target selection.",
            )}
            style={input}
          >Create Tenant</button>
        </div>

        <div style={card}>
          <h2>Create Store</h2>
          <select style={input} value={storeForm.tenantId} onChange={(event) => setStoreForm((value) => ({ ...value, tenantId: event.target.value }))}>
            <option value="">Select tenant</option>
            {catalog.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
          </select>
          <div style={{ height: 10 }} />
          <input style={input} placeholder="Store name" value={storeForm.name} onChange={(event) => setStoreForm((value) => ({ ...value, name: event.target.value }))} />
          <div style={{ height: 10 }} />
          <input style={input} placeholder="Primary domain (optional)" value={storeForm.primaryDomain} onChange={(event) => setStoreForm((value) => ({ ...value, primaryDomain: event.target.value }))} />
          <div style={{ height: 12 }} />
          <button
            disabled={busy || !storeForm.tenantId || !storeForm.name.trim()}
            onClick={() => void perform(
              () => request("/platform-tenancy/stores", { method: "POST", body: JSON.stringify(storeForm) }),
              "Store created.",
            )}
            style={input}
          >Create Store</button>
        </div>

        <div style={card}>
          <h2>Template Lifecycle</h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
            A store can keep multiple assigned templates. Exactly one can be active; the others remain available for switching.
          </p>
          <Link href="/system/template-catalog" style={{ ...input, display: "block", textAlign: "center", textDecoration: "none" }}>
            Open Enterprise Template Catalog
          </Link>
          <div style={{ height: 10 }} />
          <Link href="/system/runtime-domain" style={{ ...input, display: "block", textAlign: "center", textDecoration: "none" }}>
            Configure Runtime & Domains
          </Link>
        </div>
      </section>

      <section style={{ ...card, marginTop: 16 }}>
        <h2>Current Tenants and Stores</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {catalog.tenants.map((tenant) => (
            <article key={tenant.id} style={{ border: "1px solid rgba(148,163,184,.16)", borderRadius: 12, padding: 14 }}>
              <strong>{tenant.name}</strong>
              <div style={{ color: "#94a3b8" }}>{tenant.slug} · {tenant.status}</div>
              {tenant.stores.map((store) => (
                <div key={store.id} style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(148,163,184,.12)" }}>
                  <b>{store.name}</b>
                  <div style={{ color: "#94a3b8" }}>{store.primaryDomain || "No domain"} · {store.status}</div>
                  <div style={{ marginTop: 5, fontSize: 12 }}>
                    {store.templates.length === 0 ? <span style={{ color: "#fbbf24" }}>No assigned template</span> : null}
                    {store.templates.map((item) => (
                      <span key={item.id} style={{ display: "inline-block", marginRight: 8, color: item.isActive ? "#34d399" : "#93c5fd" }}>
                        {item.template.name}: {item.isActive ? "ACTIVE" : "AVAILABLE"}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
        <p style={{ color: "#94a3b8", marginBottom: 0 }}>Total stores: {stores.length} · Registered templates: {catalog.templates.length}</p>
      </section>
    </main>
  );
}
