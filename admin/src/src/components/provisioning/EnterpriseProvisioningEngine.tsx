"use client";

import { useCallback, useMemo, useState } from "react";

type TenantRecord = {
  id: string;
  name: string;
  slug: string;
  stores?: StoreRecord[];
};

type StoreRecord = {
  id: string;
  name: string;
  tenantId?: string;
  primaryDomain?: string | null;
  templates?: Array<{
    id: string;
    isActive: boolean;
    template: TemplateRecord;
  }>;
};

type TemplateRecord = {
  id: string;
  name: string;
  slug: string;
};

type StoreUser = {
  id: string;
  email: string;
  role: "ADMIN" | "MANAGER";
  tenantId?: string | null;
  storeId?: string | null;
};

type CatalogResponse = {
  tenants: TenantRecord[];
  templates: TemplateRecord[];
};

type ProvisionStep = {
  key: string;
  label: string;
  status: "PENDING" | "RUNNING" | "PASS" | "REUSED" | "FAILED";
  detail?: string;
};

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function requestHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: { ...requestHeaders(), ...(init?.headers || {}) },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }

  return (body?.data ?? body) as T;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hostname(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.2)",
  borderRadius: 16,
  background: "rgba(15,23,42,.76)",
  padding: 18,
};

const field: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(148,163,184,.24)",
  background: "#08111f",
  color: "#eef6ff",
};

const initialSteps: ProvisionStep[] = [
  { key: "tenant", label: "Tenant", status: "PENDING" },
  { key: "store", label: "Store", status: "PENDING" },
  { key: "template", label: "Template registration", status: "PENDING" },
  { key: "assignment", label: "Template assignment", status: "PENDING" },
  { key: "domain", label: "Runtime domain", status: "PENDING" },
  { key: "admin", label: "Store Admin", status: "PENDING" },
  { key: "manager", label: "Store Manager", status: "PENDING" },
  { key: "certify", label: "Provisioning certification", status: "PENDING" },
];

export default function EnterpriseProvisioningEngine() {
  const [tenantName, setTenantName] = useState("ISRA LIFESTYLE");
  const [tenantSlug, setTenantSlug] = useState("isra-lifestyle");
  const [storeName, setStoreName] = useState("ISRA");
  const [templateName, setTemplateName] = useState("ISRA Imported Client");
  const [templateKey, setTemplateKey] = useState("isra-client-import-v3");
  const [runtimeHostname, setRuntimeHostname] = useState("isra.local");
  const [adminName, setAdminName] = useState("ISRA Store Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [managerName, setManagerName] = useState("ISRA Store Manager");
  const [managerEmail, setManagerEmail] = useState("");
  const [managerPassword, setManagerPassword] = useState("");
  const [activateTemplate, setActivateTemplate] = useState(true);
  const [primaryDomain, setPrimaryDomain] = useState(true);
  const [steps, setSteps] = useState<ProvisionStep[]>(initialSteps);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const ready = useMemo(
    () =>
      Boolean(
        tenantName.trim() &&
          tenantSlug.trim() &&
          storeName.trim() &&
          templateName.trim() &&
          templateKey.trim() &&
          runtimeHostname.trim() &&
          adminName.trim() &&
          adminEmail.trim() &&
          adminPassword &&
          managerName.trim() &&
          managerEmail.trim() &&
          managerPassword,
      ),
    [
      adminEmail,
      adminName,
      adminPassword,
      managerEmail,
      managerName,
      managerPassword,
      runtimeHostname,
      storeName,
      templateKey,
      templateName,
      tenantName,
      tenantSlug,
    ],
  );

  const updateStep = useCallback(
    (key: string, status: ProvisionStep["status"], detail?: string) => {
      setSteps((current) =>
        current.map((step) => (step.key === key ? { ...step, status, detail } : step)),
      );
    },
    [],
  );

  async function provisionUser(
    role: "ADMIN" | "MANAGER",
    values: { name: string; email: string; password: string },
    tenantId: string,
    storeId: string,
    users: StoreUser[],
  ) {
    const existing = users.find(
      (user) => user.email.toLowerCase() === values.email.trim().toLowerCase(),
    );

    if (existing) {
      return {
        reused: true,
        data: await api<StoreUser>(`/platform-tenancy/store-users/${existing.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: values.name,
            password: values.password,
            role,
            tenantId,
            storeId,
          }),
        }),
      };
    }

    return {
      reused: false,
      data: await api<StoreUser>("/platform-tenancy/store-users", {
        method: "POST",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role,
          tenantId,
          storeId,
        }),
      }),
    };
  }

  async function runProvisioning() {
    if (!ready || busy) return;

    setBusy(true);
    setError("");
    setResult(null);
    setSteps(initialSteps);

    try {
      const catalog = await api<CatalogResponse>("/platform-tenancy/catalog");

      updateStep("tenant", "RUNNING");
      let tenant = catalog.tenants.find(
        (item) => item.slug === slugify(tenantSlug) || item.name.toLowerCase() === tenantName.trim().toLowerCase(),
      );

      if (!tenant) {
        tenant = await api<TenantRecord>("/platform-tenancy/tenants", {
          method: "POST",
          body: JSON.stringify({
            name: tenantName,
            slug: slugify(tenantSlug),
            status: "ACTIVE",
            storefrontEnabled: true,
          }),
        });
        updateStep("tenant", "PASS", `Created ${tenant.name}`);
      } else {
        tenant = await api<TenantRecord>(`/platform-tenancy/tenants/${tenant.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: tenantName,
            slug: slugify(tenantSlug),
            status: "ACTIVE",
            storefrontEnabled: true,
          }),
        });
        updateStep("tenant", "REUSED", `Reused ${tenant.name}`);
      }

      updateStep("store", "RUNNING");
      const refreshed = await api<CatalogResponse>("/platform-tenancy/catalog");
      let store = refreshed.tenants
        .find((item) => item.id === tenant.id)
        ?.stores?.find((item) => item.name.toLowerCase() === storeName.trim().toLowerCase());

      if (!store) {
        store = await api<StoreRecord>("/platform-tenancy/stores", {
          method: "POST",
          body: JSON.stringify({
            tenantId: tenant.id,
            name: storeName,
            status: "ACTIVE",
            storefrontEnabled: true,
            primaryDomain: primaryDomain ? hostname(runtimeHostname) : null,
          }),
        });
        updateStep("store", "PASS", `Created ${store.name}`);
      } else {
        store = await api<StoreRecord>(`/platform-tenancy/stores/${store.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            tenantId: tenant.id,
            name: storeName,
            status: "ACTIVE",
            storefrontEnabled: true,
            primaryDomain: primaryDomain ? hostname(runtimeHostname) : store.primaryDomain,
          }),
        });
        updateStep("store", "REUSED", `Reused ${store.name}`);
      }

      updateStep("template", "RUNNING");
      const templateSlug = slugify(templateKey);
      const latestCatalog = await api<CatalogResponse>("/platform-tenancy/catalog");
      let template = latestCatalog.templates.find((item) => item.slug === templateSlug);

      if (!template) {
        template = await api<TemplateRecord>("/platform-tenancy/templates", {
          method: "POST",
          body: JSON.stringify({
            name: templateName,
            slug: templateSlug,
            description: `Provisioned by SAQSO AI Migrator 2026.23 for ${tenant.name}/${store.name}`,
            isActive: true,
          }),
        });
        updateStep("template", "PASS", `Registered ${template.name}`);
      } else {
        template = await api<TemplateRecord>(`/platform-tenancy/templates/${template.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: templateName,
            slug: templateSlug,
            isActive: true,
          }),
        });
        updateStep("template", "REUSED", `Reused ${template.name}`);
      }

      updateStep("assignment", "RUNNING");
      const assignment = await api<Record<string, unknown>>(
        "/platform-tenancy/template-assignments",
        {
          method: "POST",
          body: JSON.stringify({
            storeId: store.id,
            templateId: template.id,
            isActive: activateTemplate,
          }),
        },
      );
      updateStep(
        "assignment",
        "PASS",
        activateTemplate ? "Assigned and activated" : "Assigned as available",
      );

      updateStep("domain", "RUNNING");
      let domain: Record<string, unknown> | null = null;
      try {
        domain = await api<Record<string, unknown>>("/platform-tenancy/domains", {
          method: "POST",
          body: JSON.stringify({
            tenantId: tenant.id,
            storeId: store.id,
            hostname: hostname(runtimeHostname),
            status: "ACTIVE",
            isPrimary: primaryDomain,
          }),
        });
        updateStep("domain", "PASS", hostname(runtimeHostname));
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : String(reason);
        if (/already|unique|exists/i.test(message)) {
          updateStep("domain", "REUSED", hostname(runtimeHostname));
        } else {
          throw reason;
        }
      }

      const users = await api<StoreUser[]>("/platform-tenancy/store-users");

      updateStep("admin", "RUNNING");
      const admin = await provisionUser(
        "ADMIN",
        { name: adminName, email: adminEmail, password: adminPassword },
        tenant.id,
        store.id,
        users,
      );
      updateStep("admin", admin.reused ? "REUSED" : "PASS", admin.data.email);

      updateStep("manager", "RUNNING");
      const manager = await provisionUser(
        "MANAGER",
        { name: managerName, email: managerEmail, password: managerPassword },
        tenant.id,
        store.id,
        users,
      );
      updateStep("manager", manager.reused ? "REUSED" : "PASS", manager.data.email);

      updateStep("certify", "RUNNING");
      const certification = await api<CatalogResponse>("/platform-tenancy/catalog");
      const certifiedTenant = certification.tenants.find((item) => item.id === tenant.id);
      const certifiedStore = certifiedTenant?.stores?.find((item) => item.id === store.id);

      if (!certifiedTenant || !certifiedStore) {
        throw new Error("Provisioning certification failed: tenant/store could not be reloaded.");
      }

      updateStep("certify", "PASS", "Tenant/store catalog reflects the provisioning result");
      setResult({
        tenant,
        store,
        template,
        assignment,
        domain,
        admin: admin.data,
        manager: manager.data,
        localUrl: `http://${hostname(runtimeHostname)}:3000`,
        productionUrl: hostname(runtimeHostname).endsWith(".local")
          ? null
          : `https://${hostname(runtimeHostname)}`,
      });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : String(reason);
      setError(message);
      setSteps((current) =>
        current.map((step) =>
          step.status === "RUNNING" ? { ...step, status: "FAILED", detail: message } : step,
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020817", color: "#eef6ff", padding: 24 }}>
      <p style={{ color: "#43d7ff", letterSpacing: ".14em", fontSize: 12, fontWeight: 800 }}>
        SUPER ADMIN / ENTERPRISE PROVISIONING
      </p>
      <h1 style={{ margin: "8px 0" }}>SAQSO AI Migrator 2026.23</h1>
      <p style={{ color: "#9fb0c8", maxWidth: 980 }}>
        Provision or reuse a Tenant, Store, imported Template, Runtime Domain, Store Admin and
        Store Manager through one idempotent workflow. Existing records are updated and reused
        instead of duplicated.
      </p>

      {error ? (
        <section style={{ ...panel, marginTop: 16, borderColor: "#ef4444", color: "#fecaca" }}>
          {error}
        </section>
      ) : null}

      <section style={{ ...panel, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>1. Tenant, Store, Template & Domain</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
          <input style={field} value={tenantName} onChange={(event) => setTenantName(event.target.value)} placeholder="Tenant name" />
          <input style={field} value={tenantSlug} onChange={(event) => setTenantSlug(event.target.value)} placeholder="tenant-slug" />
          <input style={field} value={storeName} onChange={(event) => setStoreName(event.target.value)} placeholder="Store name" />
          <input style={field} value={templateName} onChange={(event) => setTemplateName(event.target.value)} placeholder="Template display name" />
          <input style={field} value={templateKey} onChange={(event) => setTemplateKey(event.target.value)} placeholder="template-key" />
          <input style={field} value={runtimeHostname} onChange={(event) => setRuntimeHostname(event.target.value)} placeholder="isra.local or www.example.com" />
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 14 }}>
          <label><input type="checkbox" checked={activateTemplate} onChange={(event) => setActivateTemplate(event.target.checked)} /> Activate template</label>
          <label><input type="checkbox" checked={primaryDomain} onChange={(event) => setPrimaryDomain(event.target.checked)} /> Make hostname primary</label>
        </div>
      </section>

      <section style={{ ...panel, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>2. Store Admin & Manager</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 12 }}>
          <input style={field} value={adminName} onChange={(event) => setAdminName(event.target.value)} placeholder="Admin name" />
          <input style={field} value={adminEmail} onChange={(event) => setAdminEmail(event.target.value)} placeholder="Admin email" type="email" />
          <input style={field} value={adminPassword} onChange={(event) => setAdminPassword(event.target.value)} placeholder="Admin temporary password" type="password" />
          <input style={field} value={managerName} onChange={(event) => setManagerName(event.target.value)} placeholder="Manager name" />
          <input style={field} value={managerEmail} onChange={(event) => setManagerEmail(event.target.value)} placeholder="Manager email" type="email" />
          <input style={field} value={managerPassword} onChange={(event) => setManagerPassword(event.target.value)} placeholder="Manager temporary password" type="password" />
        </div>
      </section>

      <section style={{ ...panel, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>3. Execution Plan</h2>
        <div style={{ display: "grid", gap: 9 }}>
          {steps.map((step, index) => (
            <div
              key={step.key}
              style={{
                display: "grid",
                gridTemplateColumns: "36px minmax(180px,1fr) auto",
                gap: 10,
                alignItems: "center",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,.15)",
              }}
            >
              <b>{index + 1}</b>
              <div>
                <strong>{step.label}</strong>
                {step.detail ? <div style={{ color: "#93a7c2", fontSize: 12, marginTop: 3 }}>{step.detail}</div> : null}
              </div>
              <span
                style={{
                  color:
                    step.status === "PASS" || step.status === "REUSED"
                      ? "#6ee7b7"
                      : step.status === "FAILED"
                        ? "#fca5a5"
                        : step.status === "RUNNING"
                          ? "#67e8f9"
                          : "#94a3b8",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {step.status}
              </span>
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={!ready || busy}
          onClick={() => void runProvisioning()}
          style={{
            marginTop: 16,
            minHeight: 48,
            padding: "0 22px",
            border: 0,
            borderRadius: 11,
            background: "linear-gradient(90deg,#6d3df5,#12b8d4)",
            color: "white",
            fontWeight: 900,
            opacity: ready && !busy ? 1 : .55,
            cursor: ready && !busy ? "pointer" : "not-allowed",
          }}
        >
          {busy ? "Provisioning…" : "Provision Enterprise Store"}
        </button>
      </section>

      {result ? (
        <section style={{ ...panel, marginTop: 18, borderColor: "rgba(16,185,129,.45)" }}>
          <h2 style={{ marginTop: 0 }}>Provisioning PASS</h2>
          <pre style={{ whiteSpace: "pre-wrap", color: "#bdebd8", overflowWrap: "anywhere" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </section>
      ) : null}
    </main>
  );
}
