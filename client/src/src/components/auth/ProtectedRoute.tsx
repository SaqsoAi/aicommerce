"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/providers/AuthProvider";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {

  const router =
    useRouter();

  const { token } =
    useAuth();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (!mounted) return;

    const savedToken =
      localStorage.getItem(
        "token"
      );

    if (
      !token &&
      !savedToken
    ) {
      router.push(
        "/login"
      );
    }

  }, [
    token,
    mounted,
    router,
  ]);

  if (!mounted) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (
    !token &&
    !localStorage.getItem(
      "token"
    )
  ) {
    return (
      <div className="p-10">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}


