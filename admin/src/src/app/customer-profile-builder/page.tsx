"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useEffect, useState } from "react";

import {
  getCustomerProfileFields,
  createCustomerProfileField,
  deleteCustomerProfileField,
} from "@/services/customer-profile-builder.service";

export default function CustomerProfileBuilderPage() {
  const [fields, setFields] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    label: "",
    type: "TEXT",
  });

  const loadFields = async () => {
    try {
      const data = await getCustomerProfileFields();

      setFields(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFields();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Customer Profile Builder</h1>

          <p className="text-zinc-500">Manage customer account fields</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            placeholder="Field Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="p-4 rounded-2xl border"
          />

          <input
            placeholder="Label"
            value={form.label}
            onChange={(e) =>
              setForm({
                ...form,
                label: e.target.value,
              })
            }
            className="p-4 rounded-2xl border"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm({
                ...form,
                type: e.target.value,
              })
            }
            className="p-4 rounded-2xl border"
          >
            <option>TEXT</option>
            <option>TEXTAREA</option>
            <option>EMAIL</option>
            <option>PHONE</option>
            <option>URL</option>
            <option>DATE</option>
            <option>NUMBER</option>
          </select>
        </div>

        <button
          onClick={async () => {
            await createCustomerProfileField({
              ...form,
            });

            setForm({
              name: "",
              label: "",
              type: "TEXT",
            });

            await loadFields();
          }}
          className="
          px-6
          py-3
          rounded-2xl
          bg-black
          text-white
        "
        >
          Add Field
        </button>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-auto rounded-2xl border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-4 text-left">Name</th>

                  <th className="p-4 text-left">Label</th>

                  <th className="p-4 text-left">Type</th>

                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>

              <tbody>
                {fields.map((field) => (
                  <tr key={field.id} className="border-b">
                    <td className="p-4">{field.name}</td>

                    <td className="p-4">{field.label}</td>

                    <td className="p-4">{field.type}</td>

                    <td className="p-4">
                      <button
                        onClick={async () => {
                          await deleteCustomerProfileField(field.id);

                          await loadFields();
                        }}
                        className="
                        px-4
                        py-2
                        rounded-xl
                        bg-red-600
                        text-white
                      "
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>{" "}
    </DashboardLayout>
  );
}
