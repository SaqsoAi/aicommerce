"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  accessRequest,
  buttonStyle,
  fieldStyle,
  panelStyle,
  type AccessCatalog,
  type Permission,
} from "@/components/access-governance/access-governance.api";

export default function PermissionsPage() {
  const [catalog, setCatalog] = useState<AccessCatalog>({
    userRoles: [],
    roles: [],
    permissions: [],
    tenants: [],
  });
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
  });
  const [editing, setEditing] = useState<Permission | null>(null);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setCatalog(await accessRequest<AccessCatalog>("/catalog"));
  }, []);

  useEffect(() => {
    void load().catch((reason) =>
      setError(reason instanceof Error ? reason.message : String(reason)),
    );
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog.permissions;
    return catalog.permissions.filter((permission) =>
      `${permission.code} ${permission.name} ${permission.description || ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [catalog.permissions, query]);

  async function run(
    action: () => Promise<unknown>,
    success: string,
  ) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await action();
      setMessage(success);
      setEditing(null);
      setForm({ code: "", name: "", description: "" });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardLayout>
      <main style={{ padding: 24, color: "#eef6ff" }}>
        <p style={{ color: "#38bdf8", fontWeight: 900 }}>
          SUPER ADMIN / ACCESS GOVERNANCE
        </p>
        <h1>Permission Management</h1>
        <p style={{ color: "#9fb0c8", maxWidth: 850 }}>
          Create platform permission codes, edit descriptions and verify which
          roles currently own each capability.
        </p>

        {error ? (
          <div style={{ ...panelStyle, borderColor: "#ef4444", color: "#fecaca", marginTop: 14 }}>
            {error}
          </div>
        ) : null}
        {message ? (
          <div style={{ ...panelStyle, borderColor: "#10b981", color: "#a7f3d0", marginTop: 14 }}>
            {message}
          </div>
        ) : null}

        <section style={{ ...panelStyle, marginTop: 18 }}>
          <h2>{editing ? "Edit Permission" : "Create Permission"}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <input
              style={fieldStyle}
              value={editing?.code ?? form.code}
              disabled={Boolean(editing)}
              placeholder="product.create"
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
            />
            <input
              style={fieldStyle}
              value={editing?.name ?? form.name}
              placeholder="Product Create"
              onChange={(event) =>
                editing
                  ? setEditing({ ...editing, name: event.target.value })
                  : setForm({ ...form, name: event.target.value })
              }
            />
            <input
              style={fieldStyle}
              value={editing?.description ?? form.description}
              placeholder="Description"
              onChange={(event) =>
                editing
                  ? setEditing({
                      ...editing,
                      description: event.target.value,
                    })
                  : setForm({
                      ...form,
                      description: event.target.value,
                    })
              }
            />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button
              style={buttonStyle}
              disabled={busy}
              onClick={() =>
                void run(
                  () =>
                    editing
                      ? accessRequest(`/permissions/${editing.id}`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            name: editing.name,
                            description: editing.description,
                          }),
                        })
                      : accessRequest("/permissions", {
                          method: "POST",
                          body: JSON.stringify(form),
                        }),
                  editing ? "Permission updated." : "Permission created.",
                )
              }
            >
              {editing ? "Save Permission" : "Create Permission"}
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
              <h2 style={{ margin: 0 }}>Permission Catalog</h2>
              <p style={{ color: "#9fb0c8" }}>
                {visible.length} of {catalog.permissions.length} permissions
              </p>
            </div>
            <input
              style={{ ...fieldStyle, maxWidth: 360 }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search permission..."
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: 850, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#9fb0c8" }}>
                  <th style={{ padding: 10 }}>Code</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Role Usage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((permission) => {
                  const roles = catalog.roles.filter((role) =>
                    role.permissionCodes.includes(permission.code),
                  );
                  return (
                    <tr key={permission.id} style={{ borderTop: "1px solid rgba(148,163,184,.15)" }}>
                      <td style={{ padding: 10, fontFamily: "monospace", color: "#67e8f9" }}>
                        {permission.code}
                      </td>
                      <td>{permission.name}</td>
                      <td>{permission.description || "—"}</td>
                      <td>{roles.map((role) => role.name).join(", ") || "Not assigned"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={buttonStyle} onClick={() => setEditing(permission)}>
                            Edit
                          </button>
                          <button
                            style={{ ...buttonStyle, borderColor: "#ef4444" }}
                            disabled={busy || roles.length > 0}
                            onClick={() => {
                              if (!window.confirm(`Delete ${permission.code}?`)) return;
                              void run(
                                () =>
                                  accessRequest(`/permissions/${permission.id}`, {
                                    method: "DELETE",
                                  }),
                                "Permission deleted.",
                              );
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}
