"use client";

import styles from "../saas-management/SaasManagement.module.css";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Template = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  previewUrl?: string | null;
  isActive: boolean;
  stores?: Array<{
    id: string;
    isActive: boolean;
    store: { id: string; name: string; tenant?: { id: string; name: string } | null };
  }>;
};

type Assignment = { id: string; isActive: boolean; template: Template };
type Store = {
  id: string;
  name: string;
  status: string;
  primaryDomain?: string | null;
  templates: Assignment[];
};
type Tenant = { id: string; name: string; slug: string; status: string; stores: Store[] };
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

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.18)",
  background: "rgba(15,23,42,.72)",
  borderRadius: 16,
  padding: 18,
};
const input: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,.25)",
  background: "#091322",
  color: "#e5eefc",
};

export default function TemplateCatalogManagement() {
  const [catalog, setCatalog] = useState<Catalog>({ tenants: [], templates: [] });
  const [form, setForm] = useState({ name: "", slug: "", description: "", previewUrl: "" });
  const [assign, setAssign] = useState({ storeId: "", templateId: "", activate: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const stores = useMemo(
    () => catalog.tenants.flatMap((tenant) => tenant.stores.map((store) => ({ ...store, tenantName: tenant.name }))),
    [catalog.tenants],
  );

  const load = useCallback(async () => {
    setError("");
    const data = await request<Catalog>("/platform-tenancy/catalog");
    setCatalog({ tenants: data.tenants || [], templates: data.templates || [] });
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
    <main className={styles.page}>
      <header className={styles.pageHeader} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <p style={{ margin: 0, color: "#67e8f9", letterSpacing: ".14em", fontSize: 12 }}>SUPER ADMIN / TEMPLATE LIFECYCLE</p>
          <h1 style={{ margin: "6px 0" }}>Enterprise Template Catalog · Zero-downtime switching</h1>
          <p style={{ margin: 0, color: "#94a3b8" }}>Register imported templates, assign several templates to a store, and keep exactly one active.</p>
        </div>
        <div className={styles.headerActions} style={{ display: "flex", gap: 10 }}>
          <Link href="/system/tenant-management" className={styles.headerAction} style={{ ...input, width: "auto", textDecoration: "none" }}>Tenant Management</Link>
          <Link href="/system/runtime-domain" className={styles.headerAction} style={{ ...input, width: "auto", textDecoration: "none" }}>Runtime & Domains</Link>
          <button className={styles.headerAction} style={{ ...input, width: "auto" }} onClick={() => void load()} disabled={busy}>Refresh</button>
        </div>
      </header>

      {error ? <p style={{ padding: 12, borderRadius: 10, background: "rgba(127,29,29,.55)" }}>{error}</p> : null}
      {message ? <p style={{ padding: 12, borderRadius: 10, background: "rgba(6,78,59,.55)" }}>{message}</p> : null}

      <section className={styles.primaryGrid} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        <div style={panel}>
          <h2>Register Template</h2>
          <input style={input} placeholder="Template name" value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} />
          <div style={{ height: 10 }} />
          <input style={input} placeholder="template-slug" value={form.slug} onChange={(event) => setForm((value) => ({ ...value, slug: event.target.value }))} />
          <div style={{ height: 10 }} />
          <input style={input} placeholder="Preview URL (optional)" value={form.previewUrl} onChange={(event) => setForm((value) => ({ ...value, previewUrl: event.target.value }))} />
          <div style={{ height: 10 }} />
          <textarea style={{ ...input, minHeight: 90 }} placeholder="Description" value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} />
          <div style={{ height: 12 }} />
          <button
            style={input}
            disabled={busy || !form.name.trim()}
            onClick={() => void perform(
              () => request("/platform-tenancy/templates", { method: "POST", body: JSON.stringify(form) }),
              "Template registered.",
            )}
          >Register Template</button>
        </div>

        <div style={panel}>
          <h2>Assign Template to Store</h2>
          <select style={input} value={assign.storeId} onChange={(event) => setAssign((value) => ({ ...value, storeId: event.target.value }))}>
            <option value="">Select store</option>
            {stores.map((store) => <option key={store.id} value={store.id}>{store.tenantName} / {store.name}</option>)}
          </select>
          <div style={{ height: 10 }} />
          <select style={input} value={assign.templateId} onChange={(event) => setAssign((value) => ({ ...value, templateId: event.target.value }))}>
            <option value="">Select template</option>
            {catalog.templates.map((template) => <option key={template.id} value={template.id}>{template.name} ({template.slug})</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
            <input type="checkbox" checked={assign.activate} onChange={(event) => setAssign((value) => ({ ...value, activate: event.target.checked }))} />
            Activate immediately (other store templates become available)
          </label>
          <div style={{ height: 12 }} />
          <button
            style={input}
            disabled={busy || !assign.storeId || !assign.templateId}
            onClick={() => void perform(
              () => request("/platform-tenancy/template-assignments", {
                method: "POST",
                body: JSON.stringify({ storeId: assign.storeId, templateId: assign.templateId, isActive: assign.activate }),
              }),
              "Template assigned to store.",
            )}
          >Assign Template</button>
        </div>
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h2>Store Template Assignments</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {stores.map((store) => (
            <article key={store.id} style={{ border: "1px solid rgba(148,163,184,.16)", borderRadius: 12, padding: 14 }}>
              <strong>{store.tenantName} / {store.name}</strong>
              <div style={{ color: "#94a3b8", marginTop: 4 }}>{store.primaryDomain || "No primary domain"}</div>
              {store.templates.length === 0 ? <p style={{ color: "#94a3b8" }}>No templates assigned.</p> : null}
              {store.templates.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center", paddingTop: 12, marginTop: 12, borderTop: "1px solid rgba(148,163,184,.12)" }}>
                  <div>
                    <b>{item.template.name}</b>
                    <div style={{ color: item.isActive ? "#34d399" : "#93c5fd", fontSize: 12 }}>{item.isActive ? "ACTIVE" : "AVAILABLE"} · {item.template.slug}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {!item.isActive ? (
                      <button
                        style={{ ...input, width: "auto", minHeight: 36 }}
                        disabled={busy}
                        onClick={() => void perform(
                          () => request(`/platform-tenancy/template-assignments/${item.id}/activate`, { method: "PATCH" }),
                          `${item.template.name} activated.`,
                        )}
                      >Activate</button>
                    ) : null}
                    {!item.isActive ? (
                      <button
                        style={{ ...input, width: "auto", minHeight: 36 }}
                        disabled={busy}
                        onClick={() => void perform(
                          () => request(`/platform-tenancy/template-assignments/${item.id}`, { method: "DELETE" }),
                          `${item.template.name} removed from store.`,
                        )}
                      >Remove</button>
                    ) : null}
                  </div>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h2>Registered Templates</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
          {catalog.templates.map((template) => (
            <article key={template.id} style={{ border: "1px solid rgba(148,163,184,.16)", borderRadius: 12, padding: 14 }}>
              <strong>{template.name}</strong>
              <div style={{ color: "#93c5fd", fontSize: 12 }}>{template.slug}</div>
              <p style={{ color: "#94a3b8", minHeight: 40 }}>{template.description || "No description"}</p>
              <div style={{ color: template.isActive ? "#34d399" : "#fbbf24", fontSize: 12 }}>{template.isActive ? "CATALOG ACTIVE" : "CATALOG INACTIVE"}</div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>Assigned stores: {template.stores?.length || 0}</div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
