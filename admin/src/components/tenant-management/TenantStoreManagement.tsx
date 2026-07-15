"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";

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

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const field: CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 9,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#08111f",
  color: "#e5eefc",
};
const card: CSSProperties = {
  background: "rgba(15,23,42,.76)",
  border: "1px solid rgba(148,163,184,.18)",
  borderRadius: 14,
  padding: 18,
};
const action: CSSProperties = {
  ...field,
  width: "auto",
  cursor: "pointer",
  fontWeight: 700,
};

function headers(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: { ...headers(), ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }
  return (body?.data ?? body) as T;
}

function domain(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

export default function TenantStoreManagement(): React.ReactElement {
  const [catalog, setCatalog] = useState<Catalog>({
    tenants: [],
    templates: [],
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [tenantForm, setTenantForm] = useState({ name: "", slug: "" });
  const [storeForm, setStoreForm] = useState({
    tenantId: "",
    name: "",
    primaryDomain: "",
  });
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editStore, setEditStore] = useState<
    (Store & { tenantId: string }) | null
  >(null);

  const load = useCallback(async () => {
    const data = await request<Catalog>("/platform-tenancy/catalog");
    const tenants = Array.isArray(data.tenants) ? data.tenants : [];
    setCatalog({
      tenants,
      templates: Array.isArray(data.templates) ? data.templates : [],
    });
    setStoreForm((current) => ({
      ...current,
      tenantId: current.tenantId || tenants[0]?.id || "",
    }));
  }, []);

  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, [load]);

  async function run(
    callback: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await callback();
      setMessage(success);
      setEditTenant(null);
      setEditStore(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  const stores = useMemo(
    () => catalog.tenants.flatMap((tenant) => tenant.stores),
    [catalog.tenants],
  );

  return (
    <main style={{ padding: 24, color: "#e5eefc" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 18,
        }}
      >
        <div>
          <p style={{ color: "#60a5fa", margin: 0 }}>SUPER ADMIN</p>
          <h1 style={{ margin: "4px 0" }}>Tenant & Store Management</h1>
          <p style={{ color: "#94a3b8", margin: 0 }}>
            Create and edit tenant/store runtime settings.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/system/template-catalog" style={action}>
            Template Catalog
          </Link>
          <Link href="/system/runtime-domain" style={action}>
            Runtime & Domains
          </Link>
          <button style={action} onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
        </div>
      </header>

      {error ? <p style={{ background: "#451a1a", padding: 12 }}>{error}</p> : null}
      {message ? (
        <p style={{ background: "#064e3b", padding: 12 }}>{message}</p>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 14,
        }}
      >
        <div style={card}>
          <h2>Create Tenant</h2>
          <input
            style={field}
            value={tenantForm.name}
            placeholder="Tenant name"
            onChange={(event) =>
              setTenantForm({ ...tenantForm, name: event.target.value })
            }
          />
          <div style={{ height: 10 }} />
          <input
            style={field}
            value={tenantForm.slug}
            placeholder="tenant-slug"
            onChange={(event) =>
              setTenantForm({ ...tenantForm, slug: event.target.value })
            }
          />
          <div style={{ height: 10 }} />
          <button
            style={action}
            disabled={!tenantForm.name.trim() || !tenantForm.slug.trim() || busy}
            onClick={() =>
              void run(
                () =>
                  request("/platform-tenancy/tenants", {
                    method: "POST",
                    body: JSON.stringify(tenantForm),
                  }),
                "Tenant created.",
              )
            }
          >
            Create Tenant
          </button>
        </div>

        <div style={card}>
          <h2>Create Store</h2>
          <select
            style={field}
            value={storeForm.tenantId}
            onChange={(event) =>
              setStoreForm({ ...storeForm, tenantId: event.target.value })
            }
          >
            <option value="">Select tenant</option>
            {catalog.tenants.map((tenant) => (
              <option value={tenant.id} key={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <div style={{ height: 10 }} />
          <input
            style={field}
            value={storeForm.name}
            placeholder="Store name"
            onChange={(event) =>
              setStoreForm({ ...storeForm, name: event.target.value })
            }
          />
          <div style={{ height: 10 }} />
          <input
            style={field}
            value={storeForm.primaryDomain}
            placeholder="Primary domain"
            onChange={(event) =>
              setStoreForm({
                ...storeForm,
                primaryDomain: event.target.value,
              })
            }
          />
          <div style={{ height: 10 }} />
          <button
            style={action}
            disabled={!storeForm.tenantId || !storeForm.name.trim() || busy}
            onClick={() =>
              void run(
                () =>
                  request("/platform-tenancy/stores", {
                    method: "POST",
                    body: JSON.stringify({
                      ...storeForm,
                      primaryDomain: domain(storeForm.primaryDomain),
                    }),
                  }),
                "Store created.",
              )
            }
          >
            Create Store
          </button>
        </div>
      </section>

      {editTenant ? (
        <section style={{ ...card, marginTop: 16 }}>
          <h2>Edit Tenant</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <input
              style={field}
              value={editTenant.name}
              onChange={(event) =>
                setEditTenant({ ...editTenant, name: event.target.value })
              }
            />
            <input
              style={field}
              value={editTenant.slug}
              onChange={(event) =>
                setEditTenant({ ...editTenant, slug: event.target.value })
              }
            />
            <select
              style={field}
              value={editTenant.status}
              onChange={(event) =>
                setEditTenant({ ...editTenant, status: event.target.value })
              }
            >
              <option>ACTIVE</option>
              <option>INACTIVE</option>
              <option>SUSPENDED</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={editTenant.storefrontEnabled}
                onChange={(event) =>
                  setEditTenant({
                    ...editTenant,
                    storefrontEnabled: event.target.checked,
                  })
                }
              />{" "}
              Storefront enabled
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              style={action}
              onClick={() =>
                void run(
                  () =>
                    request(`/platform-tenancy/tenants/${editTenant.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        name: editTenant.name,
                        slug: editTenant.slug,
                        status: editTenant.status,
                        storefrontEnabled: editTenant.storefrontEnabled,
                      }),
                    }),
                  "Tenant updated.",
                )
              }
            >
              Save Tenant
            </button>
            <button style={action} onClick={() => setEditTenant(null)}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {editStore ? (
        <section style={{ ...card, marginTop: 16 }}>
          <h2>Edit Store</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <select
              style={field}
              value={editStore.tenantId}
              onChange={(event) =>
                setEditStore({ ...editStore, tenantId: event.target.value })
              }
            >
              {catalog.tenants.map((tenant) => (
                <option value={tenant.id} key={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <input
              style={field}
              value={editStore.name}
              onChange={(event) =>
                setEditStore({ ...editStore, name: event.target.value })
              }
            />
            <input
              style={field}
              value={editStore.primaryDomain || ""}
              onChange={(event) =>
                setEditStore({
                  ...editStore,
                  primaryDomain: event.target.value,
                })
              }
            />
            <select
              style={field}
              value={editStore.status}
              onChange={(event) =>
                setEditStore({ ...editStore, status: event.target.value })
              }
            >
              <option>ACTIVE</option>
              <option>INACTIVE</option>
              <option>SUSPENDED</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={editStore.storefrontEnabled}
                onChange={(event) =>
                  setEditStore({
                    ...editStore,
                    storefrontEnabled: event.target.checked,
                  })
                }
              />{" "}
              Storefront enabled
            </label>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button
              style={action}
              onClick={() =>
                void run(
                  () =>
                    request(`/platform-tenancy/stores/${editStore.id}`, {
                      method: "PATCH",
                      body: JSON.stringify({
                        tenantId: editStore.tenantId,
                        name: editStore.name,
                        primaryDomain: domain(editStore.primaryDomain || ""),
                        status: editStore.status,
                        storefrontEnabled: editStore.storefrontEnabled,
                      }),
                    }),
                  "Store updated.",
                )
              }
            >
              Save Store
            </button>
            <button style={action} onClick={() => setEditStore(null)}>
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      <section style={{ ...card, marginTop: 16 }}>
        <h2>Current Tenants and Stores</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
            gap: 14,
          }}
        >
          {catalog.tenants.map((tenant) => (
            <article key={tenant.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <strong>{tenant.name}</strong>
                  <div style={{ color: "#94a3b8" }}>
                    {tenant.slug} · {tenant.status}
                  </div>
                </div>
                <button style={action} onClick={() => setEditTenant(tenant)}>
                  Edit Tenant
                </button>
              </div>
              {tenant.stores.map((store) => (
                <div
                  key={store.id}
                  style={{
                    marginTop: 12,
                    borderTop: "1px solid rgba(148,163,184,.18)",
                    paddingTop: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <b>{store.name}</b>
                      <div style={{ color: "#94a3b8" }}>
                        {store.primaryDomain || "No domain"} · {store.status}
                      </div>
                    </div>
                    <button
                      style={action}
                      onClick={() =>
                        setEditStore({ ...store, tenantId: tenant.id })
                      }
                    >
                      Edit Store
                    </button>
                  </div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    {store.templates.length
                      ? store.templates.map((item) => (
                          <span
                            key={item.id}
                            style={{
                              color: item.isActive ? "#34d399" : "#93c5fd",
                              marginRight: 8,
                            }}
                          >
                            {item.template.name}:{" "}
                            {item.isActive ? "ACTIVE" : "AVAILABLE"}
                          </span>
                        ))
                      : "No assigned template"}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
        <p>
          Total stores: {stores.length} · Templates: {catalog.templates.length}
        </p>
      </section>
    </main>
  );
}
