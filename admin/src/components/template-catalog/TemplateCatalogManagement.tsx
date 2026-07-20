"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "../saas-management/SaasManagement.module.css";

type Template = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  previewUrl?: string | null;
  isActive: boolean;
};

type Assignment = {
  id: string;
  isActive: boolean;
  template: Template;
};

type Store = {
  id: string;
  name: string;
  status: string;
  storefrontEnabled?: boolean;
  primaryDomain?: string | null;
  tenant?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  templates: Assignment[];
  domains?: Array<{
    id: string;
    hostname: string;
    status: string;
    isPrimary: boolean;
  }>;
};

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  storefrontEnabled?: boolean;
  stores: Store[];
};

type RegistryEntry = {
  id: string;
  template_id?: string | null;
  slug: string;
  registry_key: string;
  name: string;
  source_type: string;
  version: string;
  vendor: string;
  engine: string;
  code_path?: string | null;
  health: string;
  status: string;
  last_synced_at?: string | null;
};

type RegistryResponse = {
  templates?: Template[];
  registry?: RegistryEntry[];
  stores?: Store[];
  builtIns?: unknown[];
  catalog?: {
    tenants?: Tenant[];
    templates?: Template[];
  };
};

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

function authHeaders(): HeadersInit {
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
    headers: {
      ...authHeaders(),
      ...(init?.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return (body?.data ?? body) as T;
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.18)",
  background: "rgba(15,23,42,.72)",
  borderRadius: 16,
  padding: 18,
  minWidth: 0,
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

const compactButton: React.CSSProperties = {
  ...input,
  width: "auto",
  minHeight: 36,
  padding: "7px 10px",
  fontSize: 12,
};

function normalizeStores(data: RegistryResponse): Store[] {
  if (Array.isArray(data.stores)) {
    return data.stores;
  }

  return (data.catalog?.tenants || []).flatMap((tenant) =>
    (tenant.stores || []).map((store) => ({
      ...store,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        status: tenant.status,
      },
    })),
  );
}

export default function TemplateCatalogManagement(): React.ReactElement {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [registry, setRegistry] = useState<RegistryEntry[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    previewUrl: "",
  });
  const [assign, setAssign] = useState({
    storeId: "",
    templateId: "",
    activate: false,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedStore = useMemo(
    () => stores.find((store) => store.id === assign.storeId) || null,
    [assign.storeId, stores],
  );

  const load = useCallback(async () => {
    setError("");

    const data = await request<RegistryResponse>(
      "/template-lifecycle/registry",
    );

    setTemplates(
      Array.isArray(data.templates)
        ? data.templates
        : data.catalog?.templates || [],
    );
    setRegistry(Array.isArray(data.registry) ? data.registry : []);
    setStores(normalizeStores(data));
  }, []);

  useEffect(() => {
    void load().catch((value) =>
      setError(value instanceof Error ? value.message : String(value)),
    );
  }, [load]);

  async function perform(
    action: () => Promise<unknown>,
    success: string,
  ): Promise<void> {
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

  async function syncTemplates(): Promise<void> {
    await perform(
      () =>
        request("/template-lifecycle/sync", {
          method: "POST",
        }),
      "Code registry and database template catalog synchronized.",
    );
  }

  async function runHealth(slug: string): Promise<void> {
    await perform(
      () =>
        request(`/template-lifecycle/health/${slug}`, {
          method: "POST",
        }),
      `${slug} health check completed.`,
    );
  }

  async function runCertification(
    slug: string,
    storeId?: string,
  ): Promise<void> {
    await perform(
      () =>
        request(`/template-lifecycle/templates/${slug}/certify`, {
          method: "POST",
          body: JSON.stringify({
            storeId,
            gates: [],
            report: {
              source: "TEMPLATE_CATALOG_BASELINE",
              note:
                "Build, responsive, visual, API and security evidence must be supplied by certification tooling.",
            },
          }),
        }),
      `${slug} baseline certification evaluated.`,
    );
  }

  async function assignTemplate(): Promise<void> {
    await perform(
      () =>
        request("/platform-tenancy/template-assignments", {
          method: "POST",
          body: JSON.stringify({
            storeId: assign.storeId,
            templateId: assign.templateId,
            isActive: assign.activate,
          }),
        }),
      assign.activate
        ? "Template assigned and activated."
        : "Template assigned to store.",
    );
  }

  async function activateAssignment(assignmentId: string): Promise<void> {
    await perform(
      () =>
        request(
          `/template-lifecycle/activate/${assignmentId}`,
          { method: "PATCH" },
        ),
      "Active template switched successfully.",
    );
  }

  async function rollbackStore(storeId: string): Promise<void> {
    await perform(
      () =>
        request(`/template-lifecycle/rollback/${storeId}`, {
          method: "POST",
        }),
      "Previous active template restored.",
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <p
            style={{
              margin: 0,
              color: "#67e8f9",
              letterSpacing: ".14em",
              fontSize: 12,
            }}
          >
            SUPER ADMIN / TENANT RUNTIME BINDING
          </p>
          <h1 style={{ margin: "6px 0" }}>
            Template Registry & Runtime · 2026.33.2.1 LTS
          </h1>
          <p style={{ margin: 0, color: "#94a3b8" }}>
            Bind tenants and stores to registered templates and enforce exactly
            one active runtime template per store.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.headerAction}
            style={compactButton}
            disabled={busy}
            onClick={() => void syncTemplates()}
          >
            Sync Code Templates
          </button>

          <button
            className={styles.headerAction}
            style={compactButton}
            disabled={busy}
            onClick={() => void load()}
          >
            Refresh
          </button>

          <Link
            href="/system/tenant-management"
            className={styles.headerAction}
            style={{ ...compactButton, textDecoration: "none" }}
          >
            Tenant Management
          </Link>

          <Link
            href="/system/runtime-domain"
            className={styles.headerAction}
            style={{ ...compactButton, textDecoration: "none" }}
          >
            Runtime & Domains
          </Link>
        </div>
      </header>

      {error ? (
        <p
          className={styles.message}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "rgba(127,29,29,.55)",
          }}
        >
          {error}
        </p>
      ) : null}

      {message ? (
        <p
          className={styles.message}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "rgba(6,78,59,.55)",
          }}
        >
          {message}
        </p>
      ) : null}

      <section
        className={styles.primaryGrid}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,320px),1fr))",
          gap: 16,
        }}
      >
        <div style={panel}>
          <h2>Register Template</h2>

          <input
            style={input}
            placeholder="Template name"
            value={form.name}
            onChange={(event) =>
              setForm((value) => ({ ...value, name: event.target.value }))
            }
          />

          <div style={{ height: 10 }} />

          <input
            style={input}
            placeholder="template-slug"
            value={form.slug}
            onChange={(event) =>
              setForm((value) => ({ ...value, slug: event.target.value }))
            }
          />

          <div style={{ height: 10 }} />

          <input
            style={input}
            placeholder="Preview URL (optional)"
            value={form.previewUrl}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                previewUrl: event.target.value,
              }))
            }
          />

          <div style={{ height: 10 }} />

          <textarea
            style={{ ...input, minHeight: 90 }}
            placeholder="Description"
            value={form.description}
            onChange={(event) =>
              setForm((value) => ({
                ...value,
                description: event.target.value,
              }))
            }
          />

          <div style={{ height: 12 }} />

          <button
            style={input}
            disabled={busy || !form.name.trim() || !form.slug.trim()}
            onClick={() =>
              void perform(
                () =>
                  request("/platform-tenancy/templates", {
                    method: "POST",
                    body: JSON.stringify(form),
                  }),
                "Template registered.",
              )
            }
          >
            Register Template
          </button>
        </div>

        <div style={panel}>
          <h2>Assign Template to Store</h2>

          <select
            style={input}
            value={assign.storeId}
            onChange={(event) =>
              setAssign((value) => ({
                ...value,
                storeId: event.target.value,
              }))
            }
          >
            <option value="">Select store</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.tenant?.name || "Unassigned Tenant"} / {store.name}
              </option>
            ))}
          </select>

          <div style={{ height: 10 }} />

          <select
            style={input}
            value={assign.templateId}
            onChange={(event) =>
              setAssign((value) => ({
                ...value,
                templateId: event.target.value,
              }))
            }
          >
            <option value="">Select template</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} ({template.slug})
              </option>
            ))}
          </select>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 14,
            }}
          >
            <input
              type="checkbox"
              checked={assign.activate}
              onChange={(event) =>
                setAssign((value) => ({
                  ...value,
                  activate: event.target.checked,
                }))
              }
            />
            Activate immediately
          </label>

          <div style={{ height: 12 }} />

          <button
            style={input}
            disabled={busy || !assign.storeId || !assign.templateId}
            onClick={() => void assignTemplate()}
          >
            Assign Template
          </button>

          {selectedStore ? (
            <p style={{ color: "#94a3b8", fontSize: 12 }}>
              Runtime domain:{" "}
              {selectedStore.domains?.find((domain) => domain.isPrimary)
                ?.hostname ||
                selectedStore.primaryDomain ||
                selectedStore.domains?.[0]?.hostname ||
                "Not configured"}
            </p>
          ) : null}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h2>Registry</h2>

        <div className={styles.dataGrid}>
          {registry.map((item) => (
            <article key={item.id} style={panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <strong>{item.name}</strong>
                <span>{item.health}</span>
              </div>

              <p
                style={{
                  color: "#93c5fd",
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                {item.slug} · {item.source_type} · v{item.version}
              </p>

              <p
                style={{
                  color: "#94a3b8",
                  overflowWrap: "anywhere",
                }}
              >
                {item.code_path || "Imported template ownership"}
              </p>

              <button
                style={compactButton}
                disabled={busy}
                onClick={() => void runHealth(item.slug)}
              >
                Run Health Check
              </button>
              <button
                style={{ ...compactButton, marginLeft: 8 }}
                disabled={busy}
                onClick={() => void runCertification(item.slug)}
              >
                Run Certification
              </button>
            </article>
          ))}
        </div>
      </section>

      <section style={{ ...panel, marginTop: 16 }}>
        <h2>Store Template Assignments</h2>

        <div className={styles.dataGrid}>
          {stores.map((store) => {
            const activeAssignments = store.templates.filter(
              (assignment) => assignment.isActive,
            );
            const domain =
              store.domains?.find((item) => item.isPrimary)?.hostname ||
              store.primaryDomain ||
              store.domains?.[0]?.hostname ||
              "No runtime domain";

            return (
              <article key={store.id} style={panel}>
                <strong>
                  {store.tenant?.name || "Unassigned Tenant"} / {store.name}
                </strong>

                <p style={{ color: "#94a3b8" }}>{domain}</p>

                <p
                  style={{
                    color:
                      activeAssignments.length === 1 ? "#34d399" : "#fbbf24",
                    fontSize: 12,
                  }}
                >
                  Active runtime templates: {activeAssignments.length}
                </p>

                {store.templates.length === 0 ? (
                  <p style={{ color: "#fbbf24" }}>No templates assigned.</p>
                ) : null}

                {store.templates.map((assignment) => (
                  <div
                    key={assignment.id}
                    style={{
                      borderTop: "1px solid rgba(148,163,184,.14)",
                      paddingTop: 10,
                      marginTop: 10,
                    }}
                  >
                    <b>{assignment.template.name}</b>
                    <div
                      style={{
                        color: assignment.isActive ? "#34d399" : "#93c5fd",
                        fontSize: 12,
                      }}
                    >
                      {assignment.isActive ? "ACTIVE" : "AVAILABLE"} ·{" "}
                      {assignment.template.slug}
                    </div>

                    {!assignment.isActive ? (
                      <button
                        style={{ ...compactButton, marginTop: 8 }}
                        disabled={busy}
                        onClick={() =>
                          void activateAssignment(assignment.id)
                        }
                      >
                        Activate
                      </button>
                    ) : null}
                  </div>
                ))}

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <Link
                    href="/system/runtime-domain"
                    style={{ ...compactButton, textDecoration: "none" }}
                  >
                    Manage Domain
                  </Link>

                  <button
                    style={compactButton}
                    disabled={busy}
                    onClick={() => void rollbackStore(store.id)}
                  >
                    Rollback
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
