"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import OtpVerificationPanel from "@/components/messaging/OtpVerificationPanel";
import type { OtpPurpose } from "@/services/messaging.service";

const allowedPurposes: OtpPurpose[] = [
  "REGISTRATION",
  "LOGIN",
  "FORGOT_PASSWORD",
  "CHECKOUT",
];

function OtpVerificationContent() {
  const searchParams = useSearchParams();
  const requestedPurpose = String(
    searchParams.get("purpose") || "REGISTRATION",
  ).toUpperCase() as OtpPurpose;

  const purpose = allowedPurposes.includes(requestedPurpose)
    ? requestedPurpose
    : "REGISTRATION";

  return (
    <OtpVerificationPanel
      purpose={purpose}
      title="Verify Your Phone"
      description="OTP verification is enabled for registration and forgot password flows."
    />
  );
}

export default function OtpVerificationPage() {
  return (
    <main className="min-min-min-h-screen bg-zinc-50 p-6 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <Suspense
          fallback={
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
              Loading OTP verification...
            </div>
          }
        >
          <OtpVerificationContent />
        </Suspense>
      </div>
    </main>
  );
}


