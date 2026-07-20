"use client";

import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import { useRef, useState } from "react";
import { loginWithFacebook, loginWithGoogle } from "@/services/auth.service";
import { useAuth } from "@/providers/AuthProvider";

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const btn =
  "group flex h-[52px] w-full items-center justify-between rounded-full border border-white/15 bg-[#202020] px-5 text-[14px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#2a2a2a] active:translate-y-0 disabled:opacity-60";

const loadFacebookSdk = (appId: string) =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("Window not available"));
    if (window.FB) return resolve();

    window.fbAsyncInit = () => {
      window.FB.init({ appId, cookie: true, xfbml: true, version: "v19.0" });
      resolve();
    };

    if (document.getElementById("facebook-jssdk")) {
      let tries = 0;
      const timer = window.setInterval(() => {
        tries++;
        if (window.FB) {
          window.clearInterval(timer);
          resolve();
        }
        if (tries > 40) {
          window.clearInterval(timer);
          reject(new Error("Facebook SDK timeout"));
        }
      }, 200);
      return;
    }

    const script = document.createElement("script");
    script.id = "facebook-jssdk";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Facebook SDK failed"));
    document.body.appendChild(script);
  });

export default function SocialLoginButtons({
  onPhoneClick,
  onWhatsappClick,
}: {
  onPhoneClick?: () => void;
  onWhatsappClick?: () => void;
}) {
  const { login } = useAuth();
  const googleBoxRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const requestedReturnUrl = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("returnUrl")
    : null;
  const redirectTo = requestedReturnUrl?.startsWith("/") && !requestedReturnUrl.startsWith("//")
    ? requestedReturnUrl
    : "/account";

  const completeLogin = (data: any) => {
    const token = data?.token || data?.data?.token;
    const user = data?.user || data?.data?.user || data?.customer || data?.data?.customer;

    if (!token || !user) {
      setError("Login failed: token missing");
      return;
    }

    login(user, token);
    window.location.assign(redirectTo);
  };

  const clickHiddenGoogle = () => {
    setError("");
    setBusy("google");
    const target = googleBoxRef.current?.querySelector("div[role=button]") as HTMLElement | null;
    target?.click();
    window.setTimeout(() => setBusy(""), 1500);
  };

  const handleFacebook = async () => {
    try {
      setError("");
      setBusy("facebook");

      const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
      if (!appId) {
        setError("Facebook App ID missing");
        setBusy("");
        return;
      }

      await loadFacebookSdk(appId);

      window.FB.login(
        function (response: any) {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            setBusy("");
            setError("Facebook login cancelled or blocked.");
            return;
          }

          loginWithFacebook(accessToken)
            .then(completeLogin)
            .catch((err: any) => {
              console.error(err);
              setError(err?.response?.data?.message || err?.response?.data?.error || "Facebook backend login failed");
            })
            .finally(() => setBusy(""));
        },
        { scope: "public_profile,email", return_scopes: true, auth_type: "rerequest" }
      );
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Facebook login failed");
      setBusy("");
    }
  };

  return (
    <div className="mt-7 space-y-3">
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
        <div ref={googleBoxRef} className="absolute left-[-9999px] top-[-9999px] opacity-0">
          <GoogleLogin
            width="320"
            onSuccess={async (response) => {
              try {
                setError("");
                if (!response.credential) {
                  setError("Google login failed");
                  return;
                }
                completeLogin(await loginWithGoogle(response.credential));
              } catch (err: any) {
                console.error(err);
                setError(err?.response?.data?.message || err?.response?.data?.error || "Google backend login failed");
              } finally {
                setBusy("");
              }
            }}
            onError={() => {
              setBusy("");
              setError("Google OAuth origin not allowed.");
            }}
            useOneTap={false}
          />
        </div>

        <button type="button" disabled={busy === "google"} onClick={clickHiddenGoogle} className={btn}>
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white">
              <span className="text-xl font-black text-red-500">G</span>
            </span>
            {busy === "google" ? "Connecting Google..." : "Continue with Google"}
          </span>
          <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-1" />
        </button>
      </GoogleOAuthProvider>

      <button type="button" disabled={busy === "facebook"} onClick={handleFacebook} className={btn}>
        <span className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#1877F2] text-lg font-black text-white">f</span>
          {busy === "facebook" ? "Connecting Facebook..." : "Continue with Facebook"}
        </span>
        <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-1" />
      </button>

      {onWhatsappClick && (
        <button type="button" onClick={onWhatsappClick} className={btn}>
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/15">
              <MessageCircle className="h-5 w-5 text-emerald-400" />
            </span>
            Continue with WhatsApp
          </span>
          <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-1" />
        </button>
      )}

      {onPhoneClick && (
        <button type="button" onClick={onPhoneClick} className={btn}>
          <span className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
              <Phone className="h-5 w-5 text-white" />
            </span>
            Continue with Phone
          </span>
          <ChevronRight className="h-5 w-5 opacity-70 transition group-hover:translate-x-1" />
        </button>
      )}

      {error && (
        <p className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-center text-xs font-bold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
