"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Store = { id: string; name: string; status: string };
type Tenant = { id: string; name: string; slug: string; stores: Store[] };
type Catalog = { tenants: Tenant[] };
type PermissionDefinition = {
  key: string;
  label: string;
  group: string;
  roles: Array<"ADMIN" | "MANAGER">;
};
type PermissionData = {
  catalog: PermissionDefinition[];
  presets: { ADMIN: string[]; MANAGER: string[] };
};
type StoreUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER";
  permissions?: string[] | null;
  tenantId?: string | null;
  storeId?: string | null;
  tenant?: { id: string; name: string; slug: string } | null;
  store?: { id: string; name: string; status: string } | null;
  createdAt: string;
};

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

function headers(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    credentials: "include",
    headers: { ...headers(), ...(init?.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || `Request failed: ${response.status}`);
  return (body?.data ?? body) as T;
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,.2)",
  background: "rgba(15,23,42,.78)",
  borderRadius: 16,
  padding: 18,
};
const field: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  border: "1px solid rgba(148,163,184,.25)",
  borderRadius: 10,
  background: "#08111f",
  color: "#eef6ff",
  padding: "10px 12px",
};

export default function StoreUserManagement() {
  const [catalog, setCatalog] = useState<Catalog>({ tenants: [] });
  const [permissionData, setPermissionData] = useState<PermissionData>({
    catalog: [],
    presets: { ADMIN: [], MANAGER: [] },
  });
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [tenantId, setTenantId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MANAGER">("ADMIN");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedTenant = useMemo(
    () => catalog.tenants.find((tenant) => tenant.id === tenantId) ?? null,
    [catalog.tenants, tenantId],
  );

  const rolePermissions = useMemo(
    () => permissionData.catalog.filter((permission) => permission.roles.includes(role)),
    [permissionData.catalog, role],
  );

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, PermissionDefinition[]>();
    for (const permission of rolePermissions) {
      groups.set(permission.group, [...(groups.get(permission.group) ?? []), permission]);
    }
    return [...groups.entries()];
  }, [rolePermissions]);

  const load = useCallback(async () => {
    try {
      setError("");
      const [nextCatalog, nextUsers, nextPermissions] = await Promise.all([
        request<Catalog>("/platform-tenancy/catalog"),
        request<StoreUser[]>("/platform-tenancy/store-users"),
        request<PermissionData>("/platform-tenancy/store-permissions"),
      ]);
      setCatalog(nextCatalog);
      setUsers(nextUsers);
      setPermissionData(nextPermissions);
      setPermissions((current) => current.length ? current : nextPermissions.presets.ADMIN);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPermissions(permissionData.presets[role] ?? []);
  }, [permissionData.presets, role]);

  function togglePermission(key: string) {
    setPermissions((current) =>
      current.includes(key)
        ? current.filter((permission) => permission !== key)
        : [...current, key],
    );
  }

  async function createUser() {
    try {
      setError("");
      setMessage("");
      await request("/platform-tenancy/store-users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          tenantId,
          storeId,
          permissions,
        }),
      });
      setMessage(`${role} account created with ${permissions.length} store permissions.`);
      setName("");
      setEmail("");
      setPassword("");
      setPermissions(permissionData.presets[role] ?? []);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }

  const ready = Boolean(name.trim() && email.trim() && password && tenantId && storeId && permissions.length);

  return (
    <main style={{ padding: 24, color: "#eef6ff", background: "#020817", minHeight: "100vh" }}>
      <p style={{ color: "#39d5ff", letterSpacing: ".14em", fontWeight: 800, fontSize: 12 }}>
        SUPER ADMIN / STORE USERS / PERMISSIONS
      </p>
      <h1 style={{ margin: "8px 0" }}>Enterprise Store User & Permission Automation</h1>
      <p style={{ color: "#9baec8", maxWidth: 900 }}>
        Provision one store-scoped ADMIN or MANAGER account, apply a safe role preset,
        then customize feature access. The unified dashboard and sidebar use the saved
        permission list while every account remains bound to one tenant and one store.
      </p>

      {error ? <div style={{ ...panel, borderColor: "#ef4444", color: "#fecaca", marginTop: 16 }}>{error}</div> : null}
      {message ? <div style={{ ...panel, borderColor: "#10b981", color: "#a7f3d0", marginTop: 16 }}>{message}</div> : null}

      <section style={{ ...panel, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Create Store User</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <select value={tenantId} onChange={(event) => { setTenantId(event.target.value); setStoreId(""); }} style={field}>
            <option value="">Select tenant</option>
            {catalog.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
          </select>
          <select value={storeId} onChange={(event) => setStoreId(event.target.value)} style={field} disabled={!selectedTenant}>
            <option value="">Select store</option>
            {(selectedTenant?.stores ?? []).map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
          </select>
          <select value={role} onChange={(event) => setRole(event.target.value as "ADMIN" | "MANAGER")} style={field}>
            <option value="ADMIN">Store Admin</option>
            <option value="MANAGER">Store Manager</option>
          </select>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" style={field} />
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" style={field} />
          <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Temporary password" type="password" style={field} />
        </div>

        <div style={{ marginTop: 18, borderTop: "1px solid rgba(148,163,184,.16)", paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h3 style={{ margin: 0 }}>Permission preset: {role}</h3>
              <p style={{ color: "#9baec8", margin: "6px 0 0" }}>
                Defaults are role-safe. Uncheck only the capabilities this user must not access.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPermissions(permissionData.presets[role] ?? [])}
              style={{ ...field, width: "auto", cursor: "pointer" }}
            >
              Reset {role} preset
            </button>
          </div>

          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {groupedPermissions.map(([group, definitions]) => (
              <section key={group} style={{ border: "1px solid rgba(148,163,184,.14)", borderRadius: 12, padding: 12 }}>
                <b>{group}</b>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 8, marginTop: 10 }}>
                  {definitions.map((permission) => (
                    <label key={permission.key} style={{ display: "flex", gap: 9, alignItems: "center", color: "#cbd8eb" }}>
                      <input
                        type="checkbox"
                        checked={permissions.includes(permission.key)}
                        onChange={() => togglePermission(permission.key)}
                      />
                      <span>{permission.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={() => void createUser()}
          style={{
            marginTop: 16,
            minHeight: 44,
            padding: "0 18px",
            borderRadius: 10,
            border: 0,
            color: "white",
            fontWeight: 800,
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : .55,
            background: "linear-gradient(90deg,#6d3df5,#12b8d4)",
          }}
        >
          Create {role === "ADMIN" ? "Store Admin" : "Store Manager"}
        </button>
      </section>

      <section style={{ ...panel, marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Current Store Users</h2>
          <button type="button" onClick={() => void load()} style={{ ...field, width: "auto", cursor: "pointer" }}>Refresh</button>
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {users.length ? users.map((user) => (
            <article key={user.id} style={{ border: "1px solid rgba(148,163,184,.16)", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong>{user.name}</strong>
                  <div style={{ color: "#9baec8", marginTop: 4 }}>{user.email}</div>
                </div>
                <b style={{ color: user.role === "ADMIN" ? "#38bdf8" : "#34d399" }}>{user.role}</b>
              </div>
              <div style={{ color: "#9baec8", marginTop: 10 }}>
                {user.tenant?.name ?? "No tenant"} → {user.store?.name ?? "No store"}
              </div>
              <div style={{ color: "#7dd3fc", marginTop: 8, fontSize: 12 }}>
                {(Array.isArray(user.permissions) ? user.permissions.length : 0)} permissions assigned
              </div>
            </article>
          )) : <p style={{ color: "#9baec8" }}>No store Admin or Manager accounts found.</p>}
        </div>
      </section>
    </main>
  );
}
