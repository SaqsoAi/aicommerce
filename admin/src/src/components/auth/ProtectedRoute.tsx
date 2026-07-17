"use client";

import {
  useEffect,
  useState,
} from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] =
    useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (!token) {
      window.location.href =
        "/login";

      return;
    }

    setReady(true);
  }, []);

  if (!ready)
    return null;

  return <>{children}</>;
}