"use client";

import styles from "../saas-management/SaasManagement.module.css";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Domain = {
  id: string;
  hostname: string;
  status: string;
  isPrimary: boolean;
};

type TemplateAssignment = {
  id: string;
  isActive: boolean;
  template: { id: string; name: string; slug: string };
};

type Store = {
  id: string;
  name: string;
  status: string;
  primaryDomain?: string | null;
  domains: Domain[];
  templates: TemplateAssignment[];
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  stores: Store[];
};

type RuntimeCatalog = {
  tenants: Tenant[];
  runtime?: {
    localPort?: number;
    renderClientServiceUrl?: string;
    wildcardBaseDomain?: string;
  };
};

type ProvisionPlan = {
  tenant: { id: string; name: string; slug: string };
  store: { id: string; name: string };
  activeTemplate?: { id: string; name: string; slug: string } | null;
  domains: Domain[];
  local: { hostname: string; url: string; hostsEntry: string };
  render: {
    clientServiceUrl?: string;
    wildcardBaseDomain?: string;
    suggestedProductionHostname?: string;
    suggestedProductionUrl?: string;
    requiredEnvironment: string[];
  };
};

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
    headers: { ...authHeaders(), ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }
  return (body?.data ?? body) as T;
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.18)",
  background: "rgba(15,23,42,.76)",
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

function classifyDomain(hostname: string): string {
  if (hostname.endsWith(".local") || hostname === "localhost") return "LOCAL";
  if (hostname.endsWith(".onrender.com")) return "RENDER";
  if (hostname.includes("preview") || hostname.includes("staging")) return "PREVIEW";
  return "CUSTOM";
}

export default function RuntimeDomainManager() {
  const [catalog, setCatalog] = useState<RuntimeCatalog>({ tenants: [] });
  const [form, setForm] = useState({
    tenantId: "",
    storeId: "",
    hostname: "",
    status: "ACTIVE",
    isPrimary: false,
  });
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [plan, setPlan] = useState<ProvisionPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedTenant = useMemo(
    () => catalog.tenants.find((tenant) => tenant.id === form.tenantId) ?? null,
    [catalog.tenants, form.tenantId],
  );

  const stores = selectedTenant?.stores ?? [];

  const allStores = useMemo(
    () =>
      catalog.tenants.flatMap((tenant) =>
        tenant.stores.map((store) => ({
          ...store,
          tenantId: tenant.id,
          tenantName: tenant.name,
        })),
      ),
    [catalog.tenants],
  );

  const load = useCallback(async () => {
    const data = await request<RuntimeCatalog>("/platform-tenancy/runtime-domains");
    setCatalog({ tenants: data.tenants || [], runtime: data.runtime });
    const firstTenant = data.tenants?.[0];
    const firstStore = firstTenant?.stores?.[0];
    setForm((value) => ({
      ...value,
      tenantId:
        data.tenants?.some((tenant) => tenant.id === value.tenantId)
          ? value.tenantId
          : firstTenant?.id || "",
      storeId:
        firstTenant?.stores?.some((store) => store.id === value.storeId)
          ? value.storeId
          : firstStore?.id || "",
    }));
    const loadedStores = (data.tenants || []).flatMap((tenant) => tenant.stores || []);
    setSelectedStoreId((value) =>
      loadedStores.some((store) => store.id === value)
        ? value
        : firstStore?.id || "",
    );
  }, []);

  useEffect(() => {
    void load().catch((value) =>
      setError(value instanceof Error ? value.message : String(value)),
    );
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

  async function buildPlan(storeId: string) {
    setBusy(true);
    setError("");
    try {
      const data = await request<ProvisionPlan>("/platform-tenancy/domains/provision-plan", {
        method: "POST",
        body: JSON.stringify({ storeId }),
      });
      setPlan(data);
    } catch (value) {
      setError(value instanceof Error ? value.message : String(value));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <header
        className={styles.pageHeader}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <div>
          <p style={{ margin: 0, color: "#67e8f9", letterSpacing: ".14em", fontSize: 12 }}>
            SUPER ADMIN / STOREFRONT RUNTIME
          </p>
          <h1 style={{ margin: "6px 0" }}>Runtime & Domain Provisioning</h1>
          <p style={{ margin: 0, color: "#94a3b8" }}>
            Bind local, Render and custom hostnames to a tenant/store and its active template. DNS/SSL verification metadata is available after the 2026.21 database package is applied.
          </p>
        </div>
        <div className={styles.headerActions} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/system/tenant-management" className={styles.headerAction} style={{ ...input, width: "auto", textDecoration: "none" }}>
            Tenant Management
          </Link>
          <Link href="/system/template-catalog" className={styles.headerAction} style={{ ...input, width: "auto", textDecoration: "none" }}>
            Template Catalog
          </Link>
          <button className={styles.headerAction} style={{ ...input, width: "auto" }} onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
        </div>
      </header>

      {error ? <p className={styles.message} style={{ padding: 12, borderRadius: 10, background: "rgba(127,29,29,.55)" }}>{error}</p> : null}
      {message ? <p style={{ padding: 12, borderRadius: 10, background: "rgba(6,78,59,.55)" }}>{message}</p> : null}

      <section className={styles.primaryGrid} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))", gap: 16 }}>
        <div style={panel}>
          <h2>Add Runtime Domain</h2>
          <select
            style={input}
            value={form.tenantId}
            onChange={(event) => {
              const tenantId = event.target.value;
              const tenant = catalog.tenants.find((item) => item.id === tenantId);
              setForm((value) => ({
                ...value,
                tenantId,
                storeId: tenant?.stores?.[0]?.id || "",
              }));
            }}
          >
            <option value="">Select tenant</option>
            {catalog.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>

          <div style={{ height: 10 }} />

          <select
            style={input}
            value={form.storeId}
            onChange={(event) => setForm((value) => ({ ...value, storeId: event.target.value }))}
          >
            <option value="">Select store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <div style={{ height: 10 }} />

          <input
            style={input}
            placeholder="isra.local or www.isralifestyle.com"
            value={form.hostname}
            onChange={(event) => setForm((value) => ({ ...value, hostname: event.target.value }))}
          />

          <div style={{ height: 10 }} />

          <select
            style={input}
            value={form.status}
            onChange={(event) => setForm((value) => ({ ...value, status: event.target.value }))}
          >
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          <label style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={(event) =>
                setForm((value) => ({ ...value, isPrimary: event.target.checked }))
              }
            />
            Make this the primary hostname
          </label>

          <div style={{ height: 12 }} />

          <button
            style={input}
            disabled={busy || !form.tenantId || !form.storeId || !form.hostname.trim()}
            onClick={() =>
              void perform(
                () =>
                  request("/platform-tenancy/domains", {
                    method: "POST",
                    body: JSON.stringify(form),
                  }),
                "Runtime domain saved.",
              )
            }
          >
            Save Domain
          </button>
        </div>

        <div style={panel}>
          <h2>Generate Setup Plan</h2>
          <select
            style={input}
            value={selectedStoreId}
            onChange={(event) => setSelectedStoreId(event.target.value)}
          >
            <option value="">Select store</option>
            {allStores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.tenantName} / {store.name}
              </option>
            ))}
          </select>
          <div style={{ height: 12 }} />
          <button
            style={input}
            disabled={busy || !selectedStoreId}
            onClick={() => void buildPlan(selectedStoreId)}
          >
            Build Runtime Setup Plan
          </button>

          {plan ? (
            <div style={{ marginTop: 16, color: "#cbd5e1", lineHeight: 1.65 }}>
              <div><b>Store:</b> {plan.tenant.name} / {plan.store.name}</div>
              <div><b>Active template:</b> {plan.activeTemplate?.name || "Not assigned"}</div>
              <div><b>Local URL:</b> <a href={plan.local.url} target="_blank" rel="noreferrer" style={{ color: "#67e8f9" }}>{plan.local.url}</a></div>
              <div><b>Hosts entry:</b> <code>{plan.local.hostsEntry}</code></div>
              <div><b>Render service:</b> {plan.render.clientServiceUrl || "Set CLIENT_PUBLIC_URL"}</div>
              <div><b>Wildcard:</b> {plan.render.wildcardBaseDomain || "Optional / not configured"}</div>
              <div><b>Suggested production:</b> {plan.render.suggestedProductionUrl || "Add a wildcard base domain first"}</div>
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h2>Tenant / Store Runtime Bindings</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 14 }}>
          {allStores.map((store) => {
            const activeTemplate = store.templates.find((item) => item.isActive)?.template;
            return (
              <article key={store.id} style={{ border: "1px solid rgba(148,163,184,.16)", borderRadius: 12, padding: 14 }}>
                <strong>{store.tenantName} / {store.name}</strong>
                <div style={{ color: "#94a3b8", marginTop: 4 }}>
                  Active template: {activeTemplate?.name || "Not assigned"}
                </div>
                {store.domains.length === 0 ? (
                  <p style={{ color: "#fbbf24" }}>No runtime domain configured.</p>
                ) : null}

                {store.domains.map((domain) => (
                  <div
                    key={domain.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      gap: 10,
                      paddingTop: 12,
                      marginTop: 12,
                      borderTop: "1px solid rgba(148,163,184,.12)",
                    }}
                  >
                    <div>
                      <a
                        href={`https://${domain.hostname}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#67e8f9" }}
                      >
                        {domain.hostname}
                      </a>
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>
                        {classifyDomain(domain.hostname)} · {domain.status} · {domain.isPrimary ? "PRIMARY" : "ADDITIONAL"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!domain.isPrimary ? (
                        <button
                          style={{ ...input, width: "auto", minHeight: 36 }}
                          disabled={busy}
                          onClick={() =>
                            void perform(
                              () =>
                                request(`/platform-tenancy/domains/${domain.id}`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ isPrimary: true }),
                                }),
                              `${domain.hostname} is now primary.`,
                            )
                          }
                        >
                          Make Primary
                        </button>
                      ) : null}
                      <button
                        style={{ ...input, width: "auto", minHeight: 36 }}
                        disabled={busy}
                        onClick={() =>
                          void perform(
                            () =>
                              request(`/platform-tenancy/domains/${domain.id}`, {
                                method: "DELETE",
                              }),
                            `${domain.hostname} removed.`,
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
