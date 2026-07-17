"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const roles = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "INVENTORY",
  "MARKETING",
  "SUPPORT",
  "WAREHOUSE_MANAGER",
  "DELIVERY_MANAGER",
  "FINANCE_MANAGER",
  "CUSTOMER",
];

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
  });

  const load = async () => {
    const res = await fetch(`${API}/super-admin/users`, { cache: "no-store" });
    const data = await res.json();
    setUsers(data.users || []);
  };

  const createUser = async () => {
    const res = await fetch(`${API}/super-admin/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "Create failed");
      return;
    }

    setForm({ name: "", email: "", phone: "", password: "", role: "ADMIN" });
    await load();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    await fetch(`${API}/super-admin/users/${id}`, { method: "DELETE" });
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <h1 className="text-2xl font-bold">Super Admin User Management</h1>
      <p className="mb-5 text-sm opacity-70">
        Create Admin/Staff/Manager users, assign role, reset later from same API.
      </p>

      <section className="mb-6 grid gap-3 rounded-2xl border bg-white p-5 dark:bg-slate-900 md:grid-cols-5">
        <input className="rounded-lg border p-2 dark:bg-slate-950" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input className="rounded-lg border p-2 dark:bg-slate-950" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <input className="rounded-lg border p-2 dark:bg-slate-950" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
        <input className="rounded-lg border p-2 dark:bg-slate-950" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <select className="rounded-lg border p-2 dark:bg-slate-950" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
          {roles.map((role)=><option key={role} value={role}>{role}</option>)}
        </select>
        <button onClick={createUser} className="rounded-xl bg-black px-5 py-2 text-white dark:bg-white dark:text-black md:col-span-5">
          Create User
        </button>
      </section>

      <section className="rounded-2xl border bg-white p-5 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b text-left opacity-70">
                <th className="py-2">Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id || i} className="border-b last:border-0">
                  <td className="py-3">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
                  <td>
                    <button onClick={()=>deleteUser(user.id)} className="rounded-lg border px-3 py-1 hover:bg-red-50 dark:hover:bg-red-950">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}