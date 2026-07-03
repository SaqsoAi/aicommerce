"use client";

import { useState } from "react";

import { sendOtp, verifyOtp, type OtpPurpose } from "@/services/messaging.service";

type Props = {
  purpose: OtpPurpose;
  title?: string;
  description?: string;
  onVerified?: (phone: string) => void;
};

export default function OtpVerificationPanel({
  purpose,
  title = "Phone Verification",
  description = "Enter your phone number and verify with OTP.",
  onVerified,
}: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!phone.trim()) {
      alert("Phone number is required");
      return;
    }

    try {
      setLoading(true);

      const result = await sendOtp(phone.trim(), purpose);

      if (!result.success) {
        alert(result.message || "OTP send failed");
        return;
      }

      setSent(true);
      alert("OTP sent");
    } catch (error) {
      console.error(error);
      alert("OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (!phone.trim() || !otp.trim()) {
      alert("Phone and OTP are required");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyOtp(phone.trim(), otp.trim(), purpose);

      if (!result.success) {
        alert(result.message || "OTP verification failed");
        return;
      }

      setVerified(true);
      onVerified?.(phone.trim());
      alert("OTP verified");
    } catch (error) {
      console.error(error);
      alert("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-zinc-500">
          {purpose.replace("_", " ")}
        </p>
        <h2 className="mt-2 text-2xl font-black text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="8801XXXXXXXXX"
          className="rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />

        <button
          type="button"
          disabled={loading || verified}
          onClick={send}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {sent ? "Resend OTP" : "Send OTP"}
        </button>

        {sent && (
          <>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              className="rounded-xl border border-zinc-300 bg-white p-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />

            <button
              type="button"
              disabled={loading || verified}
              onClick={verify}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {verified ? "Verified" : "Verify OTP"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
