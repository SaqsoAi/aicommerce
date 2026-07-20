// PHASE_CLIENT_AUTH_LOGIN_REFERENCE_STYLE_DEV_PATCH
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
type OtpProvider = "phone" | "whatsapp";

export default function AuthModal({ initialMode = "login" }: { initialMode?: Mode }) {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>(initialMode);
  const [otpProvider, setOtpProvider] = useState<OtpProvider>("phone");
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

  const requestedReturnUrl = searchParams.get("returnUrl");
  const redirectTo = requestedReturnUrl?.startsWith("/") && !requestedReturnUrl.startsWith("//")
    ? requestedReturnUrl
    : "/account";

  const completeLogin = (data: any) => {
    if (!data?.token || !data?.user) {
      toast.error("Login token missing. Please try again.");
      return;
    }

    login(data.user, data.token);

    toast.success("Welcome to SAQSO");
    window.location.assign(redirectTo);
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
      completeLogin(await registerUser(name, email, password));
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
      setOtpSecondsLeft(120);
      toast.success(otpProvider === "whatsapp" ? "WhatsApp OTP sent" : "Phone OTP sent");
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

  const openOtp = (provider: OtpProvider) => {
    setOtpProvider(provider);
    setOtp("");
    setOtpSent(false);
    setOtpSecondsLeft(0);
    setMode("phone");
  };

  const inputClass =
    "h-[52px] w-full rounded-full border border-white/15 bg-black/35 px-5 text-sm font-semibold text-white outline-none placeholder:text-white/45 transition focus:border-white/35 focus:ring-2 focus:ring-white/10";
  const primaryClass =
    "h-[52px] w-full rounded-full bg-white px-5 font-black text-black shadow-[0_14px_40px_rgba(255,255,255,.10)] transition hover:-translate-y-0.5 hover:bg-zinc-200 disabled:opacity-60";
  const tabBase =
    "h-[46px] rounded-full border text-sm font-black transition";

  return (
    <section className="w-full max-w-md rounded-[24px] border border-white/12 bg-[#181818]/95 p-4 text-white shadow-2xl backdrop-blur-2xl transition-colors duration-200 motion-reduce:transition-none sm:rounded-[30px] sm:p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[30px]">
          {mode === "register"
            ? "Create an account"
            : mode === "phone"
              ? otpProvider === "whatsapp"
                ? "Continue with WhatsApp"
                : "Continue with phone"
              : "Log in or sign up"}
        </h1>

        <p className="mx-auto mt-3 max-w-[310px] text-sm font-semibold leading-6 text-white/75 sm:mt-4">
          {mode === "phone"
            ? "Get a one-time verification code by phone or WhatsApp."
            : "Use your account for faster checkout, order tracking, rewards, and saved looks."}
        </p>
      </div>

      {mode === "login" && (
        <SocialLoginButtons
          onPhoneClick={() => openOtp("phone")}
          onWhatsappClick={() => openOtp("whatsapp")}
        />
      )}

      {mode === "login" && (
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/45">Or</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>
      )}

      {mode === "phone" ? (
        <div className="mt-7 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => openOtp("phone")}
              className={`${tabBase} ${
                otpProvider === "phone"
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-[#202020] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              Phone
            </button>
            <button
              type="button"
              onClick={() => openOtp("whatsapp")}
              className={`${tabBase} ${
                otpProvider === "whatsapp"
                  ? "border-white bg-white text-black"
                  : "border-white/15 bg-[#202020] text-white hover:bg-[#2a2a2a]"
              }`}
            >
              WhatsApp
            </button>
          </div>

          <input
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setOtp("");
              setOtpSent(false);
              setOtpSecondsLeft(0);
            }}
            placeholder="+880 phone number"
            className={inputClass}
          />

          {otpSent && (
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              placeholder="Enter OTP"
              className={inputClass}
            />
          )}

          {otpSent && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-white/60">
              {otpSecondsLeft > 0 ? (
                <span>
                  OTP expires in <b className="text-white">{formatOtpTime(otpSecondsLeft)}</b>
                </span>
              ) : (
                <button
                  type="button"
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
            type="button"
            onClick={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={loading || (otpSent && otp.trim().length < 4)}
            className={primaryClass}
          >
            {loading ? "Please wait..." : otpSent ? "Verify OTP" : `Send ${otpProvider === "whatsapp" ? "WhatsApp" : "Phone"} OTP`}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {mode === "register" && (
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className={inputClass}
            />
          )}

          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            type="email"
            className={inputClass}
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            className={inputClass}
          />

          {mode === "login" && <div className="-mt-1 text-right"><a href="/forgot-password" className="text-xs font-bold text-white/70 underline underline-offset-4 hover:text-white">Forgot password?</a></div>}

          <button
            type="button"
            onClick={mode === "register" ? handleRegister : handleEmailLogin}
            disabled={loading}
            className={primaryClass}
          >
            {loading ? "Please wait..." : mode === "register" ? "Create Account" : "Continue"}
          </button>
        </div>
      )}

      <div className="mt-6 text-center text-sm text-white/55">
        {mode === "register" ? (
          <button type="button" onClick={() => setMode("login")} className="font-bold text-white">
            Already have an account? Login
          </button>
        ) : mode === "phone" ? (
          <button type="button" onClick={() => setMode("login")} className="font-bold text-white">
            Back to login
          </button>
        ) : (
          <button type="button" onClick={() => setMode("register")} className="font-bold text-white">
            New to SAQSO? Create account
          </button>
        )}
      </div>

      <p className="mt-5 text-center text-[11px] leading-5 text-white/45">Secure sign-in · Your password and OTP are never shown to store staff.</p>
      <div className="mt-4 flex justify-center gap-4 text-xs font-semibold text-white/50 sm:mt-7">
        <a href="/terms" className="underline underline-offset-4 hover:text-white">Terms of Use</a>
        <span>|</span>
        <a href="/privacy" className="underline underline-offset-4 hover:text-white">Privacy Policy</a>
      </div>
    </section>
  );
}
