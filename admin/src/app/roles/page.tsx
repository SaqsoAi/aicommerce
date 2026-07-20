"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  accessRequest,
  buttonStyle,
  fieldStyle,
  panelStyle,
  type AccessCatalog,
  type Role,
} from "@/components/access-governance/access-governance.api";

export default function RolesPage() {
  const [catalog, setCatalog] = useState<AccessCatalog>({
    userRoles: [],
    roles: [],
    permissions: [],
    tenants: [],
  });
  const [selected, setSelected] = useState<Role | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const next = await accessRequest<AccessCatalog>("/catalog");
    setCatalog(next);
    setSelected((current) =>
      current
        ? next.roles.find((role) => role.id === current.id) || null
        : next.roles[0] || null,
    );
  }, []);

  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, [load]);

  useEffect(() => {
    setSelectedCodes(selected?.permissionCodes || []);
  }, [selected]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof catalog.permissions>();
    for (const permission of catalog.permissions) {
      if (
        query &&
        !`${permission.code} ${permission.name}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ) {
        continue;
      }
      const group = permission.code.split(".")[0] || "other";
      map.set(group, [...(map.get(group) || []), permission]);
    }
    return [...map.entries()];
  }, [catalog.permissions, query]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      setForm({ name: "", description: "" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  function toggle(code: string) {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  }

  return (
    <DashboardLayout>
      <main style={{ padding: 24, color: "#eef6ff" }}>
        <p style={{ color: "#38bdf8", fontWeight: 900 }}>
          SUPER ADMIN / RBAC
        </p>
        <h1>Role Management</h1>
        <p style={{ color: "#9fb0c8" }}>
          Create role records and assign exact platform permission codes.
        </p>

        {error ? <div style={{ ...panelStyle, borderColor: "#ef4444", color: "#fecaca" }}>{error}</div> : null}
        {message ? <div style={{ ...panelStyle, borderColor: "#10b981", color: "#a7f3d0" }}>{message}</div> : null}

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <h2>Create Role</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            <input
              style={fieldStyle}
              value={form.name}
              placeholder="CUSTOM_ROLE"
              onChange={(event) =>
                setForm({ ...form, name: event.target.value.toUpperCase() })
              }
            />
            <input
              style={fieldStyle}
              value={form.description}
              placeholder="Role description"
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
            />
          </div>
          <button
            style={{ ...buttonStyle, marginTop: 12 }}
            disabled={busy || !form.name}
            onClick={() =>
              void run(
                () =>
                  accessRequest("/roles", {
                    method: "POST",
                    body: JSON.stringify(form),
                  }),
                "Role created.",
              )
            }
          >
            Create Role
          </button>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "minmax(250px,.75fr) minmax(0,2fr)", gap: 16, marginTop: 18 }}>
          <aside style={panelStyle}>
            <h2>Roles</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {catalog.roles.map((role) => (
                <button
                  key={role.id}
                  style={{
                    ...buttonStyle,
                    textAlign: "left",
                    borderColor: selected?.id === role.id ? "#38bdf8" : "rgba(148,163,184,.28)",
                  }}
                  onClick={() => setSelected(role)}
                >
                  <b>{role.name}</b>
                  <span style={{ display: "block", color: "#9fb0c8", fontSize: 12 }}>
                    {role.permissionCodes.length} permissions
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section style={panelStyle}>
            {selected ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{selected.name}</h2>
                    <p style={{ color: "#9fb0c8" }}>
                      {selected.description || "No description"}
                    </p>
                  </div>
                  <input
                    style={{ ...fieldStyle, maxWidth: 320 }}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search permissions"
                  />
                </div>

                <div style={{ display: "grid", gap: 14 }}>
                  {groups.map(([group, permissions]) => (
                    <section key={group} style={{ border: "1px solid rgba(148,163,184,.15)", borderRadius: 12, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <b style={{ textTransform: "uppercase", color: "#67e8f9" }}>{group}</b>
                        <button
                          style={buttonStyle}
                          onClick={() =>
                            setSelectedCodes((current) => {
                              const codes = permissions.map((item) => item.code);
                              const all = codes.every((code) => current.includes(code));
                              return all
                                ? current.filter((code) => !codes.includes(code))
                                : [...new Set([...current, ...codes])];
                            })
                          }
                        >
                          Toggle Group
                        </button>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 8, marginTop: 10 }}>
                        {permissions.map((permission) => (
                          <label key={permission.id} style={{ display: "flex", gap: 9, alignItems: "center" }}>
                            <input
                              type="checkbox"
                              checked={selectedCodes.includes(permission.code)}
                              onChange={() => toggle(permission.code)}
                            />
                            <span>
                              <b>{permission.name}</b>
                              <small style={{ display: "block", color: "#9fb0c8" }}>{permission.code}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                  <button
                    style={buttonStyle}
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () =>
                          accessRequest(`/roles/${selected.id}/permissions`, {
                            method: "PUT",
                            body: JSON.stringify({
                              permissionCodes: selectedCodes,
                            }),
                          }),
                        "Role permission matrix saved.",
                      )
                    }
                  >
                    Save Role Permissions
                  </button>
                  <button
                    style={{ ...buttonStyle, borderColor: "#ef4444" }}
                    disabled={busy || catalog.userRoles.includes(selected.name)}
                    onClick={() => {
                      if (!window.confirm(`Delete role ${selected.name}?`)) return;
                      void run(
                        () =>
                          accessRequest(`/roles/${selected.id}`, {
                            method: "DELETE",
                          }),
                        "Role deleted.",
                      );
                    }}
                  >
                    Delete Custom Role
                  </button>
                </div>
              </>
            ) : (
              <p>Select a role.</p>
            )}
          </section>
        </section>
      </main>
    </DashboardLayout>
  );
}
