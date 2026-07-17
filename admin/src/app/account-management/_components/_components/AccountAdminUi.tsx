"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
};

export function AccountAdminShell({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-8 shadow-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-amber-300">{eyebrow}</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{description}</p>
            </div>
            <Link href="/account-management" className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">
              Account Management
            </Link>
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </section>
    </main>
  );
}

export function AccountAdminForm({
  title,
  description,
  fields,
  submitLabel,
}: {
  title: string;
  description: string;
  fields: Field[];
  submitLabel: string;
}) {
  const [status, setStatus] = useState("Ready");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    setStatus("Prepared locally. API binding will be enabled in the integration phase. Payload: " + JSON.stringify(data));
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 shadow-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{field.label}</span>
            {field.options ? (
              <select name={field.name} required={field.required} className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-amber-300">
                {field.options.map((option) => <option key={option}>{option}</option>)}
              </select>
            ) : (
              <input
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                required={field.required}
                className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-amber-300"
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" className="rounded-full bg-white px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-200">
          {submitLabel}
        </button>
        <p className="text-xs text-slate-400">{status}</p>
      </div>
    </form>
  );
}

export function AccountAdminTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, string>>;
}) {
  const keys = rows.length ? Object.keys(rows[0]) : [];
  return (
    <div className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.2em] text-slate-400">
            <tr>{keys.map((key) => <th key={key} className="px-5 py-4">{key}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-white/5">
                {keys.map((key) => <td key={key} className="px-5 py-4 text-slate-300">{row[key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}