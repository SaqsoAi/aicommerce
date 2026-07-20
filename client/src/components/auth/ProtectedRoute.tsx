"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  usePathname,
  useSearchParams,
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

  const { ready, isAuthenticated } =
    useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mounted, setMounted] =
    useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (!mounted || !ready) return;

    if (!isAuthenticated) {
      const query = searchParams.toString();
      const returnUrl = `${pathname}${query ? `?${query}` : ""}`;
      router.replace(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }

  }, [
    ready,
    isAuthenticated,
    mounted,
    router,
    pathname,
    searchParams,
  ]);

  if (!mounted || !ready) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-10">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}


