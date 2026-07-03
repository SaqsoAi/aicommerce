"use client";

import { useEffect, useState } from "react";
import { getVirtualTryOnJobs } from "@/services/virtual-tryon.service";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api";

const allSizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "3XL",
];

export default function AIVirtualTryOnPage() {
  const [jobs,setJobs] = useState<any[]>([]);
  const [sizes,setSizes] = useState<string[]>(allSizes);

  useEffect(() => {
    load();
    loadSettings();
  }, []);

  async function load() {
    const data = await getVirtualTryOnJobs();
    setJobs(data.data || []);
  }

  async function loadSettings() {
    const res = await fetch(`${API}/virtual-tryon/settings`);
    const data = await res.json();
    setSizes(data.data?.sizes || allSizes);
  }

  async function saveSettings() {
    await fetch(`${API}/virtual-tryon/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sizes }),
    });

    alert("Virtual Try-On sizes saved");
  }

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size)
        ? prev.filter((x) => x !== size)
        : [...prev, size]
    );
  }

  const pending = jobs.filter((x) => x.status === "PENDING").length;
  const completed = jobs.filter((x) => x.status === "COMPLETED").length;
  const failed = jobs.filter((x) => x.status === "FAILED").length;

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold">
        AI Virtual Try-On
      </h1>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="border rounded-xl p-4">
          <div>Total Jobs</div>
          <div className="text-3xl">{jobs.length}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div>Pending</div>
          <div className="text-3xl">{pending}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div>Completed</div>
          <div className="text-3xl">{completed}</div>
        </div>

        <div className="border rounded-xl p-4">
          <div>Failed</div>
          <div className="text-3xl">{failed}</div>
        </div>
      </div>

      <div className="mt-8 border rounded-xl p-5">
        <h2 className="text-xl font-semibold">
          Virtual Fitting Room Sizes
        </h2>

        <div className="flex flex-wrap gap-3 mt-4">
          {allSizes.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-xl border ${
                sizes.includes(size)
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          onClick={saveSettings}
          className="mt-5 px-5 py-3 rounded-xl bg-black text-white"
        >
          Save Size Setting
        </button>
      </div>

      <div className="mt-8 border rounded-xl">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Provider</th>
              <th>Created</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.id}</td>
                <td>{job.status}</td>
                <td>{job.provider}</td>
                <td>{job.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
