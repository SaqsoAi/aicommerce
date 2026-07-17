"use client";

import { useState } from "react";

export default function TemplateCard({ template }: any) {
  const [loading, setLoading] = useState(false);

  const activateTemplate = async () => {
    setLoading(true);

    await fetch(
      `http://localhost:5000/api/templates/activate/${template.slug}`,
      {
        method: "PUT",
      }
    );

    setLoading(false);
    window.location.reload();
  };

  return (
    <div className="bg-white shadow rounded-2xl p-5">
      <h2 className="text-xl font-bold">
        {template.name}
      </h2>

      <p className="text-sm text-gray-500">
        Version: {template.version || "1.0.0"}
      </p>

      <div className="flex gap-3 mt-5">
        <button
          onClick={activateTemplate}
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          {loading ? "Activating..." : "Activate"}
        </button>

        <button className="border px-4 py-2 rounded-lg">
          Preview
        </button>
      </div>
    </div>
  );
}

