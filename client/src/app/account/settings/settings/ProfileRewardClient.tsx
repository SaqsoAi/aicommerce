"use client";

import { useState } from "react";
import { AccountForm } from "../_components/AccountClientUi";

export default function ProfileRewardClient() {
  const [savedName, setSavedName] = useState("");

  async function saveProfile(data: Record<string, FormDataEntryValue>) {
    const displayName = `${String(data.firstName || "").trim()} ${String(data.lastName || "").trim()}`.trim();
    const response = await fetch("/api/backend/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName,
        phone: String(data.phone || "").trim() || null,
        avatarUrl: String(data.avatarUrl || "").trim() || null,
        dateOfBirth: String(data.dateOfBirth || "").trim() || null,
        gender: String(data.gender || "").trim() || null,
      }),
    });
    const payload = await response.json();
    if (!response.ok || !payload?.success) throw new Error(payload?.message || "Profile save failed");
    setSavedName(payload.data?.displayName || displayName);
  }

  return (
    <>
      <AccountForm
        title="Customer Profile"
        submitLabel="Save Profile"
        fields={[
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "phone", label: "Phone", placeholder: "+880..." },
          { name: "avatarUrl", label: "Avatar URL", placeholder: "https://..." },
          { name: "dateOfBirth", label: "Date of Birth", type: "date" },
          { name: "gender", label: "Gender", options: ["Prefer not to say", "Male", "Female", "Other"] },
        ]}
        onComplete={saveProfile}
      />
      {savedName ? <p className="mt-3 text-sm text-emerald-300">Profile updated for {savedName}.</p> : null}
    </>
  );
}
