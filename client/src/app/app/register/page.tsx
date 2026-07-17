"use client";

import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

import { Suspense } from "react";
import AuthBackdrop from "@/components/auth/modal/AuthBackdrop";
import AuthModal from "@/components/auth/modal/AuthModal";

export default function RegisterPage() {
  return (
    <AuthBackdrop>
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <AuthModal initialMode="register" />
      </Suspense>
    </AuthBackdrop>
  );
}


