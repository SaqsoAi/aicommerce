"use client";

import { sendEmailVerification } from "@/services/auth.service";
import toast from "react-hot-toast";

type Props = {
  open: boolean;
  onClose: () => void;
  email?: string;
};

export default function EmailVerificationGate({
  open,
  onClose,
  email,
}: Props) {
  if (!open) return null;

  const sendVerification = async () => {
    try {
      const res = await sendEmailVerification();

      if (res?.data?.verifyUrl) {
        console.log("DEV VERIFY URL:", res.data.verifyUrl);
      }

      toast.success("Verification email sent");
    } catch (error) {
      console.error(error);
      toast.error("Verification email failed");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl">
      <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl dark:bg-zinc-950">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
          Secure Payment Gate
        </p>

        <h2 className="mt-3 text-3xl font-black text-zinc-950 dark:text-white">
          Verify your email
        </h2>

        <p className="mt-3 text-sm text-zinc-500">
          Online payment methods require a verified email address for secure order processing.
        </p>

        {email && (
          <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm font-bold dark:bg-zinc-900 dark:text-white">
            {email}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={sendVerification}
            className="w-full rounded-2xl bg-black px-5 py-3 font-bold text-white dark:bg-white dark:text-black"
          >
            Send Verification Email
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl border px-5 py-3 font-bold dark:border-zinc-800 dark:text-white"
          >
            Continue with COD instead
          </button>
        </div>
      </div>
    </div>
  );
}
