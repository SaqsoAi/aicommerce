"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { forceUnlockScroll } from "@/lib/scroll-lock";

export default function ScrollLockLifecycle() {
  const pathname = usePathname();
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) forceUnlockScroll();
    mounted.current = true;
  }, [pathname]);

  useEffect(() => {
    const release = () => forceUnlockScroll();
    const onVisibility = () => {
      if (document.visibilityState === "visible" && !document.querySelector('[aria-modal="true"][data-open="true"]')) {
        forceUnlockScroll();
      }
    };

    window.addEventListener("pagehide", release);
    window.addEventListener("beforeunload", release);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("pagehide", release);
      window.removeEventListener("beforeunload", release);
      document.removeEventListener("visibilitychange", onVisibility);
      forceUnlockScroll();
    };
  }, []);

  return null;
}
