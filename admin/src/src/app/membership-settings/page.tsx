"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";

import { useEffect, useState } from "react";

import {
  getMembershipSettings,
  updateMembershipSettings,
} from "@/services/membership-settings.service";

export default function MembershipSettingsPage() {
  const [activationPercent, setActivationPercent] = useState(75);

  useEffect(() => {
    getMembershipSettings().then((data: any) => {
      if (data?.activationPercent) {
        setActivationPercent(data.activationPercent);
      }
    });
  }, []);

  const save = async () => {
    await updateMembershipSettings({
      activationPercent,
    });

    alert("Membership Settings Updated");
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-black mb-6">Membership Settings</h1>

        <div className="max-w-xl rounded-3xl border p-6">
          <label className="block mb-2">Recommendation Trigger %</label>

          <select
            value={activationPercent}
            onChange={(e) => setActivationPercent(Number(e.target.value))}
            className="w-full border rounded-xl p-3"
          >
            <option value={70}>70%</option>
            <option value={75}>75%</option>
            <option value={80}>80%</option>
            <option value={85}>85%</option>
            <option value={90}>90%</option>
          </select>

          <button
            onClick={save}
            className="mt-4 px-6 py-3 rounded-xl bg-black text-white"
          >
            Save
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
