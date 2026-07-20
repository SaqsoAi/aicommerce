"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  accessRequest,
  buttonStyle,
  fieldStyle,
  panelStyle,
  type AccessCatalog,
} from "@/components/access-governance/access-governance.api";

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  permissions?: string[] | null;
  tenantId?: string | null;
  storeId?: string | null;
  emailVerified: boolean;
  tenant?: { id: string; name: string } | null;
  store?: { id: string; name: string } | null;
};

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "ADMIN",
  permissions: [] as string[],
  tenantId: "",
  storeId: "",
  emailVerified: false,
};

export default function SuperAdminUsersPage() {
  const [catalog, setCatalog] = useState<AccessCatalog>({
    userRoles: [],
    roles: [],
    permissions: [],
    tenants: [],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<User | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [nextCatalog, nextUsers] = await Promise.all([
      accessRequest<AccessCatalog>("/catalog"),
      accessRequest<User[]>("/users"),
    ]);
    setCatalog(nextCatalog);
    setUsers(nextUsers);
  }, []);

  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, [load]);

  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter && user.role !== roleFilter) return false;
      if (!needle) return true;
      return `${user.name} ${user.email} ${user.phone || ""}`
        .toLowerCase()
        .includes(needle);
    });
  }, [users, query, roleFilter]);

  const activeTenantId = editing?.tenantId || form.tenantId;
  const selectedTenant = catalog.tenants.find(
    (tenant) => tenant.id === activeTenantId,
  );

  const activeRole = editing?.role || form.role;
  const rolePreset =
    catalog.roles.find((role) => role.name === activeRole)?.permissionCodes ||
    [];

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  const currentPermissions = editing
    ? editing.permissions || []
    : form.permissions;

  function setPermissions(value: string[]) {
    if (editing) setEditing({ ...editing, permissions: value });
    else setForm({ ...form, permissions: value });
  }

  function togglePermission(code: string) {
    setPermissions(
      currentPermissions.includes(code)
        ? currentPermissions.filter((item) => item !== code)
        : [...currentPermissions, code],
    );
  }

  return (
    <DashboardLayout>
      <main style={{ padding: 24, color: "#eef6ff" }}>
        <p style={{ color: "#38bdf8", fontWeight: 900 }}>
          SUPER ADMIN / USER GOVERNANCE
        </p>
        <h1>User, Role & Permission Management</h1>
        <p style={{ color: "#9fb0c8", maxWidth: 900 }}>
          Create platform or store users, bind Tenant/Store scope, assign a role,
          add direct permission overrides and reset passwords.
        </p>

        {error ? <div style={{ ...panelStyle, borderColor: "#ef4444", color: "#fecaca" }}>{error}</div> : null}
        {message ? <div style={{ ...panelStyle, borderColor: "#10b981", color: "#a7f3d0" }}>{message}</div> : null}

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <h2>{editing ? `Edit ${editing.name}` : "Create New User"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}>
            <input
              style={fieldStyle}
              value={editing?.name ?? form.name}
              placeholder="Full name"
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, name: event.target.value })
                  : setForm({ ...form, name: event.target.value })
              }
            />
            <input
              style={fieldStyle}
              value={editing?.email ?? form.email}
              disabled={Boolean(editing)}
              placeholder="Email"
              type="email"
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
            <input
              style={fieldStyle}
              value={editing?.phone ?? form.phone}
              placeholder="Phone"
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, phone: event.target.value })
                  : setForm({ ...form, phone: event.target.value })
              }
            />
            {!editing ? (
              <input
                style={fieldStyle}
                value={form.password}
                placeholder="Temporary password (8+)"
                type="password"
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
              />
            ) : null}
            <select
              style={fieldStyle}
              value={activeRole}
              onChange={(event) => {
                const role = event.target.value;
                const preset =
                  catalog.roles.find((item) => item.name === role)
                    ?.permissionCodes || [];
                if (editing) {
                  setEditing({ ...editing, role, permissions: preset });
                } else {
                  setForm({ ...form, role, permissions: preset });
                }
              }}
            >
              {catalog.userRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              style={fieldStyle}
              value={activeTenantId || ""}
              onChange={(event) => {
                const tenantId = event.target.value;
                if (editing) setEditing({ ...editing, tenantId, storeId: "" });
                else setForm({ ...form, tenantId, storeId: "" });
              }}
            >
              <option value="">Platform-wide / no tenant</option>
              {catalog.tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </select>
            <select
              style={fieldStyle}
              value={editing?.storeId || form.storeId}
              disabled={!selectedTenant}
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, storeId: event.target.value })
                  : setForm({ ...form, storeId: event.target.value })
              }
            >
              <option value="">No specific store</option>
              {(selectedTenant?.stores || []).map((store) => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            <label style={{ display: "flex", gap: 9, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={editing?.emailVerified ?? form.emailVerified}
                onChange={(event) =>
                  editing
                    ? setEditing({ ...editing, emailVerified: event.target.checked })
                    : setForm({ ...form, emailVerified: event.target.checked })
                }
              />
              Email verified
            </label>
          </div>

          <div style={{ marginTop: 16, borderTop: "1px solid rgba(148,163,184,.15)", paddingTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0 }}>Direct Permission Overrides</h3>
                <p style={{ color: "#9fb0c8" }}>
                  Role preset: {rolePreset.length}; selected direct permissions: {currentPermissions.length}
                </p>
              </div>
              <button style={buttonStyle} onClick={() => setPermissions(rolePreset)}>
                Apply {activeRole} Preset
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8 }}>
              {catalog.permissions.map((permission) => (
                <label key={permission.id} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={currentPermissions.includes(permission.code)}
                    onChange={() => togglePermission(permission.code)}
                  />
                  <span>
                    <b>{permission.name}</b>
                    <small style={{ display: "block", color: "#9fb0c8" }}>{permission.code}</small>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button
              style={buttonStyle}
              disabled={busy}
              onClick={() =>
                void run(
                  () =>
                    editing
                      ? accessRequest(`/users/${editing.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            name: editing.name,
                            phone: editing.phone,
                            role: editing.role,
                            permissions: editing.permissions || [],
                            tenantId: editing.tenantId || null,
                            storeId: editing.storeId || null,
                            emailVerified: editing.emailVerified,
                          }),
                        })
                      : accessRequest("/users", {
                          method: "POST",
                          body: JSON.stringify(form),
                        }),
                  editing ? "User updated." : "User created.",
                )
              }
            >
              {editing ? "Save User" : "Create User"}
            </button>
            {editing ? (
              <button style={buttonStyle} onClick={() => setEditing(null)}>
                Cancel
              </button>
            ) : null}
          </div>
        </section>

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0 }}>Users</h2>
              <p style={{ color: "#9fb0c8" }}>{visibleUsers.length} records</p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                style={{ ...fieldStyle, maxWidth: 300 }}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users"
              />
              <select
                style={{ ...fieldStyle, maxWidth: 210 }}
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value)}
              >
                <option value="">All roles</option>
                {catalog.userRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 1100, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#9fb0c8" }}>
                  <th style={{ padding: 10 }}>User</th>
                  <th>Role</th>
                  <th>Scope</th>
                  <th>Direct Permissions</th>
                  <th>Verified</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id} style={{ borderTop: "1px solid rgba(148,163,184,.15)" }}>
                    <td style={{ padding: 10 }}>
                      <b>{user.name}</b>
                      <small style={{ display: "block", color: "#9fb0c8" }}>{user.email}</small>
                    </td>
                    <td>{user.role}</td>
                    <td>{user.tenant?.name || "Platform"} / {user.store?.name || "All stores"}</td>
                    <td>{user.permissions?.length || 0}</td>
                    <td>{user.emailVerified ? "Yes" : "No"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button style={buttonStyle} onClick={() => setEditing(user)}>
                          Edit
                        </button>
                        <button
                          style={buttonStyle}
                          onClick={() => {
                            const next = window.prompt("New password (8+ characters)");
                            if (!next) return;
                            void run(
                              () =>
                                accessRequest(`/users/${user.id}/reset-password`, {
                                  method: "PATCH",
                                  body: JSON.stringify({ password: next }),
                                }),
                              "Password reset.",
                            );
                          }}
                        >
                          Reset Password
                        </button>
                        <button
                          style={{ ...buttonStyle, borderColor: "#ef4444" }}
                          onClick={() => {
                            if (!window.confirm(`Delete ${user.email}?`)) return;
                            void run(
                              () =>
                                accessRequest(`/users/${user.id}`, {
                                  method: "DELETE",
                                }),
                              "User deleted.",
                            );
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
