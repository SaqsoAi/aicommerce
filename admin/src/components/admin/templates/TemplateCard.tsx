"use client";

import { useState } from "react";

type Template = {
  id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
};

type Props = {
  template: Template;
};

export default function TemplateCard({ template }: Props) {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/templates/activate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            templateId: template.id,
            storeId: "default-store", // later dynamic হবে
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to activate template");
      }

      alert("Template activated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`border rounded-xl p-5 shadow-sm transition ${
        template.isActive
          ? "border-green-500 bg-green-50"
          : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      }`}
    >
      {/* TITLE */}
      <h2 className="text-xl font-semibold capitalize">
        {template.name}
      </h2>

      {/* SLUG */}
      {template.slug && (
        <p className="text-sm text-gray-500 mt-1">
          {template.slug}
        </p>
      )}

      {/* STATUS */}
      <div className="mt-3">
        {template.isActive ? (
          <span className="text-green-600 font-medium">
            Active
          </span>
        ) : (
          <span className="text-gray-500">
            Inactive
          </span>
        )}
      </div>

      {/* ACTION */}
      <button
        onClick={handleActivate}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded-lg text-white transition ${
          template.isActive
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        {loading
          ? "Activating..."
          : template.isActive
          ? "Activated"
          : "Activate"}
      </button>
    </div>
  );
}