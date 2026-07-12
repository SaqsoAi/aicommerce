"use client";

import { useMemo, useState } from "react";
import { AccountForm, ProfileCompletionRewardPopup } from "../_components/AccountClientUi";

const REQUIRED_FIELDS = ["firstName", "lastName", "email", "phone", "whatsapp", "signupProvider"];
const PROFILE_COMPLETION_REWARD_POINTS = 100;

export default function ProfileRewardClient() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [balance, setBalance] = useState(2450);

  const fields = useMemo(
    () => [
      { name: "firstName", label: "First Name", placeholder: "Test" },
      { name: "lastName", label: "Last Name", placeholder: "Customer" },
      { name: "email", label: "Gmail / Email", type: "email", placeholder: "customer@gmail.com" },
      { name: "phone", label: "Phone", placeholder: "+880..." },
      { name: "whatsapp", label: "WhatsApp", placeholder: "+880 WhatsApp number" },
      { name: "avatar", label: "Avatar URL / Facebook Sync", placeholder: "Local upload URL or synced avatar" },
      { name: "signupProvider", label: "Signup Provider", options: ["Email/Gmail", "Facebook", "Phone", "WhatsApp"] },
      { name: "gender", label: "Gender", options: ["Prefer not to say", "Male", "Female", "Other"] },
    ],
    []
  );

  function handleComplete(data: Record<string, FormDataEntryValue>) {
    const complete = REQUIRED_FIELDS.every((key) => String(data[key] || "").trim().length > 0);

    if (complete && !claimed) {
      const newBalance = balance + PROFILE_COMPLETION_REWARD_POINTS;
      setBalance(newBalance);
      setClaimed(true);
      setPopupOpen(true);
    }
  }

  return (
    <>
      <AccountForm
        title="Customer Profile"
        submitLabel="Save Profile"
        fields={fields}
        onComplete={handleComplete}
      />

      <div className="mt-4 rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5 text-sm text-amber-50">
        Complete required profile fields to earn {PROFILE_COMPLETION_REWARD_POINTS} Style Points.
        Admin-configured reward value will replace this client fallback after backend binding.
      </div>

      <ProfileCompletionRewardPopup
        open={popupOpen}
        points={PROFILE_COMPLETION_REWARD_POINTS}
        balance={balance}
        onClose={() => setPopupOpen(false)}
      />
    </>
  );
}