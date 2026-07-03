"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { useAuth } from "@/providers/AuthProvider";
import {
  loginUser,
  registerUser,
  sendPhoneOtp,
  verifyPhoneOtp,
} from "@/services/auth.service";

type Mode = "login" | "register" | "phone";

export default function AuthModal({ initialMode = "login" }: { initialMode?: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (!otpSent || otpSecondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setOtpSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpSent, otpSecondsLeft]);

  const formatOtpTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const redirectTo = searchParams.get("returnUrl") || "/";

    const completeLogin = (data: any) => {
    if (!data?.token || !data?.user) {
      toast.error("Login token missing. Please try again.");
      return;
    }

    login(data.user, data.token);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("role", data.user?.role || "CUSTOMER");

    toast.success("Welcome to SAQSO");
    window.location.href = redirectTo;
  };

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      const data = await loginUser(email, password);
      completeLogin(data);
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerUser(name, email, password);
      toast.success("Account created. Please login.");
      setMode("login");
    } catch (error) {
      console.error(error);
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      await sendPhoneOtp(phone);
      setOtpSent(true);
      toast.success("OTP sent");
    } catch (error) {
      console.error(error);
      toast.error("OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      const data = await verifyPhoneOtp(phone, otp);
      completeLogin(data);
    } catch (error) {
      console.error(error);
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-md rounded-[2rem] border border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur-2xl dark:bg-zinc-950/95">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
          SAQSO Account
        </p>

        <h1 className="mt-3 text-3xl font-black text-zinc-950 dark:text-white">
          {mode === "register"
            ? "Create your account"
            : mode === "phone"
              ? "Continue with phone"
              : "Welcome back"}
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Login without leaving your shopping journey.
        </p>
      </div>

      <SocialLoginButtons onPhoneClick={() => setMode("phone")} />

      

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Or
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {mode === "phone" ? (
        <div className="space-y-3">
          <input
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setOtp("");
              setOtpSent(false);
              setOtpSecondsLeft(0);
            }}
            placeholder="Phone number"
            className="h-[52px] w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-5 text-white outline-none shadow-inner placeholder:text-white/45 focus:border-white/25"
          />

          {otpSent && (
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              className="h-[52px] w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-5 text-white outline-none shadow-inner placeholder:text-white/45 focus:border-white/25"
            />
          )}

          {otpSent && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-400">
              {otpSecondsLeft > 0 ? (
                <span>
                  OTP expires in{" "}
                  <b className="text-white">{formatOtpTime(otpSecondsLeft)}</b>
                </span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="font-bold text-white underline disabled:opacity-60"
                >
                  Resend OTP
                </button>
              )}
            </div>
          )}

          <button
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={loading || (otpSent && otp.trim().length < 4)}
            className="h-[52px] w-full rounded-[1.35rem] bg-gradient-to-r from-white to-zinc-200 px-5 font-black text-black shadow-[0_14px_40px_rgba(255,255,255,.10)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Please wait..." : otpSent ? "Verify OTP" : "Send OTP"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="h-[52px] w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-5 text-white outline-none shadow-inner placeholder:text-white/45 focus:border-white/25"
            />
          )}

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className="h-[52px] w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-5 text-white outline-none shadow-inner placeholder:text-white/45 focus:border-white/25"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className="h-[52px] w-full rounded-[1.35rem] border border-white/10 bg-white/[0.035] px-5 text-white outline-none shadow-inner placeholder:text-white/45 focus:border-white/25"
          />

          <button
            onClick={mode === "register" ? handleRegister : handleEmailLogin}
            disabled={loading}
            className="h-[52px] w-full rounded-[1.35rem] bg-gradient-to-r from-white to-zinc-200 px-5 font-black text-black shadow-[0_14px_40px_rgba(255,255,255,.10)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Continue"}
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-zinc-500">
        {mode === "register" ? (
          <button onClick={() => setMode("login")} className="font-bold text-zinc-950 dark:text-white">
            Already have an account? Login
          </button>
        ) : (
          <button onClick={() => setMode("register")} className="font-bold text-zinc-950 dark:text-white">
            New to SAQSO? Create account
          </button>
        )}
      </div>
    </section>
  );
}



